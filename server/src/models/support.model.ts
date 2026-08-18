import mongoose, { Schema, Document } from 'mongoose';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ISupportTicket extends Document {
  ticketId: string;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  category: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  lastRepliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISupportMessage extends Document {
  ticketId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  senderRole: 'USER' | 'ADMIN';
  message: string;
  attachmentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema: Schema = new Schema(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    category: { type: String, required: true },
    subject: { type: String, required: true },
    status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], default: 'OPEN', index: true },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
    lastRepliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const SupportMessageSchema: Schema = new Schema(
  {
    ticketId: { type: Schema.Types.ObjectId, ref: 'SupportTicket', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, enum: ['USER', 'ADMIN'], required: true },
    message: { type: String, required: true },
    attachmentUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export const SupportTicket = mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
export const SupportMessage = mongoose.model<ISupportMessage>('SupportMessage', SupportMessageSchema);
