import mongoose from 'mongoose';
import { Notification, NotificationType } from '../models/notification.model';

export class NotificationService {
  static async createNotification(
    userId: string | mongoose.Types.ObjectId,
    title: string,
    message: string,
    type: NotificationType,
    link: string = ''
  ) {
    return await Notification.create({
      userId,
      title,
      message,
      type,
      link,
      isRead: false,
    });
  }

  static async getUserNotifications(userId: string) {
    return await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
  }

  static async markAsRead(notificationId: string, userId: string) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );
  }

  static async markAllAsRead(userId: string) {
    return await Notification.updateMany({ userId }, { isRead: true });
  }
}
