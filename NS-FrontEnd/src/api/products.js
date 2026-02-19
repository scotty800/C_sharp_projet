import api from './config';

export const productsApi = {
  getProducts: async (params) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error in getProducts:', error);
      throw error;
    }
  },

  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in getProductById:', error);
      throw error;
    }
  },

  getProductsByShop: async (shopId, params) => {
  try {
    const response = await api.get(`/products/shop/${shopId}`, { params });
    
    // ✅ Normalisation de la réponse
    if (response.data?.data) {
      return response.data.data;
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data?.products) {
      return response.data.products;
    } else {
      return []; // ✅ Toujours retourner un tableau
    }
  } catch (error) {
    console.error('Error in getProductsByShop:', error);
    return []; // ✅ En cas d'erreur, retourner un tableau vide
  }
},

  createProduct: async (data) => {
    try {
      const response = await api.post('/products', data);
      return response.data;
    } catch (error) {
      console.error('Error in createProduct:', error);
      throw error;
    }
  },

  createForShop: async (shopId, data) => {
    try {
      const response = await api.post(`/products/shop/${shopId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error in createForShop:', error);
      throw error;
    }
  },

  updateProduct: async (id, data) => {
    try {
      const response = await api.put(`/products/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error in updateProduct:', error);
      throw error;
    }
  },

  uploadImages: async (productId, files) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      
      const response = await api.post(`/products/upload-images?productId=${productId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Error in uploadImages:', error);
      throw error;
    }
  }
};