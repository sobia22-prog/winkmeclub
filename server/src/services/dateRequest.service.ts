import mongoose from 'mongoose';
import { DateRequest, IDateRequest } from '../models/dateRequest.model';
import { User } from '../models/user.model';
import { NotificationService } from './notification.service';

export class DateRequestService {
  static async createDateRequest(
    senderId: string | mongoose.Types.ObjectId,
    targetProfileId: string,
    date: string,
    time: string,
    message: string
  ): Promise<IDateRequest> {
    const targetUser = await User.findById(targetProfileId);
    if (!targetUser) throw new Error('Target profile not found');

    const requestId = `DR-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const dateReq = await DateRequest.create({
      requestId,
      senderId,
      targetProfileId,
      targetProfileName: targetUser.fullName,
      date,
      time,
      message,
      status: 'PENDING',
    });

    await NotificationService.createNotification(
      senderId,
      'Date Request Sent',
      `Your date request to ${targetUser.fullName} for ${date} at ${time} was sent successfully.`,
      'DATE_REQUEST',
      '/matches'
    );

    return dateReq;
  }

  static async getUserDateRequests(userId: string) {
    return await DateRequest.find({
      $or: [{ senderId: userId }, { targetProfileId: userId }],
    }).sort({ createdAt: -1 });
  }
}
