import mongoose, { Schema, Document } from 'mongoose';

export type TradeStatus = 'PENDING' | 'SETTLED' | 'CANCELLED';
export type TradeOutcome = 'WIN' | 'LOSE' | 'NONE';

export interface ITrade extends Document {
  tradeId: string;
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  totalAmount: number;
  status: TradeStatus;
  outcome: TradeOutcome;
  payoutAmount?: number;
  processedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TradeSchema: Schema = new Schema(
  {
    tradeId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    productImage: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['PENDING', 'SETTLED', 'CANCELLED'], default: 'PENDING', index: true },
    outcome: { type: String, enum: ['WIN', 'LOSE', 'NONE'], default: 'NONE', index: true },
    payoutAmount: { type: Number, default: 0 },
    processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    processedAt: { type: Date },
    note: { type: String, default: '' },
  },
  { timestamps: true }
);

TradeSchema.index({ userId: 1, status: 1, createdAt: -1 });

export const Trade = mongoose.model<ITrade>('Trade', TradeSchema);
