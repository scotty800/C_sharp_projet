import api from './axios';
import { 
  Order, 
  CreateOrderDto, 
  OrderResponseDto, 
  UpdateOrderStatusDto,
  OrderStatus 
} from '@/types';

// Interface pour la réponse de création de commande
interface CreateOrderResponse {
  message: string;
  orderId: number;
  orderNumber: string;
  amount: number;
  paymentIntentId?: string;
}

export const orderService = {
  // Créer une commande
  async createOrder(data: CreateOrderDto): Promise<CreateOrderResponse> {
    try {
      console.log('📤 === CRÉATION DE COMMANDE ===');
      console.log('📤 Données reçues du frontend:', JSON.stringify(data, null, 2));
      
      // ✅ Convertir paymentMethod en entier
      const convertedPaymentMethod = convertPaymentMethod(data.paymentMethod);
      
      // ✅ Créer l'objet à envoyer avec conversion
      const orderData = {
        ...data,
        paymentMethod: convertedPaymentMethod,
      };
      
      console.log('📤 Données converties:', JSON.stringify(orderData, null, 2));
      console.log('📤 paymentMethod:', orderData.paymentMethod, 'type:', typeof orderData.paymentMethod);
      
      // ✅ Envoyer directement les données (pas besoin d'envelopper dans orderDto)
      // Le binding de ASP.NET gère automatiquement le mapping
      const response = await api.post<CreateOrderResponse>('/orders', orderData);
      console.log('✅ Commande créée avec succès:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ === ERREUR 400 ===');
      console.error('❌ Status:', error.response?.status);
      console.error('❌ Erreur du serveur:');
      if (error.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(([key, value]: [string, any]) => {
          console.error(`  ❌ ${key}:`, value);
        });
      }
      console.error('❌ Message complet:', JSON.stringify(error.response?.data, null, 2));
      throw error;
    }
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

// ✅ Fonction utilitaire pour convertir PaymentMethod en entier
// TypeScript enum: Card = 'Card' | PayPal = 'PayPal' | BankTransfer = 'BankTransfer'
// C# enum: Card = 0 | PayPal = 1 | BankTransfer = 2
function convertPaymentMethod(method: string | number): number {
  if (typeof method === 'number') {
    return method;
  }

  const methodMap: Record<string, number> = {
    'Card': 0,
    'PayPal': 1,
    'BankTransfer': 2,
  };

  const converted = methodMap[method];
  console.log(`🔄 Conversion PaymentMethod: '${method}' → ${converted}`);
  
  return converted ?? 0; // défaut: Card (0)
}