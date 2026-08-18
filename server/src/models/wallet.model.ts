import mongoose, { Schema, Document } from 'mongoose';

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  availableBalance: number;
  frozenBalance: number;
  totalBalance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    availableBalance: { type: Number, default: 0.0, min: 0 },
    frozenBalance: { type: Number, default: 0.0, min: 0 },
    totalBalance: { type: Number, default: 0.0, min: 0 },
    currency: { type: String, default: '₹' },
  },
  { timestamps: true }
);

export const Wallet = mongoose.model<IWallet>('Wallet', WalletSchema);
