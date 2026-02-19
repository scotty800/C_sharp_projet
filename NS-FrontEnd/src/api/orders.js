import api from './config';

export const ordersApi = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  getOrderByNumber: (orderNumber) => api.get(`/orders/number/${orderNumber}`),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
  getShopOrders: (shopId) => api.get(`/orders/shop/${shopId}`)
};