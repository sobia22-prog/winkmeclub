import { Response } from 'express';
import { WithdrawalRequest } from '../models/withdrawal.model';
import { WalletService } from '../services/wallet.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { NotificationService } from '../services/notification.service';
import { financialConfig } from '../config/financial.config';

export class WithdrawalController {
  static async submit(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

      const { amount, bankName, accountHolder, accountNumber, ifscCode } = req.body;
      const numAmount = Number(amount);

      if (numAmount < financialConfig.minWithdrawalAmount) {
        return res.status(400).json({
          message: `Minimum withdrawal amount is ${financialConfig.currencySymbol}${financialConfig.minWithdrawalAmount}`,
        });
      }

      const wallet = await WalletService.getOrCreateWallet(req.user._id.toString());
      if (wallet.availableBalance < numAmount) {
        return res.status(400).json({
          message: `Insufficient available balance. Available: ₹${wallet.availableBalance.toFixed(2)}`,
        });
      }

      const requestId = `WTD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      // Move requested withdrawal amount to frozen balance
      await WalletService.freezeBalance(
        req.user._id,
        numAmount,
        'WITHDRAWAL',
        `Withdrawal request hold #${requestId}`,
        requestId
      );

      const withdrawal = await WithdrawalRequest.create({
        requestId,
        userId: req.user._id,
        amount: numAmount,
        bankName,
        accountHolder,
        accountNumber,
        ifscCode: ifscCode || '',
        status: 'PENDING',
      });

      await NotificationService.createNotification(
        req.user._id,
        'Withdrawal Request Submitted',
        `Withdrawal request #${requestId} for ₹${numAmount.toFixed(2)} submitted. Amount has been temporarily moved to frozen balance.`,
        'WITHDRAWAL',
        '/wallet'
      );

      return res.status(201).json({
        success: true,
        message: 'Withdrawal request submitted successfully.',
        withdrawal,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Withdrawal request failed.' });
    }
  }

  static async getMyWithdrawals(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

      const withdrawals = await WithdrawalRequest.find({ userId: req.user._id }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        withdrawals,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch withdrawals.' });
    }
  }
}
