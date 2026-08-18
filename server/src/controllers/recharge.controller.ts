import { Response } from 'express';
import { RechargeRequest } from '../models/recharge.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { NotificationService } from '../services/notification.service';
import { financialConfig } from '../config/financial.config';

export class RechargeController {
  static async submit(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

      const { amount, paymentMethod, referenceNumber, receiptUrl } = req.body;
      const numAmount = Number(amount);

      if (numAmount < financialConfig.minRechargeAmount) {
        return res.status(400).json({
          message: `Minimum recharge amount is ${financialConfig.currencySymbol}${financialConfig.minRechargeAmount}`,
        });
      }

      const requestId = `RCG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      const recharge = await RechargeRequest.create({
        requestId,
        userId: req.user._id,
        amount: numAmount,
        paymentMethod,
        referenceNumber,
        receiptUrl: receiptUrl || '',
        status: 'PENDING',
      });

      await NotificationService.createNotification(
        req.user._id,
        'Add Funds Request Submitted',
        `Recharge request #${requestId} for ₹${numAmount.toFixed(2)} is pending admin approval.`,
        'RECHARGE',
        '/wallet'
      );

      return res.status(201).json({
        success: true,
        message: 'Recharge request submitted successfully!',
        recharge,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Recharge request failed.' });
    }
  }

  static async getMyRecharges(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

      const recharges = await RechargeRequest.find({ userId: req.user._id }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        recharges,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch recharges.' });
    }
  }
}
