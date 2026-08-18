import mongoose from 'mongoose';
import { Wallet, IWallet } from '../models/wallet.model';
import { Transaction, TransactionType } from '../models/transaction.model';

export class WalletService {
  static async getOrCreateWallet(userId: string | mongoose.Types.ObjectId): Promise<IWallet> {
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        availableBalance: 0,
        frozenBalance: 0,
        totalBalance: 0,
      });
    }
    return wallet;
  }

  static async creditAvailableBalance(
    userId: string | mongoose.Types.ObjectId,
    amount: number,
    type: TransactionType,
    description: string,
    referenceId: string = ''
  ) {
    if (amount <= 0) throw new Error('Credit amount must be greater than zero');
    const wallet = await this.getOrCreateWallet(userId);
    const beforeBalance = wallet.availableBalance;
    const afterBalance = Number((beforeBalance + amount).toFixed(2));

    wallet.availableBalance = afterBalance;
    wallet.totalBalance = Number((wallet.availableBalance + wallet.frozenBalance).toFixed(2));
    await wallet.save();

    const txId = `TX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const transaction = await Transaction.create({
      transactionId: txId,
      userId,
      type,
      amount,
      beforeBalance,
      afterBalance,
      status: 'COMPLETED',
      referenceId,
      description,
    });

    return { wallet, transaction };
  }

  static async freezeBalance(
    userId: string | mongoose.Types.ObjectId,
    amount: number,
    type: TransactionType,
    description: string,
    referenceId: string = ''
  ) {
    if (amount <= 0) throw new Error('Amount must be positive');
    const wallet = await this.getOrCreateWallet(userId);
    if (wallet.availableBalance < amount) {
      throw new Error(`Insufficient available balance. Available: ₹${wallet.availableBalance.toFixed(2)}, Required: ₹${amount.toFixed(2)}`);
    }

    const beforeBalance = wallet.availableBalance;
    const afterBalance = Number((beforeBalance - amount).toFixed(2));

    wallet.availableBalance = afterBalance;
    wallet.frozenBalance = Number((wallet.frozenBalance + amount).toFixed(2));
    wallet.totalBalance = Number((wallet.availableBalance + wallet.frozenBalance).toFixed(2));
    await wallet.save();

    const txId = `TX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const transaction = await Transaction.create({
      transactionId: txId,
      userId,
      type,
      amount,
      beforeBalance,
      afterBalance,
      status: 'COMPLETED',
      referenceId,
      description,
    });

    return { wallet, transaction };
  }

  static async releaseFrozenBalance(
    userId: string | mongoose.Types.ObjectId,
    amount: number,
    creditBackToAvailable: boolean,
    type: TransactionType,
    description: string,
    referenceId: string = ''
  ) {
    const wallet = await this.getOrCreateWallet(userId);
    if (wallet.frozenBalance < amount) {
      // Clamp to frozen balance to avoid negative numbers in edge cases
      amount = wallet.frozenBalance;
    }

    const beforeBalance = wallet.availableBalance;
    wallet.frozenBalance = Number((wallet.frozenBalance - amount).toFixed(2));

    if (creditBackToAvailable) {
      wallet.availableBalance = Number((wallet.availableBalance + amount).toFixed(2));
    }
    wallet.totalBalance = Number((wallet.availableBalance + wallet.frozenBalance).toFixed(2));
    await wallet.save();

    const txId = `TX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const transaction = await Transaction.create({
      transactionId: txId,
      userId,
      type,
      amount,
      beforeBalance,
      afterBalance: wallet.availableBalance,
      status: 'COMPLETED',
      referenceId,
      description,
    });

    return { wallet, transaction };
  }

  static async adminAdjustBalance(
    userId: string | mongoose.Types.ObjectId,
    action: 'ADD' | 'FREEZE' | 'UNFREEZE' | 'DEDUCT',
    amount: number,
    reason: string
  ) {
    if (amount <= 0) throw new Error('Amount must be greater than zero');

    if (action === 'ADD') {
      return await this.creditAvailableBalance(userId, amount, 'ADMIN_ADJUSTMENT', `Admin Credit: ${reason}`);
    } else if (action === 'FREEZE') {
      return await this.freezeBalance(userId, amount, 'ADMIN_ADJUSTMENT', `Admin Frozen: ${reason}`);
    } else if (action === 'UNFREEZE') {
      return await this.releaseFrozenBalance(userId, amount, true, 'ADMIN_ADJUSTMENT', `Admin Unfrozen: ${reason}`);
    } else if (action === 'DEDUCT') {
      const wallet = await this.getOrCreateWallet(userId);
      const beforeBalance = wallet.availableBalance;
      const afterBalance = Math.max(0, Number((beforeBalance - amount).toFixed(2)));
      wallet.availableBalance = afterBalance;
      wallet.totalBalance = Number((wallet.availableBalance + wallet.frozenBalance).toFixed(2));
      await wallet.save();

      const txId = `TX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const transaction = await Transaction.create({
        transactionId: txId,
        userId,
        type: 'ADMIN_ADJUSTMENT',
        amount: -amount,
        beforeBalance,
        afterBalance,
        status: 'COMPLETED',
        description: `Admin Deduction: ${reason}`,
      });
      return { wallet, transaction };
    }
  }
}
