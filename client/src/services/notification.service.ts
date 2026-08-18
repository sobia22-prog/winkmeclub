import api from './api';

export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
};

export const announcementService = {
  getPublished: () => api.get('/announcements'),
};
