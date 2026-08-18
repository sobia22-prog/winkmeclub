import mongoose, { Schema, Document } from 'mongoose';

export type TransactionType = 'RECHARGE' | 'WITHDRAWAL' | 'TRADE_HOLD' | 'TRADE_WIN' | 'TRADE_LOSE' | 'ADMIN_ADJUSTMENT';

export interface ITransaction extends Document {
  transactionId: string;
  userId: mongoose.Types.ObjectId;
  type: TransactionType;
  amount: number;
  beforeBalance: number;
  afterBalance: number;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED' | 'FAILED';
  referenceId?: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    transactionId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ['RECHARGE', 'WITHDRAWAL', 'TRADE_HOLD', 'TRADE_WIN', 'TRADE_LOSE', 'ADMIN_ADJUSTMENT'],
      index: true,
    },
    amount: { type: Number, required: true },
    beforeBalance: { type: Number, required: true },
    afterBalance: { type: Number, required: true },
    status: { type: String, required: true, enum: ['COMPLETED', 'PENDING', 'CANCELLED', 'FAILED'], default: 'COMPLETED' },
    referenceId: { type: String, default: '' },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

TransactionSchema.index({ userId: 1, createdAt: -1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
