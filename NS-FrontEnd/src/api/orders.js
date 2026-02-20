import api from './config';

export const ordersApi = {
  createOrder: async (data) => {
    try {
      const response = await api.post('/orders', data);
      return response.data;
    } catch (error) {
      console.error('Error in createOrder:', error);
      throw error;
    }
  },

  getMyOrders: async () => {
    try {
      const response = await api.get('/orders/my-orders');
      
      // ✅ S'assurer que la réponse est un tableau
      // La réponse peut être dans response.data ou directement response
      const ordersData = response.data || response;
      
      // ✅ Vérifier que c'est bien un tableau
      if (Array.isArray(ordersData)) {
        return ordersData;
      } else if (ordersData?.data && Array.isArray(ordersData.data)) {
        return ordersData.data;
      } else {
        console.warn('getMyOrders did not return an array:', ordersData);
        return []; // Retourner un tableau vide par défaut
      }
    } catch (error) {
      console.error('Error in getMyOrders:', error);
      return []; // En cas d'erreur, retourner un tableau vide
    }
  },

  getOrderById: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in getOrderById:', error);
      throw error;
    }
  },

  getOrderByNumber: async (orderNumber) => {
    try {
      const response = await api.get(`/orders/number/${orderNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error in getOrderByNumber:', error);
      throw error;
    }
  },

  cancelOrder: async (id) => {
    try {
      const response = await api.put(`/orders/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error in cancelOrder:', error);
      throw error;
    }
  },

  getShopOrders: async (shopId) => {
    try {
      const response = await api.get(`/orders/shop/${shopId}`);
      
      // ✅ S'assurer que la réponse est un tableau
      const ordersData = response.data || response;
      
      if (Array.isArray(ordersData)) {
        return ordersData;
      } else if (ordersData?.data && Array.isArray(ordersData.data)) {
        return ordersData.data;
      } else {
        console.warn('getShopOrders did not return an array:', ordersData);
        return [];
      }
    } catch (error) {
      console.error('Error in getShopOrders:', error);
      return [];
    }
  }
};