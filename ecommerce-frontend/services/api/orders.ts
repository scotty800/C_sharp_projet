import api from './axios';
import { 
  Order, 
  CreateOrderDto, 
  OrderResponseDto, 
  UpdateOrderStatusDto,
  OrderStatus 
} from '@/types';

export const orderService = {
  // Créer une commande
  async createOrder(data: CreateOrderDto): Promise<{
    message: string;
    orderId: number;
    orderNumber: string;
    amount: number;
    paymentIntentId?: string;
  }> {
    const response = await api.post('/orders', data);
    return response.data;
  },

  // Récupérer les commandes de l'utilisateur
  async getMyOrders(): Promise<OrderResponseDto[]> {
    const response = await api.get<OrderResponseDto[]>('/orders/my-orders');
    return response.data;
  },

  // Récupérer une commande par ID
  async getOrderById(id: number): Promise<OrderResponseDto> {
    const response = await api.get<OrderResponseDto>(`/orders/${id}`);
    return response.data;
  },

  // Récupérer une commande par numéro
  async getOrderByNumber(orderNumber: string): Promise<OrderResponseDto> {
    const response = await api.get<OrderResponseDto>(`/orders/number/${orderNumber}`);
    return response.data;
  },

  // Annuler une commande
  async cancelOrder(id: number): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>(`/orders/${id}/cancel`);
    return response.data;
  },

  // Récupérer les commandes d'une boutique (vendeur)
  async getShopOrders(shopId: number): Promise<OrderResponseDto[]> {
    const response = await api.get<OrderResponseDto[]>(`/orders/shop/${shopId}`);
    return response.data;
  },

  // Récupérer les commandes par statut (admin)
  async getOrdersByStatus(status: OrderStatus): Promise<OrderResponseDto[]> {
    const response = await api.get<OrderResponseDto[]>(`/orders/status/${status}`);
    return response.data;
  },

  // Mettre à jour le statut d'une commande (admin)
  async updateOrderStatus(id: number, data: UpdateOrderStatusDto): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>(`/orders/${id}/status`, data);
    return response.data;
  },

  // Récupérer les statistiques globales (admin)
  async getOrderStats(): Promise<any> {
    const response = await api.get('/orders/stats');
    return response.data;
  },

  // Récupérer les statistiques d'une boutique (vendeur)
  async getShopOrderStats(shopId: number): Promise<any> {
    const response = await api.get(`/orders/shop/${shopId}/stats`);
    return response.data;
  },
};