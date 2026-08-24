import api from './api';

export interface GirlProfileData {
  _id?: string;
  name: string;
  rating?: number;
  height?: string;
  weight?: string;
  chestCircumference?: string;
  initialLikes?: number;
  categories?: string[];
  location?: string;
  bio?: string;
  tags?: string[] | string;
  verificationLabel?: string;
  details?: string;
  profileImage: string;
  galleryImages?: string[];
  isFeatured?: boolean;
  isActive?: boolean;
}

export const girlProfileService = {
  getPublicProfiles: (params?: any) => api.get('/girl-profiles/public', { params }),
  getProfileById: (id: string) => api.get(`/girl-profiles/${id}`),
  getCategories: () => api.get('/girl-profiles/categories'),
  getAdminProfiles: () => api.get('/girl-profiles/admin/all'),
  createProfile: (data: GirlProfileData) => api.post('/girl-profiles/admin/create', data),
  updateProfile: (id: string, data: Partial<GirlProfileData>) => api.put(`/girl-profiles/admin/update/${id}`, data),
  deleteProfile: (id: string) => api.delete(`/girl-profiles/admin/delete/${id}`),
  createCategory: (name: string) => api.post('/girl-profiles/admin/categories', { name }),
};
