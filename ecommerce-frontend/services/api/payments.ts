import api from './axios';
import { CreatePaymentIntentDto, ConfirmPaymentDto, RefundRequestDto, PaymentIntentResponseDto } from '@/types';

export const paymentService = {
  // Créer une intention de paiement
  async createPaymentIntent(data: CreatePaymentIntentDto): Promise<PaymentIntentResponseDto> {
    try {
      console.log('📤 === CREATE PAYMENT INTENT ===');
      console.log('📤 Données:', JSON.stringify(data, null, 2));
      
      const response = await api.post<PaymentIntentResponseDto>('/payments/create-intent', data);
      console.log('✅ PaymentIntent créé:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur createPaymentIntent:');
      console.error('Status:', error.response?.status);
      console.error('Erreurs détaillées:', JSON.stringify(error.response?.data?.errors, null, 2));
      console.error('Message complet:', JSON.stringify(error.response?.data, null, 2));
      throw error;
    }
  },

  // Confirmer le paiement
  async confirmPayment(data: ConfirmPaymentDto): Promise<{ message: string; status: string }> {
    try {
      console.log('📤 === CONFIRM PAYMENT ===');
      console.log('📤 Données reçues:', JSON.stringify(data, null, 2));
      
      // ✅ Vérifier et convertir les types
      const confirmData: ConfirmPaymentDto = {
        orderId: Number(data.orderId),
        paymentIntentId: String(data.paymentIntentId),
      };
      
      console.log('📤 Données à envoyer:');
      console.log('  - orderId:', confirmData.orderId, 'type:', typeof confirmData.orderId);
      console.log('  - paymentIntentId:', confirmData.paymentIntentId, 'type:', typeof confirmData.paymentIntentId);
      console.log('📤 JSON complet:', JSON.stringify(confirmData, null, 2));
      
      const response = await api.post<{ message: string; status: string }>('/payments/confirm', confirmData);
      console.log('✅ Paiement confirmé:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ === ERREUR CONFIRM PAYMENT ===');
      console.error('❌ Status:', error.response?.status);
      
      // Afficher les erreurs de validation
      if (error.response?.data?.errors) {
        console.error('❌ Erreurs de validation:');
        Object.entries(error.response.data.errors).forEach(([key, value]: [string, any]) => {
          console.error(`  - ${key}:`, value);
        });
      }
      
      console.error('❌ Message complet:', JSON.stringify(error.response?.data, null, 2));
      console.error('❌ Données envoyées:', error.config?.data);
      throw error;
    }
  },

  // Rembourser un paiement (admin)
  async refundPayment(orderId: number, data?: RefundRequestDto): Promise<{ message: string }> {
    try {
      console.log('📤 Remboursement pour orderId:', orderId);
      const response = await api.post<{ message: string }>(`/payments/${orderId}/refund`, data);
      console.log('✅ Remboursement traité:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur refund:', error.response?.data);
      throw error;
    }
  },

  // Récupérer les détails d'une intention de paiement
  async getPaymentIntent(paymentIntentId: string): Promise<PaymentIntentResponseDto> {
    try {
      console.log('📤 Récupération PaymentIntent:', paymentIntentId);
      const response = await api.get<PaymentIntentResponseDto>(`/payments/intent/${paymentIntentId}`);
      console.log('✅ PaymentIntent récupéré:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur getPaymentIntent:', error.response?.data);
      throw error;
    }
  },
};