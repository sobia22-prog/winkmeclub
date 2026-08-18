import mongoose, { Schema, Document } from 'mongoose';

export type DateRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface IDateRequest extends Document {
  requestId: string;
  senderId: mongoose.Types.ObjectId;
  targetProfileId: mongoose.Types.ObjectId;
  targetProfileName: string;
  date: string;
  time: string;
  message: string;
  status: DateRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const DateRequestSchema: Schema = new Schema(
  {
    requestId: { type: String, required: true, unique: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetProfileId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetProfileName: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'], default: 'PENDING', index: true },
  },
  { timestamps: true }
);

DateRequestSchema.index({ senderId: 1, createdAt: -1 });

export const DateRequest = mongoose.model<IDateRequest>('DateRequest', DateRequestSchema);
