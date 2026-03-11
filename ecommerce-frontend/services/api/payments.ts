import api from './axios';
import { CreatePaymentIntentDto, ConfirmPaymentDto, RefundRequestDto, PaymentIntentResponseDto } from '@/types';

export const paymentService = {
  // Créer une intention de paiement
  async createPaymentIntent(data: CreatePaymentIntentDto): Promise<PaymentIntentResponseDto> {
    try {
      console.log('📤 Création PaymentIntent');
      console.log('  URL finale:', api.defaults.baseURL + '/payments/create-intent');
      console.log('  Données:', data);
      
      const response = await api.post<PaymentIntentResponseDto>('/payments/create-intent', data);
      console.log('✅ PaymentIntent créé:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur createPaymentIntent:');
      console.error('  Status:', error.response?.status);
      console.error('  URL:', error.config?.url);
      console.error('  BaseURL:', error.config?.baseURL);
      console.error('  Erreur:', error.response?.data);
      throw error;
    }
  },

  // Confirmer le paiement
  async confirmPayment(data: ConfirmPaymentDto): Promise<{ message: string; status: string }> {
    try {
      console.log('📤 Confirmation paiement');
      console.log('  URL finale:', api.defaults.baseURL + '/payments/confirm');
      console.log('  Données:', data);
      
      const response = await api.post<{ message: string; status: string }>('/payments/confirm', data);
      console.log('✅ Paiement confirmé:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur confirmPayment:');
      console.error('  Status:', error.response?.status);
      console.error('  URL tentée:', error.config?.url);
      console.error('  BaseURL:', error.config?.baseURL);
      console.error('  Chemin:', error.config?.url?.replace(error.config?.baseURL, ''));
      console.error('  Erreur:', error.response?.data);
      throw error;
    }
  },

  // Rembourser un paiement (admin)
  async refundPayment(orderId: number, data?: RefundRequestDto): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>(`/payments/${orderId}/refund`, data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur refund:', error.response?.data);
      throw error;
    }
  },

  // Récupérer les détails d'une intention de paiement
  async getPaymentIntent(paymentIntentId: string): Promise<PaymentIntentResponseDto> {
    try {
      const response = await api.get<PaymentIntentResponseDto>(`/payments/intent/${paymentIntentId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur getPaymentIntent:', error.response?.data);
      throw error;
    }
  },
};