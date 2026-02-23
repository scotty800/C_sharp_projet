import api from './axios';
import { CreatePaymentIntentDto, ConfirmPaymentDto, RefundRequestDto, PaymentIntentResponseDto } from '@/types';

export const paymentService = {
  // Créer une intention de paiement
  async createPaymentIntent(data: CreatePaymentIntentDto): Promise<PaymentIntentResponseDto> {
    const response = await api.post<PaymentIntentResponseDto>('/payments/create-intent', data);
    return response.data;
  },

  // Confirmer le paiement
  async confirmPayment(data: ConfirmPaymentDto): Promise<{ message: string; status: string }> {
    const response = await api.post<{ message: string; status: string }>('/payments/confirm', data);
    return response.data;
  },

  // Rembourser un paiement (admin)
  async refundPayment(orderId: number, data?: RefundRequestDto): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/payments/${orderId}/refund`, data);
    return response.data;
  },

  // Récupérer les détails d'une intention de paiement
  async getPaymentIntent(paymentIntentId: string): Promise<PaymentIntentResponseDto> {
    const response = await api.get<PaymentIntentResponseDto>(`/payments/intent/${paymentIntentId}`);
    return response.data;
  },
};