import api from './api';

export const authService = {
  register: (data: any) => api.post('/auth/register', data),
  verifyOTP: (data: { email: string; otp: string }) => api.post('/auth/verify-otp', data),
  resendOTP: (email: string) => api.post('/auth/resend-otp', { email }),
  login: (data: any) => api.post('/auth/login', data),
  adminLogin: (data: any) => api.post('/auth/admin-login', data),
  staffLogin: (data: any) => api.post('/auth/staff-login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/users/profile', data),
};
