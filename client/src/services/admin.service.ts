import api from './api';

export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  getUserDetail: (id: string) => api.get(`/admin/users/${id}`),
  createMatchProfile: (data: any) => api.post('/admin/users', data),
  updateUserProfile: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUserProfile: (id: string) => api.delete(`/admin/users/${id}`),
  adjustUserBalance: (id: string, data: { action: 'ADD' | 'FREEZE' | 'UNFREEZE' | 'DEDUCT'; amount: number; reason: string }) =>
    api.post(`/admin/users/${id}/balance`, data),
  toggleUserStatus: (id: string, data: { status?: 'ACTIVE' | 'SUSPENDED'; isVIP?: boolean }) =>
    api.patch(`/admin/users/${id}/status`, data),
  
  getRecharges: (params?: { status?: string }) => api.get('/admin/recharges', { params }),
  reviewRecharge: (id: string, data: { action: 'APPROVE' | 'REJECT'; rejectionReason?: string }) =>
    api.post(`/admin/recharges/${id}/review`, data),

  getWithdrawals: (params?: { status?: string }) => api.get('/admin/withdrawals', { params }),
  reviewWithdrawal: (id: string, data: { action: 'APPROVE' | 'REJECT' | 'COMPLETE'; rejectionReason?: string }) =>
    api.post(`/admin/withdrawals/${id}/review`, data),

  getTrades: (params?: { status?: string }) => api.get('/admin/trades', { params }),
  settleTrade: (
    tradeId: string,
    data: { outcome: 'WIN' | 'LOSE'; profitPercentage?: number; note?: string }
  ) => api.post(`/admin/trades/${tradeId}/settle`, data),

  getVerifications: (params?: { status?: string }) => api.get('/admin/verifications', { params }),
  reviewVerification: (id: string, data: { action: 'APPROVE' | 'REJECT' | 'PENDING'; reason?: string }) =>
    api.post(`/admin/verifications/${id}/review`, data),

  createProduct: (data: any) => api.post('/admin/products', data),
  updateProduct: (id: string, data: any) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),

  createAnnouncement: (data: any) => api.post('/admin/announcements', data),
  deleteAnnouncement: (id: string) => api.delete(`/admin/announcements/${id}`),

  getTickets: (params?: { status?: string }) => api.get('/admin/tickets', { params }),
  replyTicket: (id: string, data: { message: string; attachmentUrl?: string }) =>
    api.post(`/admin/tickets/${id}/reply`, data),

  getAuditLogs: () => api.get('/admin/audit-logs'),
  updateAdminSettings: (data: any) => api.put('/admin/settings', data),
};
