import { Response } from 'express';
import { DateRequestService } from '../services/dateRequest.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class DateRequestController {
  static async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      const { targetProfileId, date, time, message } = req.body;

      const dateReq = await DateRequestService.createDateRequest(
        req.user._id,
        targetProfileId,
        date,
        time,
        message
      );

      return res.status(201).json({
        success: true,
        message: 'Date request submitted successfully!',
        dateRequest: dateReq,
      });
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Failed to submit date request.' });
    }
  }

  static async getMyRequests(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      const requests = await DateRequestService.getUserDateRequests(req.user._id.toString());

      return res.status(200).json({
        success: true,
        requests,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch date requests.' });
    }
  }
}
