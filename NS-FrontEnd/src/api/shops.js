import api from './config';

export const shopsApi = {
  getShops: async (params) => {
    try {
      const response = await api.get('/shops', { params });
      return response.data;
    } catch (error) {
      console.error('Error in getShops:', error);
      throw error;
    }
  },

  getShopById: async (id) => {
    try {
      const response = await api.get(`/shops/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in getShopById:', error);
      throw error;
    }
  },

  getShopBySlug: async (slug) => {
    try {
      console.log('🔍 API call: getShopBySlug', slug);
      const response = await api.get(`/shops/slug/${slug}`);
      console.log('✅ API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error in getShopBySlug:', error.response?.data || error.message);
      throw error;
    }
  },

  getMyShops: async () => {
    try {
      const response = await api.get('/shops/my-shops');
      return response.data;
    } catch (error) {
      console.error('Error in getMyShops:', error);
      throw error;
    }
  },

  createShop: async (data) => {
    try {
      const response = await api.post('/shops', data);
      return response.data;
    } catch (error) {
      console.error('Error in createShop:', error);
      throw error;
    }
  },

  updateShop: async (id, data) => {
    try {
      const response = await api.put(`/shops/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error in updateShop:', error);
      throw error;
    }
  },

  deleteShop: async (id) => {
    try {
      const response = await api.delete(`/shops/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in deleteShop:', error);
      throw error;
    }
  },

  uploadLogo: async (id, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(`/shops/${id}/logo`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error in uploadLogo:', error);
      throw error;
    }
  },

  uploadBanner: async (id, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(`/shops/${id}/banner`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error in uploadBanner:', error);
      throw error;
    }
  },

  getShopProducts: async (shopId, params) => {
    try {
      const response = await api.get(`/shops/${shopId}/products`, { params });
      return response.data;
    } catch (error) {
      console.error('Error in getShopProducts:', error);
      throw error;
    }
  }
};