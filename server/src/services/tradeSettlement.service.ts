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
      `Your trade request #${tradeId} for ${productName} (Quantity: ${qty} units) is now PENDING Admin review.`,
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

      trade.status = 'SETTLED';
      trade.outcome = 'WIN';
      trade.profitPercentage = profitPct;
      trade.processedBy = new mongoose.Types.ObjectId(adminId);
      trade.processedAt = new Date();
      trade.note = note;
      await trade.save();

      await NotificationService.createNotification(
        trade.userId,
        'Trade Result: WIN! 🎉',
        `Congratulations! Your trade #${trade.tradeId} for ${trade.productName} resulted in a WIN.`,
        'TRADE',
        '/trades'
      );
    } else if (outcome === 'LOSE') {
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
        `Trade #${trade.tradeId} for ${trade.productName} resulted in LOSE.`,
        'TRADE',
        '/trades'
      );
    }

    return trade;
  }
}
