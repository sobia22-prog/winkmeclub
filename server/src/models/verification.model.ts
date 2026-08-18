import mongoose, { Schema, Document } from 'mongoose';

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface IVerification extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  dob: Date;
  idType: string; // e.g. Passport, National ID, Driving License
  idNumber: string;
  idDocumentUrl: string;
  selfieUrl: string;
  status: VerificationStatus;
  rejectionReason?: string;
  processedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true },
    dob: { type: Date, required: true },
    idType: { type: String, required: true },
    idNumber: { type: String, required: true, trim: true },
    idDocumentUrl: { type: String, required: true },
    selfieUrl: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING', index: true },
    rejectionReason: { type: String, default: '' },
    processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

export const Verification = mongoose.model<IVerification>('Verification', VerificationSchema);
