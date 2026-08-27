import axios from 'axios';

const baseURL = (import.meta as any).env?.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wink_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const pathname = window.location.pathname;
      const isAuthRoute =
        pathname.startsWith('/login') ||
        pathname.startsWith('/register') ||
        pathname.startsWith('/admin/login') ||
        pathname.startsWith('/staff/login') ||
        pathname.startsWith('/verify-otp');
      if (!isAuthRoute) {
        localStorage.removeItem('wink_token');
        if (pathname.startsWith('/staff')) {
          window.location.href = '/staff/login';
        } else if (pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
        } else {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
