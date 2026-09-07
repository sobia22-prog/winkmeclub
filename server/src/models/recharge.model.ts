import mongoose, { Schema, Document } from 'mongoose';
import { compressToWebp } from '../utils/imageCompressor';

export type RechargeStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface IRechargeRequest extends Document {
  requestId: string;
  userId: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: string;
  referenceNumber: string;
  receiptUrl?: string;
  status: RechargeStatus;
  rejectionReason?: string;
  processedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RechargeRequestSchema: Schema = new Schema(
  {
    requestId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    paymentMethod: { type: String, required: true },
    referenceNumber: { type: String, required: true, trim: true },
    receiptUrl: { type: String, default: '' },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING', index: true },
    rejectionReason: { type: String, default: '' },
    processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

RechargeRequestSchema.index({ userId: 1, status: 1, createdAt: -1 });

RechargeRequestSchema.pre('save', async function (this: any, next) {
  try {
    if (this.isModified('receiptUrl') && this.receiptUrl) {
      this.receiptUrl = await compressToWebp(this.receiptUrl);
    }
    next();
  } catch (err: any) {
    next(err);
  }
});

export const RechargeRequest = mongoose.model<IRechargeRequest>('RechargeRequest', RechargeRequestSchema);
