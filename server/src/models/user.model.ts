import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  city: string;
  gender: string;
  role: 'USER' | 'ADMIN' | 'STAFF';
  invitationCode?: string;
  assignedStaff?: mongoose.Types.ObjectId;
  isVIP: boolean;
  vipExpiresAt?: Date;
  isVerified: boolean;
  verificationStatus: 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE' | 'PENDING';
  creditScore: number;
  allowWithdraw: boolean;
  allowTrade: boolean;
  transactionPinHash?: string;
  profileImage?: string;
  bio?: string;
  dob?: Date;
  age?: number;
  interests?: string[];
  bankDetails?: {
    bankName?: string;
    accountHolder?: string;
    accountNumber?: string;
    ifscCode?: string;
  };
  upiId?: string;
  phonePe?: string;
  paytm?: string;
  googlePay?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    city: { type: String, required: true, trim: true, index: true },
    gender: { type: String, required: true, enum: ['Male', 'Female', 'Non-Binary', 'Other'], default: 'Female' },
    role: { type: String, enum: ['USER', 'ADMIN', 'STAFF'], default: 'USER', index: true },
    invitationCode: { type: String, unique: true, sparse: true, trim: true, index: true },
    assignedStaff: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    isVIP: { type: Boolean, default: false, index: true },
    vipExpiresAt: { type: Date },
    isVerified: { type: Boolean, default: false },
    verificationStatus: { type: String, enum: ['NONE', 'PENDING', 'VERIFIED', 'REJECTED'], default: 'NONE' },
    status: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'INACTIVE', 'PENDING'], default: 'ACTIVE', index: true },
    creditScore: { type: Number, default: 100 },
    allowWithdraw: { type: Boolean, default: true },
    allowTrade: { type: Boolean, default: true },
    transactionPinHash: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    bio: { type: String, default: '' },
    dob: { type: Date },
    age: { type: Number, default: 24 },
    interests: [{ type: String }],
    bankDetails: {
      bankName: { type: String, default: '' },
      accountHolder: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
    },
    upiId: { type: String, default: '' },
    phonePe: { type: String, default: '' },
    paytm: { type: String, default: '' },
    googlePay: { type: String, default: '' },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1, status: 1 });
UserSchema.index({ city: 1, isVIP: 1, status: 1 });
UserSchema.index({ invitationCode: 1 });
UserSchema.index({ assignedStaff: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
