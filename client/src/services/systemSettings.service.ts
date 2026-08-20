import api from './api';

export interface SystemSettingsData {
  telegramFinanceLink: string;
  telegramSupportLink: string;
  usdtWalletAddress: string;
  usdtExchangeRate: number;
  adminUpiId: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
}

export const systemSettingsService = {
  getSettings: () => api.get('/system-settings'),
  updateSettings: (data: Partial<SystemSettingsData>) => api.put('/system-settings', data),
};
