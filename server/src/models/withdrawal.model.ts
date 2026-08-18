import mongoose, { Schema, Document } from 'mongoose';

export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export interface IWithdrawalRequest extends Document {
  requestId: string;
  userId: mongoose.Types.ObjectId;
  amount: number;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode?: string;
  status: WithdrawalStatus;
  rejectionReason?: string;
  processedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WithdrawalRequestSchema: Schema = new Schema(
  {
    requestId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    bankName: { type: String, required: true, trim: true },
    accountHolder: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    ifscCode: { type: String, default: '', trim: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'], default: 'PENDING', index: true },
    rejectionReason: { type: String, default: '' },
    processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

WithdrawalRequestSchema.index({ userId: 1, status: 1, createdAt: -1 });

export const WithdrawalRequest = mongoose.model<IWithdrawalRequest>('WithdrawalRequest', WithdrawalRequestSchema);
