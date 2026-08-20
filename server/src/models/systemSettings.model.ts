import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSettings extends Document {
  telegramFinanceLink: string;
  telegramSupportLink: string;
  usdtWalletAddress: string;
  usdtExchangeRate: number;
  adminUpiId: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  updatedAt: Date;
}

const SystemSettingsSchema: Schema = new Schema(
  {
    telegramFinanceLink: { type: String, default: 'https://t.me/winkmedatingclub_finance' },
    telegramSupportLink: { type: String, default: 'https://t.me/winkmedatingclub_support' },
    usdtWalletAddress: { type: String, default: 'TXYZ987654321WinkMeClubUSDTDepositAddr' },
    usdtExchangeRate: { type: Number, default: 92 },
    adminUpiId: { type: String, default: 'winkmeclub@upi' },
    bankName: { type: String, default: 'HDFC Bank' },
    accountHolder: { type: String, default: 'Wink Me Club Financial Services' },
    accountNumber: { type: String, default: '50100298371234' },
    ifscCode: { type: String, default: 'HDFC0000128' },
  },
  { timestamps: true }
);

export const SystemSettings = mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema);
