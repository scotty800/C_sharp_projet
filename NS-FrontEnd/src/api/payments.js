import api from './config';

export const paymentsApi = {
  createPaymentIntent: (data) => api.post('/payments/create-intent', data),
  confirmPayment: (data) => api.post('/payments/confirm', data),
  refundPayment: (orderId, data) => api.post(`/payments/${orderId}/refund`, data),
  getPaymentIntent: (paymentIntentId) => api.get(`/payments/intent/${paymentIntentId}`)
};