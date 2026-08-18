import { Response } from 'express';
import { VerificationService } from '../services/verification.service';
import { Verification } from '../models/verification.model';
import { AuthRequest } from '../middleware/auth.middleware';

export class VerificationController {
  static async submit(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

      const { fullName, dob, idType, idNumber, idDocumentUrl, selfieUrl } = req.body;

      const verification = await VerificationService.submitVerification({
        userId: req.user._id,
        fullName,
        dob: new Date(dob),
        idType,
        idNumber,
        idDocumentUrl,
        selfieUrl,
      });

      return res.status(201).json({
        success: true,
        message: 'Verification document submitted successfully.',
        verification,
      });
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Verification submission failed.' });
    }
  }

  static async getStatus(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

      const verification = await Verification.findOne({ userId: req.user._id });

      return res.status(200).json({
        success: true,
        verification,
        userStatus: {
          isVIP: req.user.isVIP,
          verificationStatus: req.user.verificationStatus,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch verification status.' });
    }
  }
}
