import api from './axios';
import { CreateOrderDto, OrderResponseDto } from '@/types/order';
import { OrderStatus } from '@/types/order';

export const orderService = {
  // Créer une commande
  async createOrder(data: CreateOrderDto): Promise<{ 
    orderId: number; 
    orderNumber: string; 
    amount: number; 
    paymentIntentId: string;
  }> {
    const response = await api.post('/orders', data);
    return response.data;
  },

  // Récupérer mes commandes
  async getMyOrders(): Promise<OrderResponseDto[]> {
    const response = await api.get('/orders/my-orders');
    return response.data;
  },

  // Récupérer une commande par ID
  async getOrderById(orderId: number): Promise<OrderResponseDto> {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  // Récupérer une commande par numéro
  async getOrderByNumber(orderNumber: string): Promise<OrderResponseDto> {
    const response = await api.get(`/orders/number/${orderNumber}`);
    return response.data;
  },

  // Récupérer les commandes d'une boutique
  async getShopOrders(shopId: number): Promise<OrderResponseDto[]> {
    const response = await api.get(`/orders/shop/${shopId}`);
    return response.data;
  },

  // ✅ AJOUTER CETTE MÉTHODE
  // Mettre à jour le statut d'une commande
  async updateOrderStatus(orderId: number, data: { status: OrderStatus }): Promise<{ message: string }> {
    console.log('📤 Mise à jour statut - OrderId:', orderId, 'Nouveau statut:', data.status);
    
    try {
      const response = await api.put(`/orders/${orderId}/status`, data);
      console.log('✅ Statut mis à jour:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur mise à jour statut:');
      console.error('  Status:', error.response?.status);
      console.error('  Message:', error.response?.data?.message);
      throw error;
    }
  },

  // Annuler une commande
  async cancelOrder(orderId: number): Promise<{ message: string }> {
    const response = await api.put(`/orders/${orderId}/cancel`, {});
    return response.data;
  },

  // Récupérer les commandes par statut (admin)
  async getOrdersByStatus(status: OrderStatus): Promise<OrderResponseDto[]> {
    const response = await api.get(`/orders/status/${status}`);
    return response.data;
  },

  // Récupérer les stats
  async getOrderStats(): Promise<any> {
    const response = await api.get('/orders/stats');
    return response.data;
  },

  // Récupérer les stats d'une boutique
  async getShopOrderStats(shopId: number): Promise<any> {
    const response = await api.get(`/orders/shop/${shopId}/stats`);
    return response.data;
  },

  // ==================== GESTION DES RETOURS ====================

// Demander un retour
async requestReturn(orderId: number): Promise<{ message: string }> {
  const response = await api.post(`/orders/${orderId}/return-request`, {});
  return response.data;
},

// Approuver un retour (vendeur)
async approveReturn(orderId: number): Promise<{ message: string }> {
  const response = await api.post(`/orders/${orderId}/return-approve`, {});
  return response.data;
},

// Refuser un retour (vendeur)
async rejectReturn(orderId: number): Promise<{ message: string }> {
  const response = await api.post(`/orders/${orderId}/return-reject`, {});
  return response.data;
},

};