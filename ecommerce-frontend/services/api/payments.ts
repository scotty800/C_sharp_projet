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

  // ⭐ NOUVEAU — Créer une session de checkout
  async createCheckoutIntent(data: {
    paymentMethod: number;
    shippingAddress: string;
    shippingCity: string;
    shippingPostalCode: string;
    shippingCountry: string;
    billingAddress?: string;
    billingCity?: string;
    billingPostalCode?: string;
    billingCountry?: string;
    notes?: string;
  }): Promise<{
    checkoutSessionId: number;
    clientSecret?: string;
    paymentIntentId?: string;
    subtotal: number;
    shippingCost: number;
    taxAmount: number;
    total: number;
    requiresOnlinePayment: boolean;
    orderId?: number;
  }> {
    try {
      console.log('📤 Création checkout intent');
      console.log('  URL finale:', api.defaults.baseURL + '/payments/create-checkout-intent');
      console.log('  Données:', data);
      
      const response = await api.post('/payments/create-checkout-intent', data);
      console.log('✅ Checkout intent créé:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur createCheckoutIntent:', error.response?.data);
      throw error;
    }
  },

  // ⭐ NOUVEAU — Finaliser la commande après paiement
  async finalizeOrder(paymentIntentId: string): Promise<{ orderId: number; orderNumber: string }> {
    try {
      console.log('📤 Finalisation de la commande');
      console.log('  URL finale:', api.defaults.baseURL + '/payments/finalize-order');
      console.log('  PaymentIntentId:', paymentIntentId);
      
      const response = await api.post('/payments/finalize-order', { paymentIntentId });
      console.log('✅ Commande finalisée:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur finalizeOrder:', error.response?.data);
      throw error;
    }
  },

  // ⭐ MÉTHODE SUPPRIMÉE — getPendingOrder n'est plus utilisée
  // async getPendingOrder(): Promise<{ ... }> { ... }
};