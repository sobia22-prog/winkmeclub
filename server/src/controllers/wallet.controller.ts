import { Response } from 'express';
import { WalletService } from '../services/wallet.service';
import { Transaction } from '../models/transaction.model';
import { AuthRequest } from '../middleware/auth.middleware';

export class WalletController {
  static async getWallet(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

      const wallet = await WalletService.getOrCreateWallet(req.user._id.toString());

      return res.status(200).json({
        success: true,
        wallet: {
          availableBalance: wallet.availableBalance,
          frozenBalance: wallet.frozenBalance,
          totalBalance: wallet.totalBalance,
          currency: wallet.currency,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch wallet.' });
    }
  }

  static async getTransactions(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

      const { type, page = 1, limit = 20 } = req.query;
      const query: any = { userId: req.user._id };

      if (type && type !== 'ALL') {
        query.type = type;
      }

      const pageNum = Number(page);
      const limitNum = Number(limit);

      const transactions = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      const total = await Transaction.countDocuments(query);

      return res.status(200).json({
        success: true,
        transactions,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch transactions.' });
    }
  }
}
