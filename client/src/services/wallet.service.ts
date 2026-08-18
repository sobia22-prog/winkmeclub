import api from './api';

export const walletService = {
  getWallet: () => api.get('/wallet'),
  getTransactions: (params?: { type?: string; page?: number; limit?: number }) => api.get('/wallet/transactions', { params }),
  submitRecharge: (data: { amount: number; paymentMethod: string; referenceNumber: string; receiptUrl?: string }) =>
    api.post('/recharges', data),
  getMyRecharges: () => api.get('/recharges'),
  submitWithdrawal: (data: { amount: number; bankName: string; accountHolder: string; accountNumber: string; ifscCode?: string }) =>
    api.post('/withdrawals', data),
  getMyWithdrawals: () => api.get('/withdrawals'),
};
