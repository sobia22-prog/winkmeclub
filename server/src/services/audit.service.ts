import mongoose from 'mongoose';
import { AuditLog } from '../models/auditLog.model';

export class AuditService {
  static async logAction(params: {
    adminId: string | mongoose.Types.ObjectId;
    adminEmail: string;
    action: string;
    targetType: string;
    targetId?: string;
    amount?: number;
    reason?: string;
    metadata?: Record<string, any>;
  }) {
    return await AuditLog.create(params);
  }

  static async getLogs(limit = 100) {
    return await AuditLog.find().sort({ createdAt: -1 }).limit(limit);
  }
}
