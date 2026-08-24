import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSettings extends Document {
  telegramFinanceLink: string;
  telegramSupportLink: string;
  telegramSupportQrCode: string;
  telegramSupportMessage: string;
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
    telegramSupportQrCode: {
      type: String,
      default: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://t.me/winkmedatingclub_support',
    },
    telegramSupportMessage: {
      type: String,
      default: 'Need help or have questions? Reach out to our dedicated 24/7 customer service team directly on Telegram.',
    },
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
