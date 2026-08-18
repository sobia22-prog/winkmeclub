import { Response } from 'express';
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
import { WalletService } from '../services/wallet.service';
import { TradeSettlementService } from '../services/tradeSettlement.service';
import { VerificationService } from '../services/verification.service';
import { SupportService } from '../services/support.service';
import { NotificationService } from '../services/notification.service';
import { AuditService } from '../services/audit.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { financialConfig } from '../config/financial.config';

export class AdminController {
  // 1. Dashboard KPIs & Charts Data
  static async getDashboardStats(req: AuthRequest, res: Response) {
    try {
      const totalUsers = await User.countDocuments({ role: 'USER' });
      const activeUsers = await User.countDocuments({ role: 'USER', status: 'ACTIVE' });
      const vipUsers = await User.countDocuments({ role: 'USER', isVIP: true });

      const wallets = await Wallet.find();
      const totalAvailableFunds = wallets.reduce((sum, w) => sum + (w.availableBalance || 0), 0);
      const totalFrozenFunds = wallets.reduce((sum, w) => sum + (w.frozenBalance || 0), 0);

      const pendingTradesCount = await Trade.countDocuments({ status: 'PENDING' });
      const pendingRechargesCount = await RechargeRequest.countDocuments({ status: 'PENDING' });
      const pendingWithdrawalsCount = await WithdrawalRequest.countDocuments({ status: 'PENDING' });
      const pendingVerificationsCount = await Verification.countDocuments({ status: 'PENDING' });

      // Total revenue from approved recharges
      const approvedRecharges = await RechargeRequest.find({ status: 'APPROVED' });
      const totalRevenue = approvedRecharges.reduce((sum, r) => sum + (r.amount || 0), 0);

      // Growth chart data generator (Last 7 Days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          day: d.toLocaleDateString('en-US', { weekday: 'short' }),
          dateStr: d.toISOString().split('T')[0],
        };
      });

      const revenueGrowth = await Promise.all(
        last7Days.map(async (dayObj) => {
          const start = new Date(dayObj.dateStr);
          const end = new Date(dayObj.dateStr);
          end.setDate(end.getDate() + 1);

          const dayRecharges = await RechargeRequest.find({
            status: 'APPROVED',
            createdAt: { $gte: start, $lt: end },
          });

          const dayTrades = await Trade.find({
            status: 'SETTLED',
            createdAt: { $gte: start, $lt: end },
          });

          const revenue = dayRecharges.reduce((sum, r) => sum + r.amount, 0);
          const tradeVolume = dayTrades.reduce((sum, t) => sum + t.totalAmount, 0);

          return {
            name: dayObj.day,
            Revenue: revenue,
            TradeVolume: tradeVolume,
          };
        })
      );

      const recentTransactions = await Transaction.find()
        .populate('userId', 'fullName email')
        .sort({ createdAt: -1 })
        .limit(8);

      return res.status(200).json({
        success: true,
        stats: {
          totalUsers,
          activeUsers,
          vipUsers,
          totalRevenue,
          totalAvailableFunds,
          totalFrozenFunds,
          pendingTradesCount,
          pendingRechargesCount,
          pendingWithdrawalsCount,
          pendingVerificationsCount,
        },
        revenueGrowth,
        recentTransactions,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to load dashboard stats.' });
    }
  }

  // 2. User Directory Management
  static async getUsers(req: AuthRequest, res: Response) {
    try {
      const { search, status, isVIP, page = 1, limit = 20 } = req.query;
      const query: any = { role: 'USER' };

      if (status && status !== 'ALL') query.status = status;
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
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      const userIds = users.map((u) => u._id);
      const wallets = await Wallet.find({ userId: { $in: userIds } });

      const usersWithWallets = users.map((user) => {
        const userWallet = wallets.find((w) => w.userId.toString() === user._id.toString());
        return {
          ...user.toObject(),
          wallet: {
            availableBalance: userWallet ? userWallet.availableBalance : 0,
            frozenBalance: userWallet ? userWallet.frozenBalance : 0,
            totalBalance: userWallet ? userWallet.totalBalance : 0,
          },
        };
      });

      const total = await User.countDocuments(query);

      return res.status(200).json({
        success: true,
        users: usersWithWallets,
        pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) },
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch users.' });
    }
  }

  static async getUserDetail(req: AuthRequest, res: Response) {
    try {
      const user = await User.findById(req.params.id).select('-passwordHash');
      if (!user) return res.status(404).json({ message: 'User not found' });

      const wallet = await WalletService.getOrCreateWallet(user._id.toString());
      const transactions = await Transaction.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20);
      const recharges = await RechargeRequest.find({ userId: user._id }).sort({ createdAt: -1 });
      const withdrawals = await WithdrawalRequest.find({ userId: user._id }).sort({ createdAt: -1 });
      const trades = await Trade.find({ userId: user._id }).sort({ createdAt: -1 });
      const verification = await Verification.findOne({ userId: user._id });

      return res.status(200).json({
        success: true,
        user,
        wallet,
        transactions,
        recharges,
        withdrawals,
        trades,
        verification,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch user details.' });
    }
  }

  static async adjustUserBalance(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      const { action, amount, reason } = req.body;
      const targetUserId = req.params.id;

      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ message: 'Valid positive amount required.' });
      }

      const targetUser = await User.findById(targetUserId);
      if (!targetUser) return res.status(404).json({ message: 'Target user not found.' });

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

      await NotificationService.createNotification(
        targetUserId,
        'Account Balance Update',
        `Admin balance adjustment (${action}): ${reason} (${financialConfig.currencySymbol}${numAmount.toFixed(2)})`,
        'RECHARGE',
        '/wallet'
      );

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

      if (status) user.status = status;
      if (isVIP !== undefined) user.isVIP = isVIP;
      await user.save();

      await AuditService.logAction({
        adminId: req.user._id,
        adminEmail: req.user.email,
        action: 'UPDATE_USER_STATUS',
        targetType: 'USER',
        targetId: user._id.toString(),
        reason: `Status: ${user.status}, VIP: ${user.isVIP}`,
      });

      return res.status(200).json({
        success: true,
        message: 'User status updated successfully.',
        user,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to update user status.' });
    }
  }

  // 3. Recharge Management
  static async getRecharges(req: AuthRequest, res: Response) {
    try {
      const { status } = req.query;
      const query: any = {};
      if (status && status !== 'ALL') query.status = status;

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
      const { action, rejectionReason } = req.body;
      const recharge = await RechargeRequest.findById(req.params.id);

      if (!recharge || recharge.status !== 'PENDING') {
        return res.status(400).json({ message: 'Recharge request not found or already processed.' });
      }

      if (action === 'APPROVE') {
        recharge.status = 'APPROVED';
        recharge.processedBy = req.user._id;
        recharge.processedAt = new Date();
        await recharge.save();

        await WalletService.creditAvailableBalance(
          recharge.userId,
          recharge.amount,
          'RECHARGE',
          `Approved add-funds recharge #${recharge.requestId}`,
          recharge.requestId
        );

        await NotificationService.createNotification(
          recharge.userId,
          'Recharge Approved! 💰',
          `Your recharge request #${recharge.requestId} of ₹${recharge.amount.toFixed(2)} has been approved and credited to your available balance.`,
          'RECHARGE',
          '/wallet'
        );

        await AuditService.logAction({
          adminId: req.user._id,
          adminEmail: req.user.email,
          action: 'APPROVE_RECHARGE',
          targetType: 'RECHARGE',
          targetId: recharge._id.toString(),
          amount: recharge.amount,
        });
      } else {
        recharge.status = 'REJECTED';
        recharge.rejectionReason = rejectionReason || 'Payment verification failed';
        recharge.processedBy = req.user._id;
        recharge.processedAt = new Date();
        await recharge.save();

        await NotificationService.createNotification(
          recharge.userId,
          'Recharge Request Rejected',
          `Your recharge request #${recharge.requestId} was rejected. Reason: ${recharge.rejectionReason}`,
          'RECHARGE',
          '/wallet'
        );

        await AuditService.logAction({
          adminId: req.user._id,
          adminEmail: req.user.email,
          action: 'REJECT_RECHARGE',
          targetType: 'RECHARGE',
          targetId: recharge._id.toString(),
          amount: recharge.amount,
          reason: rejectionReason,
        });
      }

      return res.status(200).json({ success: true, message: `Recharge ${action.toLowerCase()}d successfully.`, recharge });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Recharge processing failed.' });
    }
  }

  // 4. Withdrawal Management
  static async getWithdrawals(req: AuthRequest, res: Response) {
    try {
      const { status } = req.query;
      const query: any = {};
      if (status && status !== 'ALL') query.status = status;

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

      if (!withdrawal) return res.status(404).json({ message: 'Withdrawal request not found.' });

      if (action === 'APPROVE') {
        withdrawal.status = 'APPROVED';
        withdrawal.processedBy = req.user._id;
        withdrawal.processedAt = new Date();
        await withdrawal.save();

        await NotificationService.createNotification(
          withdrawal.userId,
          'Withdrawal Request Approved',
          `Your withdrawal request #${withdrawal.requestId} of ₹${withdrawal.amount.toFixed(2)} was approved and is in transfer queue.`,
          'WITHDRAWAL',
          '/wallet'
        );
      } else if (action === 'COMPLETE') {
        withdrawal.status = 'COMPLETED';
        withdrawal.processedBy = req.user._id;
        withdrawal.processedAt = new Date();
        await withdrawal.save();

        // Release frozen balance permanently (deduct from frozen hold)
        await WalletService.releaseFrozenBalance(
          withdrawal.userId,
          withdrawal.amount,
          false,
          'WITHDRAWAL',
          `Completed bank transfer payout #${withdrawal.requestId}`,
          withdrawal.requestId
        );

        await NotificationService.createNotification(
          withdrawal.userId,
          'Withdrawal Completed! 🏦',
          `Bank payout of ₹${withdrawal.amount.toFixed(2)} for withdrawal #${withdrawal.requestId} has been completed.`,
          'WITHDRAWAL',
          '/wallet'
        );

        await AuditService.logAction({
          adminId: req.user._id,
          adminEmail: req.user.email,
          action: 'COMPLETE_WITHDRAWAL',
          targetType: 'WITHDRAWAL',
          targetId: withdrawal._id.toString(),
          amount: withdrawal.amount,
        });
      } else if (action === 'REJECT') {
        withdrawal.status = 'REJECTED';
        withdrawal.rejectionReason = rejectionReason || 'Bank detail mismatch or administrative hold.';
        withdrawal.processedBy = req.user._id;
        withdrawal.processedAt = new Date();
        await withdrawal.save();

        // Return requested funds from frozen balance back to available balance
        await WalletService.releaseFrozenBalance(
          withdrawal.userId,
          withdrawal.amount,
          true,
          'WITHDRAWAL',
          `Rejected withdrawal #${withdrawal.requestId} hold returned`,
          withdrawal.requestId
        );

        await NotificationService.createNotification(
          withdrawal.userId,
          'Withdrawal Rejected',
          `Withdrawal #${withdrawal.requestId} was rejected. ₹${withdrawal.amount.toFixed(2)} returned to your available balance. Reason: ${withdrawal.rejectionReason}`,
          'WITHDRAWAL',
          '/wallet'
        );

        await AuditService.logAction({
          adminId: req.user._id,
          adminEmail: req.user.email,
          action: 'REJECT_WITHDRAWAL',
          targetType: 'WITHDRAWAL',
          targetId: withdrawal._id.toString(),
          amount: withdrawal.amount,
          reason: rejectionReason,
        });
      }

      return res.status(200).json({ success: true, message: `Withdrawal ${action.toLowerCase()} process completed.`, withdrawal });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Withdrawal processing failed.' });
    }
  }

  // 5. Trade Requests Management
  static async getTrades(req: AuthRequest, res: Response) {
    try {
      const { status } = req.query;
      const query: any = {};
      if (status && status !== 'ALL') query.status = status;

      const trades = await Trade.find(query)
        .populate('userId', 'fullName email')
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, trades });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch trades.' });
    }
  }

  static async settleTrade(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      const { outcome, note } = req.body;
      const tradeId = req.params.tradeId;

      const trade = await TradeSettlementService.settleTrade(tradeId, outcome, req.user._id, note);

      await AuditService.logAction({
        adminId: req.user._id,
        adminEmail: req.user.email,
        action: `SETTLE_TRADE_${outcome}`,
        targetType: 'TRADE',
        targetId: trade._id.toString(),
        amount: trade.totalAmount,
        reason: note,
      });

      return res.status(200).json({
        success: true,
        message: `Trade #${trade.tradeId} settled successfully as ${outcome}.`,
        trade,
      });
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Trade settlement failed.' });
    }
  }

  // 6. Verification Management
  static async getVerifications(req: AuthRequest, res: Response) {
    try {
      const { status } = req.query;
      const query: any = {};
      if (status && status !== 'ALL') query.status = status;

      const verifications = await Verification.find(query)
        .populate('userId', 'fullName email city profileImage')
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

      const verification = await VerificationService.reviewVerification(
        req.params.id,
        action,
        req.user._id,
        reason
      );

      await AuditService.logAction({
        adminId: req.user._id,
        adminEmail: req.user.email,
        action: `VERIFICATION_${action}`,
        targetType: 'VERIFICATION',
        targetId: verification._id.toString(),
        reason,
      });

      return res.status(200).json({
        success: true,
        message: `Verification request ${action.toLowerCase()}d.`,
        verification,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Verification review failed.' });
    }
  }

  // 7. Product Management (CRUD)
  static async createProduct(req: AuthRequest, res: Response) {
    try {
      const { name, description, price, image, category, status } = req.body;
      const product = await Product.create({
        name,
        description,
        price: Number(price),
        image,
        category: category || 'General',
        status: status || 'ACTIVE',
      });
      return res.status(201).json({ success: true, product });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Product creation failed.' });
    }
  }

  static async updateProduct(req: AuthRequest, res: Response) {
    try {
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!product) return res.status(404).json({ message: 'Product not found.' });
      return res.status(200).json({ success: true, product });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Product update failed.' });
    }
  }

  static async deleteProduct(req: AuthRequest, res: Response) {
    try {
      await Product.findByIdAndDelete(req.params.id);
      return res.status(200).json({ success: true, message: 'Product deleted.' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Product deletion failed.' });
    }
  }

  // 8. Announcement Management (CRUD)
  static async createAnnouncement(req: AuthRequest, res: Response) {
    try {
      const { title, shortDescription, content, image, status } = req.body;
      const announcement = await Announcement.create({
        title,
        shortDescription,
        content,
        image: image || '',
        status: status || 'PUBLISHED',
      });
      return res.status(201).json({ success: true, announcement });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Announcement creation failed.' });
    }
  }

  static async deleteAnnouncement(req: AuthRequest, res: Response) {
    try {
      await Announcement.findByIdAndDelete(req.params.id);
      return res.status(200).json({ success: true, message: 'Announcement deleted.' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Announcement deletion failed.' });
    }
  }

  // 9. Customer Support Ticket Inbox
  static async getTickets(req: AuthRequest, res: Response) {
    try {
      const { status } = req.query;
      const query: any = {};
      if (status && status !== 'ALL') query.status = status;

      const tickets = await SupportTicket.find(query).sort({ updatedAt: -1 });
      return res.status(200).json({ success: true, tickets });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch tickets.' });
    }
  }

  static async replyTicket(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      const { message, attachmentUrl } = req.body;

      const msg = await SupportService.replyTicket(
        req.params.id,
        req.user._id,
        req.user.fullName,
        'ADMIN',
        message,
        attachmentUrl
      );

      return res.status(201).json({ success: true, message: 'Reply dispatched to user.', msg });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to reply.' });
    }
  }

  // 10. System Audit Logs
  static async getAuditLogs(req: AuthRequest, res: Response) {
    try {
      const logs = await AuditService.getLogs(100);
      return res.status(200).json({ success: true, logs });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch audit logs.' });
    }
  }
}
