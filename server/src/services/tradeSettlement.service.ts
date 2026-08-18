import mongoose from 'mongoose';
import { Trade, ITrade, TradeOutcome } from '../models/trade.model';
import { WalletService } from './wallet.service';
import { NotificationService } from './notification.service';
import { financialConfig } from '../config/financial.config';

export class TradeSettlementService {
  static async executeTrade(
    userId: string | mongoose.Types.ObjectId,
    productId: string,
    productName: string,
    productImage: string,
    quantity: number,
    price: number
  ): Promise<ITrade> {
    const totalAmount = Number((price * quantity).toFixed(2));
    const tradeId = `TRD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // Freeze total amount from user wallet
    await WalletService.freezeBalance(
      userId,
      totalAmount,
      'TRADE_HOLD',
      `Trade execution hold for ${productName} (x${quantity})`,
      tradeId
    );

    const trade = await Trade.create({
      tradeId,
      userId,
      productId,
      productName,
      productImage,
      quantity,
      price,
      totalAmount,
      status: 'PENDING',
      outcome: 'NONE',
    });

    await NotificationService.createNotification(
      userId,
      'Trade Placed',
      `Your trade request #${tradeId} for ${productName} (₹${totalAmount.toFixed(2)}) is now PENDING review.`,
      'TRADE',
      '/trades'
    );

    return trade;
  }

  static async settleTrade(
    tradeId: string,
    outcome: TradeOutcome,
    adminId: string | mongoose.Types.ObjectId,
    note: string = ''
  ): Promise<ITrade> {
    const trade = await Trade.findOne({ tradeId, status: 'PENDING' });
    if (!trade) {
      throw new Error(`Pending trade with ID ${tradeId} not found or already settled.`);
    }

    if (outcome === 'WIN') {
      const payoutMultiplier = financialConfig.defaultTradeWinMultiplier;
      const payoutAmount = Number((trade.totalAmount * payoutMultiplier).toFixed(2));

      // Release frozen balance (without crediting back directly)
      await WalletService.releaseFrozenBalance(
        trade.userId,
        trade.totalAmount,
        false,
        'TRADE_WIN',
        `Trade #${trade.tradeId} WIN hold release`,
        trade.tradeId
      );

      // Credit payout amount to available balance
      await WalletService.creditAvailableBalance(
        trade.userId,
        payoutAmount,
        'TRADE_WIN',
        `Trade #${trade.tradeId} WIN Payout (${payoutMultiplier}x)`,
        trade.tradeId
      );

      trade.status = 'SETTLED';
      trade.outcome = 'WIN';
      trade.payoutAmount = payoutAmount;
      trade.processedBy = new mongoose.Types.ObjectId(adminId);
      trade.processedAt = new Date();
      trade.note = note;
      await trade.save();

      await NotificationService.createNotification(
        trade.userId,
        'Trade Outcome: WIN! 🎉',
        `Congratulations! Trade #${trade.tradeId} resulted in a WIN. Payout of ₹${payoutAmount.toFixed(2)} added to your available balance.`,
        'TRADE',
        '/trades'
      );
    } else if (outcome === 'LOSE') {
      // Release frozen balance (without crediting back to available balance)
      await WalletService.releaseFrozenBalance(
        trade.userId,
        trade.totalAmount,
        false,
        'TRADE_LOSE',
        `Trade #${trade.tradeId} LOSE deduction`,
        trade.tradeId
      );

      trade.status = 'SETTLED';
      trade.outcome = 'LOSE';
      trade.payoutAmount = 0;
      trade.processedBy = new mongoose.Types.ObjectId(adminId);
      trade.processedAt = new Date();
      trade.note = note;
      await trade.save();

      await NotificationService.createNotification(
        trade.userId,
        'Trade Outcome: Settled',
        `Trade #${trade.tradeId} has been settled with outcome: LOSE. ₹${trade.totalAmount.toFixed(2)} deducted from balance.`,
        'TRADE',
        '/trades'
      );
    }

    return trade;
  }
}
