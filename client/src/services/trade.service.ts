import api from './api';

export const tradeService = {
  getProducts: () => api.get('/products'),
  getProductById: (id: string) => api.get(`/products/${id}`),
  executeTrade: (data: { productId: string; quantity: number; productName?: string; productImage?: string }) => api.post('/trades', data),
  getMyTrades: () => api.get('/trades'),
};
