import api from './api';

export const profileService = {
  getMatches: (params?: any) => api.get('/profiles/matches', { params }),
  getProfileById: (id: string) => api.get(`/profiles/${id}`),
  sendDateRequest: (data: { targetProfileId: string; date: string; time: string; message: string }) =>
    api.post('/date-requests', data),
  getMyDateRequests: () => api.get('/date-requests'),
  submitVerification: (data: any) => api.post('/verifications', data),
  getVerificationStatus: () => api.get('/verifications/status'),
};
