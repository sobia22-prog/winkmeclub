import api from './api';

export const announcementService = {
  getAnnouncements: () => api.get('/announcements'),
};
