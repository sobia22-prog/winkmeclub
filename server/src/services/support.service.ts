import mongoose from 'mongoose';
import { SupportTicket, SupportMessage, ISupportTicket, ISupportMessage } from '../models/support.model';
import { NotificationService } from './notification.service';

export class SupportService {
  static async createTicket(params: {
    userId: string | mongoose.Types.ObjectId;
    userName: string;
    userEmail: string;
    category: string;
    subject: string;
    message: string;
    attachmentUrl?: string;
  }) {
    const ticketId = `TKT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const ticket = await SupportTicket.create({
      ticketId,
      userId: params.userId,
      userName: params.userName,
      userEmail: params.userEmail,
      category: params.category,
      subject: params.subject,
      status: 'OPEN',
      priority: 'MEDIUM',
      lastRepliedAt: new Date(),
    });

    await SupportMessage.create({
      ticketId: ticket._id,
      senderId: params.userId,
      senderName: params.userName,
      senderRole: 'USER',
      message: params.message,
      attachmentUrl: params.attachmentUrl || '',
    });

    return ticket;
  }

  static async replyTicket(
    ticketId: string,
    senderId: string | mongoose.Types.ObjectId,
    senderName: string,
    senderRole: 'USER' | 'ADMIN',
    message: string,
    attachmentUrl: string = ''
  ) {
    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) throw new Error('Ticket not found');

    const msg = await SupportMessage.create({
      ticketId: ticket._id,
      senderId,
      senderName,
      senderRole,
      message,
      attachmentUrl,
    });

    ticket.lastRepliedAt = new Date();
    if (senderRole === 'ADMIN') {
      ticket.status = 'IN_PROGRESS';
      await NotificationService.createNotification(
        ticket.userId,
        'Support Ticket Reply',
        `Support agent replied to your ticket #${ticket.ticketId}: "${ticket.subject}"`,
        'SUPPORT',
        '/support'
      );
    }
    await ticket.save();

    return msg;
  }
}
