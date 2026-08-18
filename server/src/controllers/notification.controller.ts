import { Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class NotificationController {
  static async getNotifications(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

      const notifications = await NotificationService.getUserNotifications(req.user._id.toString());
      const unreadCount = notifications.filter((n) => !n.isRead).length;

      return res.status(200).json({
        success: true,
        unreadCount,
        notifications,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch notifications.' });
    }
  }

  static async markRead(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

      await NotificationService.markAsRead(req.params.id, req.user._id.toString());

      return res.status(200).json({
        success: true,
        message: 'Notification marked as read.',
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to update notification.' });
    }
  }

  static async markAllRead(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

      await NotificationService.markAllAsRead(req.user._id.toString());

      return res.status(200).json({
        success: true,
        message: 'All notifications marked as read.',
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to update notifications.' });
    }
  }
}
