import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType = 'VIP' | 'RECHARGE' | 'WITHDRAWAL' | 'TRADE' | 'DATE_REQUEST' | 'SUPPORT' | 'ANNOUNCEMENT';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true, enum: ['VIP', 'RECHARGE', 'WITHDRAWAL', 'TRADE', 'DATE_REQUEST', 'SUPPORT', 'ANNOUNCEMENT'], index: true },
    isRead: { type: Boolean, default: false, index: true },
    link: { type: String, default: '' },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
