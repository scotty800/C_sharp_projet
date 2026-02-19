import api from './config';

export const reviewsApi = {
  createReview: (data) => api.post('/reviews', data),
  getReviewsByProduct: (productId) => api.get(`/reviews/product/${productId}`),
  getReviewsByUser: (userId) => api.get(`/reviews/user/${userId}`),
  updateReview: (id, data) => api.put(`/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  getProductRating: (productId) => api.get(`/reviews/product/${productId}/rating`),
  getShopRating: (shopId) => api.get(`/reviews/shop/${shopId}/rating`)
};