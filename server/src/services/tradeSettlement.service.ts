import mongoose from 'mongoose';
import { Trade, ITrade, TradeOutcome } from '../models/trade.model';
import { WalletService } from './wallet.service';
import { NotificationService } from './notification.service';

export class TradeSettlementService {
  static async executeTrade(
    userId: string | mongoose.Types.ObjectId,
    productId: string,
    productName: string,
    productImage: string,
    itemQuantity: number,
    itemPrice: number = 0
  ): Promise<ITrade> {
    const qty = Number(itemQuantity) || 1;
    const tradeId = `TRD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // 1. Freeze trade amount from user's available balance into frozen balance
    await WalletService.freezeBalance(
      userId,
      qty,
      'TRADE_HOLD',
      `Trade Order #${tradeId}: ${productName}`,
      tradeId
    );

    // 2. Create pending trade record
    const trade = await Trade.create({
      tradeId,
      userId,
      productId,
      productName,
      productImage,
      quantity: qty,
      price: itemPrice || 0,
      totalAmount: qty,
      status: 'PENDING',
      outcome: 'NONE',
    });

    await NotificationService.createNotification(
      userId,
      'Airborne Trade Request Placed',
      `Your trade request #${tradeId} for ${productName} (Quantity: ${qty}) is active and held in frozen balance pending round outcome.`,
      'TRADE',
      '/trades'
    );

    return trade;
  }

  static async settleTrade(
    tradeId: string,
    outcome: TradeOutcome,
    adminId: string | mongoose.Types.ObjectId,
    profitPercentage: number = 20,
    note: string = ''
  ): Promise<ITrade> {
    const trade = await Trade.findOne({ tradeId, status: 'PENDING' });
    if (!trade) {
      throw new Error(`Pending trade with ID ${tradeId} not found or already settled.`);
    }

    if (outcome === 'WIN') {
      const profitPct = [20, 40, 60, 80, 100].includes(profitPercentage) ? profitPercentage : 20;
      const profitAmount = Number((trade.totalAmount * (profitPct / 100)).toFixed(2));
      const totalPayout = Number((trade.totalAmount + profitAmount).toFixed(2));

      // 1. Unfreeze staked trade amount back to available balance
      await WalletService.releaseFrozenBalance(
        trade.userId,
        trade.totalAmount,
        true,
        'TRADE_WIN',
        `Trade WIN Unfreeze: #${trade.tradeId}`,
        trade.tradeId
      );

      // 2. Credit profit amount to available balance
      if (profitAmount > 0) {
        await WalletService.creditAvailableBalance(
          trade.userId,
          profitAmount,
          'TRADE_WIN',
          `Trade WIN Profit (+${profitPct}%): #${trade.tradeId}`,
          trade.tradeId
        );
      }

      trade.status = 'SETTLED';
      trade.outcome = 'WIN';
      trade.profitPercentage = profitPct;
      trade.payoutAmount = totalPayout;
      trade.processedBy = new mongoose.Types.ObjectId(adminId);
      trade.processedAt = new Date();
      trade.note = note;
      await trade.save();

      await NotificationService.createNotification(
        trade.userId,
        'Trade Result: WIN! 🎉',
        `Congratulations! Your trade #${trade.tradeId} resulted in WIN (+${profitPct}% profit). Total payout: ${totalPayout}`,
        'TRADE',
        '/trades'
      );
    } else if (outcome === 'LOSE') {
      // 1. Deduct staked trade amount from frozen balance (permanently lost)
      await WalletService.releaseFrozenBalance(
        trade.userId,
        trade.totalAmount,
        false,
        'TRADE_LOSE',
        `Trade LOSE Deduction: #${trade.tradeId}`,
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
        'Trade Result: Settled (LOSE)',
        `Trade #${trade.tradeId} for ${trade.productName} resulted in LOSE. Staked amount deducted.`,
        'TRADE',
        '/trades'
      );
    }

    return trade;
  }
}
