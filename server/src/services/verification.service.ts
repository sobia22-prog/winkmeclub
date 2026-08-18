import mongoose from 'mongoose';
import { Verification, IVerification } from '../models/verification.model';
import { User } from '../models/user.model';
import { NotificationService } from './notification.service';

export class VerificationService {
  static async submitVerification(params: {
    userId: string | mongoose.Types.ObjectId;
    fullName: string;
    dob: Date;
    idType: string;
    idNumber: string;
    idDocumentUrl: string;
    selfieUrl: string;
  }): Promise<IVerification> {
    const existing = await Verification.findOne({ userId: params.userId });
    if (existing && existing.status === 'PENDING') {
      throw new Error('You already have a pending verification request under review.');
    }

    let verification: IVerification;
    if (existing) {
      existing.fullName = params.fullName;
      existing.dob = params.dob;
      existing.idType = params.idType;
      existing.idNumber = params.idNumber;
      existing.idDocumentUrl = params.idDocumentUrl;
      existing.selfieUrl = params.selfieUrl;
      existing.status = 'PENDING';
      existing.rejectionReason = '';
      verification = await existing.save();
    } else {
      verification = await Verification.create({ ...params, status: 'PENDING' });
    }

    await User.findByIdAndUpdate(params.userId, { verificationStatus: 'PENDING' });

    await NotificationService.createNotification(
      params.userId,
      'Verification Under Review',
      'Your identity documents have been submitted and are under admin review.',
      'VIP',
      '/verification'
    );

    return verification;
  }

  static async reviewVerification(
    verificationId: string,
    action: 'APPROVE' | 'REJECT',
    adminId: string | mongoose.Types.ObjectId,
    reason: string = ''
  ) {
    const verification = await Verification.findById(verificationId);
    if (!verification) throw new Error('Verification request not found.');

    if (action === 'APPROVE') {
      verification.status = 'APPROVED';
      verification.processedBy = new mongoose.Types.ObjectId(adminId);
      verification.processedAt = new Date();
      await verification.save();

      await User.findByIdAndUpdate(verification.userId, {
        isVIP: true,
        verificationStatus: 'VERIFIED',
        isVerified: true,
        vipExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year VIP
      });

      await NotificationService.createNotification(
        verification.userId,
        'VIP Verification Approved! 🌟',
        'Congratulations! Your identity has been verified and your VIP status is now ACTIVE.',
        'VIP',
        '/profile'
      );
    } else {
      verification.status = 'REJECTED';
      verification.rejectionReason = reason || 'Document verification failed.';
      verification.processedBy = new mongoose.Types.ObjectId(adminId);
      verification.processedAt = new Date();
      await verification.save();

      await User.findByIdAndUpdate(verification.userId, { verificationStatus: 'REJECTED' });

      await NotificationService.createNotification(
        verification.userId,
        'Verification Rejected',
        `Your verification request was rejected. Reason: ${verification.rejectionReason}`,
        'VIP',
        '/verification'
      );
    }

    return verification;
  }
}
