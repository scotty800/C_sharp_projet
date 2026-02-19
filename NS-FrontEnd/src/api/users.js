import api from './config';

export const usersApi = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  updatePassword: (data) => api.put('/users/me/password', data),
  getOrders: () => api.get('/users/me/orders'),
  getReviews: () => api.get('/users/me/reviews')
};