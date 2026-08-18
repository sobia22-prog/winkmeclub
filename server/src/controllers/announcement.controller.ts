import { Request, Response } from 'express';
import { Announcement } from '../models/announcement.model';

export class AnnouncementController {
  static async getPublishedAnnouncements(req: Request, res: Response) {
    try {
      const announcements = await Announcement.find({ status: 'PUBLISHED' }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        announcements,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch announcements.' });
    }
  }
}
