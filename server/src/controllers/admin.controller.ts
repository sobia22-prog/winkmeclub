import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';
import { Wallet } from '../models/wallet.model';
import { Trade } from '../models/trade.model';
import { RechargeRequest } from '../models/recharge.model';
import { WithdrawalRequest } from '../models/withdrawal.model';
import { Verification } from '../models/verification.model';
import { Product } from '../models/product.model';
import { Announcement } from '../models/announcement.model';
import { SupportTicket, SupportMessage } from '../models/support.model';
import { Transaction } from '../models/transaction.model';
import { GirlProfile } from '../models/girlProfile.model';
import { WalletService } from '../services/wallet.service';
import { TradeSettlementService } from '../services/tradeSettlement.service';
import { VerificationService } from '../services/verification.service';
import { SupportService } from '../services/support.service';
import { NotificationService } from '../services/notification.service';
import { AuditService } from '../services/audit.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { financialConfig } from '../config/financial.config';
import { generateStaffInvitationCode } from '../utils/staffCode.util';

// Helper to scoping client IDs for STAFF members
const getScopedClientIds = async (req: AuthRequest): Promise<any[] | null> => {
  if (req.user?.role === 'STAFF') {
    const clients = await User.find({ assignedStaff: req.user._id }).select('_id');
    return clients.map((c) => c._id);
  }
  return null;
};

export class AdminController {
  // 1. Dashboard KPIs & Charts Data
  static async getDashboardStats(req: AuthRequest, res: Response) {
    try {
      const isStaff = req.user?.role === 'STAFF';
      const scopedClientIds = await getScopedClientIds(req);

      let userQuery: any = { role: 'USER' };
      let txQuery: any = {};
      let tradeQuery: any = { status: 'PENDING' };
      let rechargeQuery: any = { status: 'APPROVED' };
      let pendingRechargeQuery: any = { status: 'PENDING' };
      let pendingWithdrawalQuery: any = { status: 'PENDING' };
      let pendingVerificationQuery: any = { status: 'PENDING' };

      if (isStaff && scopedClientIds) {
        userQuery.assignedStaff = req.user!._id;
        txQuery.userId = { $in: scopedClientIds };
        tradeQuery.userId = { $in: scopedClientIds };
        rechargeQuery.userId = { $in: scopedClientIds };
        pendingRechargeQuery.userId = { $in: scopedClientIds };
        pendingWithdrawalQuery.userId = { $in: scopedClientIds };
        pendingVerificationQuery.userId = { $in: scopedClientIds };
      }

      const totalUsers = await User.countDocuments(userQuery);
      const activeUsers = await User.countDocuments({ ...userQuery, status: 'ACTIVE' });
      const vipUsers = await User.countDocuments({ ...userQuery, isVIP: true });
      const girlsProfiles = await GirlProfile.countDocuments();

      let wallets;
      if (isStaff && scopedClientIds) {
        wallets = await Wallet.find({ userId: { $in: scopedClientIds } });
      } else {
        wallets = await Wallet.find();
      }

      const totalAvailableFunds = wallets.reduce((sum, w) => sum + (w.availableBalance || 0), 0);
      const totalFrozenFunds = wallets.reduce((sum, w) => sum + (w.frozenBalance || 0), 0);

      const pendingTradesCount = await Trade.countDocuments(tradeQuery);
      const pendingRechargesCount = await RechargeRequest.countDocuments(pendingRechargeQuery);
      const pendingWithdrawalsCount = await WithdrawalRequest.countDocuments(pendingWithdrawalQuery);
      const pendingVerificationsCount = await Verification.countDocuments(pendingVerificationQuery);

      const approvedRecharges = await RechargeRequest.find(rechargeQuery);
      const totalRevenue = approvedRecharges.reduce((sum, r) => sum + (r.amount || 0), 0);

      const recentTransactions = await Transaction.find(txQuery)
        .populate('userId', 'fullName email')
        .sort({ createdAt: -1 })
        .limit(8);

      // Monthly Revenue & New Users Data for the Year (Jan - Dec)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentYear = new Date().getFullYear();

      const monthlyData = await Promise.all(
        months.map(async (monthName, index) => {
          const startDate = new Date(currentYear, index, 1);
          const endDate = new Date(currentYear, index + 1, 0, 23, 59, 59);

          const mRechargeQuery: any = {
            status: 'APPROVED',
            createdAt: { $gte: startDate, $lte: endDate },
          };

          const mUserQuery: any = {
            role: 'USER',
            createdAt: { $gte: startDate, $lte: endDate },
          };

          if (isStaff && scopedClientIds) {
            mRechargeQuery.userId = { $in: scopedClientIds };
            mUserQuery.assignedStaff = req.user!._id;
          }

          const mRecharges = await RechargeRequest.find(mRechargeQuery);
          const revenue = mRecharges.reduce((sum, r) => sum + (r.amount || 0), 0);
          const newUsers = await User.countDocuments(mUserQuery);

          return {
            name: monthName,
            Revenue: revenue,
            NewUsers: newUsers,
          };
        })
      );

      return res.status(200).json({
        success: true,
        stats: {
          totalUsers,
          activeUsers,
          girlsProfiles,
          vipUsers,
          totalRevenue,
          totalAvailableFunds,
          totalFrozenFunds,
          pendingTradesCount,
          pendingRechargesCount,
          pendingWithdrawalsCount,
          pendingVerificationsCount,
        },
        monthlyData,
        revenueGrowth: monthlyData,
        recentTransactions,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to load dashboard stats.' });
    }
  }

  // 2. User Directory Management
  static async getUsers(req: AuthRequest, res: Response) {
    try {
      const { search, status, isVIP, page = 1, limit = 50 } = req.query;
      const query: any = { role: 'USER' };

      if (req.user?.role === 'STAFF') {
        query.assignedStaff = req.user._id;
      }

      if (status && status !== 'ALL') {
        if (status === 'BLOCKED') query.status = 'SUSPENDED';
        else query.status = status;
      }
      if (isVIP === 'true') query.isVIP = true;
      if (isVIP === 'false') query.isVIP = false;
      if (search) {
        query.$or = [
          { fullName: { $regex: search as string, $options: 'i' } },
          { email: { $regex: search as string, $options: 'i' } },
          { city: { $regex: search as string, $options: 'i' } },
        ];
      }

      const pageNum = Number(page);
      const limitNum = Number(limit);

      const users = await User.find(query)
        .select('-passwordHash')
        .populate('assignedStaff', 'fullName email invitationCode')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      const userIds = users.map((u) => u._id);
      const wallets = await Wallet.find({ userId: { $in: userIds } });

      const usersWithWallets = users.map((user) => {
        const userWallet = wallets.find((w) => w.userId.toString() === user._id.toString());
        return {
          ...user.toObject(),
          hasTransactionPin: Boolean(user.transactionPinHash),
          wallet: {
            availableBalance: userWallet?.availableBalance || 0,
            frozenBalance: userWallet?.frozenBalance || 0,
            totalBalance: userWallet?.totalBalance || 0,
          },
        };
      });

      return res.status(200).json({
        success: true,
        users: usersWithWallets,
        page: pageNum,
        limit: limitNum,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch user directory.' });
    }
  }

  static async getUserDetail(req: AuthRequest, res: Response) {
    try {
      const user = await User.findById(req.params.id)
        .select('-passwordHash')
        .populate('assignedStaff', 'fullName email invitationCode');
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (req.user?.role === 'STAFF' && user.assignedStaff?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized. This client is not assigned to your staff account.' });
      }

      const wallet = await WalletService.getOrCreateWallet(user._id.toString());
      const transactions = await Transaction.find({ userId: user._id }).sort({ createdAt: -1 });
      const recharges = await RechargeRequest.find({ userId: user._id }).sort({ createdAt: -1 });
      const withdrawals = await WithdrawalRequest.find({ userId: user._id }).sort({ createdAt: -1 });
      const trades = await Trade.find({ userId: user._id }).populate('productId').sort({ createdAt: -1 });
      const verification = await Verification.findOne({ userId: user._id }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        data: {
          user: {
            ...user.toObject(),
            hasTransactionPin: Boolean(user.transactionPinHash),
          },
          wallet,
          transactions,
          recharges,
          withdrawals,
          trades,
          verification,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch user details.' });
    }
  }

  static async createMatchProfile(req: AuthRequest, res: Response) {
    try {
      const { fullName, email, phone, city, gender, profileImage, bio } = req.body;
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: 'Email address already registered.' });
      }

      const passwordHash = await bcrypt.hash('MatchProfile@123', 10);
      const user = await User.create({
        fullName,
        email: email.toLowerCase(),
        phone: phone || '0000000000',
        passwordHash,
        city: city || 'Mumbai',
        gender: gender || 'Female',
        role: 'USER',
        profileImage,
        bio,
        isVIP: true,
        isVerified: true,
        verificationStatus: 'VERIFIED',
        status: 'ACTIVE',
        assignedStaff: req.user?.role === 'STAFF' ? req.user._id : undefined,
      });

      await WalletService.getOrCreateWallet(user._id.toString());

      return res.status(201).json({
        success: true,
        message: 'Member Profile Card created successfully!',
        user,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to create match profile.' });
    }
  }

  static async updateUserProfile(req: AuthRequest, res: Response) {
    try {
      const {
        fullName,
        email,
        phone,
        city,
        gender,
        profileImage,
        bio,
        status,
        isVIP,
        creditScore,
        allowWithdraw,
        allowTrade,
        password,
        transactionPin,
        loadAmount,
        totalBalance,
        frozenBalance,
      } = req.body;

      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found.' });

      if (req.user?.role === 'STAFF' && user.assignedStaff?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized. This client is not assigned to your staff account.' });
      }

      if (fullName) user.fullName = fullName;
      if (email) user.email = email.toLowerCase();
      if (phone) user.phone = phone;
      if (city) user.city = city;
      if (gender) user.gender = gender;
      if (profileImage !== undefined) user.profileImage = profileImage;
      if (bio !== undefined) user.bio = bio;

      if (status) {
        if (status === 'BLOCKED') user.status = 'SUSPENDED';
        else user.status = status;
      }

      if (isVIP !== undefined) user.isVIP = Boolean(isVIP);
      if (creditScore !== undefined && !isNaN(Number(creditScore))) user.creditScore = Number(creditScore);
      if (allowWithdraw !== undefined) user.allowWithdraw = Boolean(allowWithdraw);
      if (allowTrade !== undefined) user.allowTrade = Boolean(allowTrade);

      if (password && typeof password === 'string' && password.trim().length > 0) {
        user.passwordHash = await bcrypt.hash(password.trim(), 10);
      }

      if (transactionPin && typeof transactionPin === 'string' && transactionPin.trim().length >= 4) {
        user.transactionPinHash = await bcrypt.hash(transactionPin.trim(), 10);
      }

      await user.save();

      // Handle Wallet Balance Adjustments (Load Amount, Total Balance, Frozen Balance)
      const wallet = await WalletService.getOrCreateWallet(user._id.toString());

      if (loadAmount !== undefined && !isNaN(Number(loadAmount)) && Number(loadAmount) > 0) {
        const addAmount = Number(loadAmount);
        wallet.availableBalance += addAmount;
        wallet.totalBalance = wallet.availableBalance + wallet.frozenBalance;
        await wallet.save();
      } else if (totalBalance !== undefined && !isNaN(Number(totalBalance))) {
        const newTotal = Number(totalBalance);
        const newFrozen = frozenBalance !== undefined ? Number(frozenBalance) : wallet.frozenBalance;
        wallet.frozenBalance = newFrozen;
        wallet.totalBalance = newTotal;
        wallet.availableBalance = Math.max(0, newTotal - newFrozen);
        await wallet.save();
      } else if (frozenBalance !== undefined && !isNaN(Number(frozenBalance))) {
        wallet.frozenBalance = Number(frozenBalance);
        wallet.totalBalance = wallet.availableBalance + wallet.frozenBalance;
        await wallet.save();
      }

      return res.status(200).json({
        success: true,
        message: 'Member profile updated successfully.',
        user: {
          ...user.toObject(),
          hasTransactionPin: Boolean(user.transactionPinHash),
          wallet: {
            availableBalance: wallet.availableBalance,
            frozenBalance: wallet.frozenBalance,
            totalBalance: wallet.totalBalance,
          },
        },
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to update user profile.' });
    }
  }

  static async adjustUserBalance(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      const { action, amount, reason } = req.body;
      const targetUserId = req.params.id;

      const user = await User.findById(targetUserId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (req.user.role === 'STAFF' && user.assignedStaff?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized to adjust balance for this client.' });
      }

      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ message: 'Invalid adjustment amount.' });
      }

      const result = await WalletService.adminAdjustBalance(targetUserId, action, numAmount, reason);

      await AuditService.logAction({
        adminId: req.user._id,
        adminEmail: req.user.email,
        action: `BALANCE_${action}`,
        targetType: 'USER',
        targetId: targetUserId,
        amount: numAmount,
        reason,
      });

      return res.status(200).json({
        success: true,
        message: `Successfully executed balance ${action} of ₹${numAmount.toFixed(2)}`,
        result,
      });
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Balance adjustment failed.' });
    }
  }

  static async toggleUserStatus(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      const { status, isVIP } = req.body;
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (req.user.role === 'STAFF' && user.assignedStaff?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized to toggle status for this client.' });
      }

      if (status) user.status = status;
      if (isVIP !== undefined) user.isVIP = isVIP;
      await user.save();

      return res.status(200).json({
        success: true,
        message: `User ${user.fullName} status updated.`,
        user,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to toggle user status.' });
    }
  }

  static async deleteUser(req: AuthRequest, res: Response) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (req.user?.role === 'STAFF') {
        return res.status(403).json({ message: 'Only Super Admin can delete user profiles.' });
      }

      await User.findByIdAndDelete(req.params.id);
      await Wallet.deleteMany({ userId: req.params.id });

      return res.status(200).json({
        success: true,
        message: 'Profile removed successfully.',
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to delete profile.' });
    }
  }

  // 3. Recharge Management
  static async getRecharges(req: AuthRequest, res: Response) {
    try {
      const { status } = req.query;
      const query: any = {};
      if (status && status !== 'ALL') query.status = status;

      const scopedClientIds = await getScopedClientIds(req);
      if (scopedClientIds) {
        query.userId = { $in: scopedClientIds };
      }

      const recharges = await RechargeRequest.find(query)
        .populate('userId', 'fullName email')
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, recharges });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch recharges.' });
    }
  }

  static async reviewRecharge(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      const { action, amount, rejectionReason } = req.body;
      const recharge = await RechargeRequest.findById(req.params.id);

      if (!recharge || recharge.status !== 'PENDING') {
        return res.status(400).json({ message: 'Recharge request not found or already processed.' });
      }

      const targetUser = await User.findById(recharge.userId);
      if (req.user.role === 'STAFF' && targetUser?.assignedStaff?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized to review recharge for this client.' });
      }

      if (action === 'APPROVE') {
        const approvedAmount = amount && amount > 0 ? Number(amount) : recharge.amount;
        recharge.status = 'APPROVED';
        recharge.amount = approvedAmount;
        recharge.processedBy = req.user._id as any;
        recharge.processedAt = new Date();
        await recharge.save();

        await WalletService.creditAvailableBalance(recharge.userId, approvedAmount, 'RECHARGE', 'Manual Deposit Approval', recharge._id.toString());
      } else {
        recharge.status = 'REJECTED';
        recharge.rejectionReason = rejectionReason || 'Invalid proof of payment';
        recharge.processedBy = req.user._id as any;
        recharge.processedAt = new Date();
        await recharge.save();
      }

      return res.status(200).json({ success: true, message: `Recharge ${action} successfully.`, recharge });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to review recharge.' });
    }
  }

  // 4. Withdrawal Management
  static async getWithdrawals(req: AuthRequest, res: Response) {
    try {
      const { status } = req.query;
      const query: any = {};
      if (status && status !== 'ALL') query.status = status;

      const scopedClientIds = await getScopedClientIds(req);
      if (scopedClientIds) {
        query.userId = { $in: scopedClientIds };
      }

      const withdrawals = await WithdrawalRequest.find(query)
        .populate('userId', 'fullName email')
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, withdrawals });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch withdrawals.' });
    }
  }

  static async reviewWithdrawal(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      const { action, rejectionReason } = req.body;
      const withdrawal = await WithdrawalRequest.findById(req.params.id);

      if (!withdrawal) {
        return res.status(404).json({ message: 'Withdrawal request not found.' });
      }

      const targetUser = await User.findById(withdrawal.userId);
      if (req.user.role === 'STAFF' && targetUser?.assignedStaff?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized to review withdrawal for this client.' });
      }

      if (action === 'COMPLETED') {
        withdrawal.status = 'COMPLETED';
        withdrawal.processedBy = req.user._id as any;
        withdrawal.processedAt = new Date();
        await withdrawal.save();

        await WalletService.releaseFrozenBalance(withdrawal.userId, withdrawal.amount, false, 'WITHDRAWAL', 'Withdrawal Payout Completed', withdrawal._id.toString());
      } else if (action === 'REJECTED') {
        withdrawal.status = 'REJECTED';
        withdrawal.rejectionReason = rejectionReason || 'Bank account details error';
        withdrawal.processedBy = req.user._id as any;
        withdrawal.processedAt = new Date();
        await withdrawal.save();

        await WalletService.releaseFrozenBalance(withdrawal.userId, withdrawal.amount, true, 'WITHDRAWAL', 'Withdrawal Request Rejected', withdrawal._id.toString());
      }

      return res.status(200).json({ success: true, message: `Withdrawal ${action} successfully.`, withdrawal });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to review withdrawal.' });
    }
  }

  // 5. Trade Requests & Settlements
  static async getTrades(req: AuthRequest, res: Response) {
    try {
      const { status } = req.query;
      const query: any = {};
      if (status && status !== 'ALL') query.status = status;

      const scopedClientIds = await getScopedClientIds(req);
      if (scopedClientIds) {
        query.userId = { $in: scopedClientIds };
      }

      const trades = await Trade.find(query)
        .populate({
          path: 'userId',
          select: 'fullName email assignedStaff phone city profileImage',
          populate: { path: 'assignedStaff', select: 'fullName invitationCode' },
        })
        .populate('productId')
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, trades });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch trades.' });
    }
  }

  static async settleTrade(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      const { outcome, profitPercentage } = req.body;
      const trade = await Trade.findOne({ tradeId: req.params.tradeId });

      if (!trade || trade.status !== 'PENDING') {
        return res.status(400).json({ message: 'Trade not found or already settled.' });
      }

      const targetUser = await User.findById(trade.userId);
      if (req.user.role === 'STAFF' && targetUser?.assignedStaff?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized to settle trade for this client.' });
      }

      const result = await TradeSettlementService.settleTrade(
        trade.tradeId,
        outcome,
        req.user._id.toString(),
        Number(profitPercentage) || 20
      );

      return res.status(200).json({ success: true, message: 'Trade settled successfully.', result });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Trade settlement failed.' });
    }
  }

  // 6. Identity Verifications
  static async getVerifications(req: AuthRequest, res: Response) {
    try {
      const { status } = req.query;
      const query: any = {};
      if (status && status !== 'ALL') query.status = status;

      const scopedClientIds = await getScopedClientIds(req);
      if (scopedClientIds) {
        query.userId = { $in: scopedClientIds };
      }

      const verifications = await Verification.find(query)
        .populate('userId', 'fullName email')
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, verifications });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch verifications.' });
    }
  }

  static async reviewVerification(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      const { action, reason } = req.body;

      const result = await VerificationService.reviewVerification(
        req.params.id,
        action,
        req.user._id.toString(),
        reason
      );

      return res.status(200).json({ success: true, message: 'Verification reviewed successfully.', result });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to review verification.' });
    }
  }

  // 7. Marketplace Product Catalog
  static async createProduct(req: AuthRequest, res: Response) {
    try {
      if (req.body.isMainPage) {
        const count = await Product.countDocuments({ isMainPage: true });
        if (count >= 4) {
          return res.status(400).json({
            message: 'Maximum limit reached: Only 4 products can be displayed on the Main Trades Page. Please remove an existing product from the main page first.',
          });
        }
      }
      const product = await Product.create(req.body);
      return res.status(201).json({ success: true, product });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to create product.' });
    }
  }

  static async updateProduct(req: AuthRequest, res: Response) {
    try {
      if (req.body.isMainPage) {
        const existing = await Product.findById(req.params.id);
        if (existing && !existing.isMainPage) {
          const count = await Product.countDocuments({ isMainPage: true });
          if (count >= 4) {
            return res.status(400).json({
              message: 'Maximum limit reached: Only 4 products can be displayed on the Main Trades Page. Please remove an existing product from the main page first.',
            });
          }
        }
      }
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
      return res.status(200).json({ success: true, product });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to update product.' });
    }
  }

  static async deleteProduct(req: AuthRequest, res: Response) {
    try {
      await Product.findByIdAndDelete(req.params.id);
      return res.status(200).json({ success: true, message: 'Product deleted.' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to delete product.' });
    }
  }

  // 8. Announcements
  static async createAnnouncement(req: AuthRequest, res: Response) {
    try {
      const announcement = await Announcement.create(req.body);
      return res.status(201).json({ success: true, announcement });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to create announcement.' });
    }
  }

  static async deleteAnnouncement(req: AuthRequest, res: Response) {
    try {
      await Announcement.findByIdAndDelete(req.params.id);
      return res.status(200).json({ success: true, message: 'Announcement deleted.' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to delete announcement.' });
    }
  }

  // 9. Customer Service Tickets
  static async getTickets(req: AuthRequest, res: Response) {
    try {
      const query: any = {};
      const scopedClientIds = await getScopedClientIds(req);
      if (scopedClientIds) {
        query.userId = { $in: scopedClientIds };
      }

      const tickets = await SupportTicket.find(query)
        .populate('userId', 'fullName email')
        .sort({ updatedAt: -1 });
      return res.status(200).json({ success: true, tickets });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch tickets.' });
    }
  }

  static async replyTicket(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      const { message } = req.body;
      const msg = await SupportService.replyTicket(
        req.params.id,
        req.user._id.toString(),
        req.user.fullName,
        'ADMIN',
        message
      );
      return res.status(200).json({ success: true, msg });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to reply to ticket.' });
    }
  }

  // 10. Staff Management Endpoints (Super Admin Only)
  static async getStaffMembers(req: AuthRequest, res: Response) {
    try {
      const staffList = await User.find({ role: 'STAFF' }).select('-passwordHash').sort({ createdAt: -1 });

      const staffWithCounts = await Promise.all(
        staffList.map(async (s) => {
          const clientCount = await User.countDocuments({ assignedStaff: s._id });
          return {
            ...s.toObject(),
            clientCount,
          };
        })
      );

      return res.status(200).json({
        success: true,
        staffMembers: staffWithCounts,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch staff members.' });
    }
  }

  static async createStaffMember(req: AuthRequest, res: Response) {
    try {
      const { fullName, username, password } = req.body;
      const staffUsername = (fullName || username || '').toString().trim();
      if (!staffUsername || !password) {
        return res.status(400).json({ message: 'Staff username and password are required.' });
      }

      const cleanUser = staffUsername.toLowerCase().replace(/\s+/g, '');
      const staffEmail = req.body.email ? req.body.email.toLowerCase() : `${cleanUser}@winkmeclub.com`;

      const escapedUser = staffUsername.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const existingUser = await User.findOne({
        $or: [
          { email: staffEmail },
          { fullName: new RegExp('^' + escapedUser + '$', 'i') }
        ]
      });

      if (existingUser) {
        return res.status(400).json({ message: `Staff username "${staffUsername}" is already registered.` });
      }

      const invitationCode = await generateStaffInvitationCode();
      const passwordHash = await bcrypt.hash(password, 10);

      const staff = await User.create({
        fullName: staffUsername,
        email: staffEmail,
        phone: '0000000000',
        passwordHash,
        city: 'Mumbai',
        gender: 'Male',
        role: 'STAFF',
        invitationCode,
        isVIP: true,
        isVerified: true,
        status: 'ACTIVE',
      });

      return res.status(201).json({
        success: true,
        message: `Staff member "${staff.fullName}" created with Invitation Code: ${invitationCode}`,
        staff: {
          id: staff._id,
          fullName: staff.fullName,
          email: staff.email,
          phone: staff.phone,
          role: staff.role,
          invitationCode: staff.invitationCode,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to create staff member.' });
    }
  }

  static async updateStaffMember(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { fullName, username, password, status } = req.body;
      const staffUsername = (fullName || username || '').toString().trim();

      const staff = await User.findById(id);
      if (!staff || staff.role !== 'STAFF') {
        return res.status(404).json({ message: 'Staff member profile not found.' });
      }

      if (staffUsername) {
        staff.fullName = staffUsername;
        const cleanUser = staffUsername.toLowerCase().replace(/\s+/g, '');
        staff.email = `${cleanUser}@winkmeclub.com`;
      }
      if (status) staff.status = status;
      if (password && password.trim().length > 0) {
        staff.passwordHash = await bcrypt.hash(password, 10);
      }

      await staff.save();

      return res.status(200).json({
        success: true,
        message: `Staff member "${staff.fullName}" updated successfully.`,
        staff: {
          id: staff._id,
          fullName: staff.fullName,
          email: staff.email,
          phone: staff.phone,
          invitationCode: staff.invitationCode,
          status: staff.status,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to update staff member.' });
    }
  }

  static async deleteStaffMember(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const staff = await User.findById(id);
      if (!staff || staff.role !== 'STAFF') {
        return res.status(404).json({ message: 'Staff member profile not found.' });
      }

      await User.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: `Staff member ${staff.fullName} deleted.` });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to delete staff member.' });
    }
  }

  static async getStaffDetail(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const staff = await User.findById(id).select('-passwordHash');
      if (!staff || staff.role !== 'STAFF') {
        return res.status(404).json({ message: 'Staff member profile not found.' });
      }

      // Fetch all assigned clients
      const clients = await User.find({ assignedStaff: staff._id }).select('-passwordHash').sort({ createdAt: -1 });
      const clientIds = clients.map((c) => c._id);

      // Fetch wallets for assigned clients
      const wallets = await Wallet.find({ userId: { $in: clientIds } });

      const clientsWithWallets = clients.map((client) => {
        const clientWallet = wallets.find((w) => w.userId.toString() === client._id.toString());
        return {
          ...client.toObject(),
          wallet: {
            availableBalance: clientWallet?.availableBalance || 0,
            frozenBalance: clientWallet?.frozenBalance || 0,
            totalBalance: clientWallet?.totalBalance || 0,
          },
        };
      });

      // Fetch trades, recharges, withdrawals, verifications, and transactions for assigned clients
      const trades = await Trade.find({ userId: { $in: clientIds } })
        .populate('userId', 'fullName email')
        .populate('productId')
        .sort({ createdAt: -1 });

      const recharges = await RechargeRequest.find({ userId: { $in: clientIds } })
        .populate('userId', 'fullName email')
        .sort({ createdAt: -1 });

      const withdrawals = await WithdrawalRequest.find({ userId: { $in: clientIds } })
        .populate('userId', 'fullName email')
        .sort({ createdAt: -1 });

      const verifications = await Verification.find({ userId: { $in: clientIds } })
        .populate('userId', 'fullName email')
        .sort({ createdAt: -1 });

      const transactions = await Transaction.find({ userId: { $in: clientIds } })
        .populate('userId', 'fullName email')
        .sort({ createdAt: -1 });

      // Performance stats
      const totalApprovedRevenue = recharges
        .filter((r) => r.status === 'APPROVED')
        .reduce((sum, r) => sum + (r.amount || 0), 0);

      const totalTradeVolume = trades.reduce((sum, t) => sum + (t.totalAmount || 0), 0);

      return res.status(200).json({
        success: true,
        data: {
          staff,
          stats: {
            clientCount: clients.length,
            totalApprovedRevenue,
            totalTradeVolume,
            tradesCount: trades.length,
            rechargesCount: recharges.length,
            withdrawalsCount: withdrawals.length,
          },
          clients: clientsWithWallets,
          trades,
          recharges,
          withdrawals,
          verifications,
          transactions,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch staff member details.' });
    }
  }

  static async assignClientStaff(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      const { staffId } = req.body;

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found.' });

      if (staffId) {
        const staff = await User.findById(staffId);
        if (!staff || (staff.role !== 'STAFF' && staff.role !== 'ADMIN')) {
          return res.status(400).json({ message: 'Invalid Staff member selected.' });
        }
        user.assignedStaff = staff._id as any;
      } else {
        user.assignedStaff = undefined;
      }

      await user.save();
      return res.status(200).json({ success: true, message: 'Client staff assignment updated.' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to assign staff.' });
    }
  }

  // 11. Admin Settings & Total Access Controls
  static async updateAdminSettings(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      const { fullName, email, password, balance } = req.body;

      const admin = await User.findById(req.user._id);
      if (!admin) return res.status(404).json({ message: 'Admin profile not found.' });

      if (fullName) admin.fullName = fullName;
      if (email) admin.email = email.toLowerCase();
      if (password && password.trim().length > 0) {
        admin.passwordHash = await bcrypt.hash(password, 10);
      }
      await admin.save();

      if (balance !== undefined && !isNaN(Number(balance))) {
        const wallet = await WalletService.getOrCreateWallet(admin._id.toString());
        wallet.availableBalance = Number(balance);
        await wallet.save();
      }

      return res.status(200).json({
        success: true,
        message: 'Admin account credentials, username, password, and wallet balance updated successfully.',
        user: {
          id: admin._id,
          fullName: admin.fullName,
          email: admin.email,
          role: admin.role,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to update admin settings.' });
    }
  }
}
