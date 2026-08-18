import { Response } from 'express';
import { SupportService } from '../services/support.service';
import { SupportTicket, SupportMessage } from '../models/support.model';
import { AuthRequest } from '../middleware/auth.middleware';

export class SupportController {
  static async createTicket(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

      const { category, subject, message, attachmentUrl } = req.body;

      const ticket = await SupportService.createTicket({
        userId: req.user._id,
        userName: req.user.fullName,
        userEmail: req.user.email,
        category,
        subject,
        message,
        attachmentUrl,
      });

      return res.status(201).json({
        success: true,
        message: 'Support ticket created successfully.',
        ticket,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to create ticket.' });
    }
  }

  static async getMyTickets(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

      const tickets = await SupportTicket.find({ userId: req.user._id }).sort({ updatedAt: -1 });

      return res.status(200).json({
        success: true,
        tickets,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch tickets.' });
    }
  }

  static async getTicketDetails(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

      const ticket = await SupportTicket.findOne({ _id: req.params.id, userId: req.user._id });
      if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });

      const messages = await SupportMessage.find({ ticketId: ticket._id }).sort({ createdAt: 1 });

      return res.status(200).json({
        success: true,
        ticket,
        messages,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch ticket messages.' });
    }
  }

  static async reply(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

      const { message, attachmentUrl } = req.body;

      const msg = await SupportService.replyTicket(
        req.params.id,
        req.user._id,
        req.user.fullName,
        req.user.role === 'ADMIN' ? 'ADMIN' : 'USER',
        message,
        attachmentUrl
      );

      return res.status(201).json({
        success: true,
        message: 'Reply sent.',
        supportMessage: msg,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to reply to ticket.' });
    }
  }
}
