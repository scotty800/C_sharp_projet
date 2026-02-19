import api from './config';

export const cartApi = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart/add', data),
  updateItem: (itemId, data) => api.put(`/cart/item/${itemId}`, data),
  removeItem: (itemId) => api.delete(`/cart/item/${itemId}`),
  clearCart: () => api.delete('/cart/clear'),
  getCount: () => api.get('/cart/count')
};