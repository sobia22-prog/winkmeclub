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
    quantityMoney: number,
    itemPrice: number
  ): Promise<ITrade> {
    // Quantity passed is the trading money balance amount!
    const totalAmount = Number(Number(quantityMoney).toFixed(2));
    const tradeId = `TRD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // Ensure user has enough available balance
    const wallet = await WalletService.getOrCreateWallet(userId);
    if (wallet.availableBalance < totalAmount) {
      throw new Error(`Insufficient available balance for this trade. Available: ₹${wallet.availableBalance.toFixed(2)}, Required: ₹${totalAmount.toFixed(2)}`);
    }

    const trade = await Trade.create({
      tradeId,
      userId,
      productId,
      productName,
      productImage,
      quantity: totalAmount,
      price: itemPrice || 1,
      totalAmount,
      status: 'PENDING',
      outcome: 'NONE',
    });

    await NotificationService.createNotification(
      userId,
      'Airborne Trade Request Placed',
      `Your trade request #${tradeId} for ${productName} (Trading Amount: ₹${totalAmount.toFixed(2)}) is now PENDING Admin review.`,
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

    const tradeAmount = trade.totalAmount;

    if (outcome === 'WIN') {
      // WIN: Calculate profit percentage (20%, 40%, 60%, 80%, 100%)
      const profitPct = [20, 40, 60, 80, 100].includes(profitPercentage) ? profitPercentage : 20;
      const profitAmount = Number((tradeAmount * (profitPct / 100)).toFixed(2));

      // Credit profit amount to user's Available Balance
      await WalletService.creditAvailableBalance(
        trade.userId,
        profitAmount,
        'TRADE_WIN',
        `Airborne Trade #${trade.tradeId} WIN Profit (${profitPct}%)`,
        trade.tradeId
      );

      trade.status = 'SETTLED';
      trade.outcome = 'WIN';
      trade.profitPercentage = profitPct;
      trade.payoutAmount = profitAmount;
      trade.processedBy = new mongoose.Types.ObjectId(adminId);
      trade.processedAt = new Date();
      trade.note = note;
      await trade.save();

      await NotificationService.createNotification(
        trade.userId,
        'Trade Result: WIN! 🎉',
        `Congratulations! Your trade #${trade.tradeId} for ${trade.productName} resulted in a WIN. Profit of +₹${profitAmount.toFixed(2)} (${profitPct}%) credited to your Available Balance!`,
        'TRADE',
        '/trades'
      );
    } else if (outcome === 'LOSE') {
      // LOSE: Move trade amount from Available Balance to Frozen Balance
      await WalletService.freezeBalance(
        trade.userId,
        tradeAmount,
        'TRADE_LOSE',
        `Airborne Trade #${trade.tradeId} LOSE (Moved to Frozen Balance)`,
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
        `Trade #${trade.tradeId} for ${trade.productName} resulted in LOSE. Trade amount ₹${tradeAmount.toFixed(2)} has been moved to your Frozen Balance.`,
        'TRADE',
        '/trades'
      );
    }

    return trade;
  }
}
