import { Response } from 'express';
import { TradeSettlementService } from '../services/tradeSettlement.service';
import { Trade } from '../models/trade.model';
import { Product } from '../models/product.model';
import { AuthRequest } from '../middleware/auth.middleware';

export class TradeController {
  static async executeTrade(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

      const { productId, quantity } = req.body;
      const numQuantity = Number(quantity) || 1;

      const product = await Product.findById(productId);
      if (!product || product.status !== 'ACTIVE') {
        return res.status(400).json({ message: 'Product not available for trading.' });
      }

      const trade = await TradeSettlementService.executeTrade(
        req.user._id,
        product._id.toString(),
        product.name,
        product.image,
        numQuantity,
        product.price
      );

      return res.status(201).json({
        success: true,
        message: 'Trade submitted successfully! Funds are held in frozen balance pending admin settlement.',
        trade,
      });
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Trade execution failed.' });
    }
  }

  static async getMyTrades(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

      const trades = await Trade.find({ userId: req.user._id }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        trades,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch trade history.' });
    }
  }
}
