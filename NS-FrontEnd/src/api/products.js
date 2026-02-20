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
      return response.data;
    } catch (error) {
      console.error('Error in getProductsByShop:', error);
      throw error;
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
      console.log('📝 Creating product for shop:', shopId, data);
      const response = await api.post(`/products/shop/${shopId}`, data);
      console.log('✅ Product created:', response.data);
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
    
    // ✅ Important: le nom du paramètre doit correspondre au DTO côté backend
    // Dans ProductImageUploadDto, les propriétés sont Image1, Image2, Image3
    formData.append('ProductId', productId);
    
    if (files[0]) formData.append('Image1', files[0]);
    if (files[1]) formData.append('Image2', files[1]);
    if (files[2]) formData.append('Image3', files[2]);

    console.log('📸 Uploading images for product:', productId);
    console.log('📸 FormData entries:');
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    const response = await api.post('/products/upload-images', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('✅ Images uploaded:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error in uploadImages:', error.response?.data || error.message);
    throw error;
  }
},

  deleteImage: async (productId, imageNumber) => {
    try {
      const response = await api.delete(`/products/${productId}/image/${imageNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error in deleteImage:', error);
      throw error;
    }
  },

  getProductImages: async (productId) => {
    try {
      const response = await api.get(`/products/${productId}/images`);
      return response.data;
    } catch (error) {
      console.error('Error in getProductImages:', error);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      throw error;
    }
  },

  getPaged: async (params) => {
    try {
      const response = await api.get('/products/paged', { params });
      return response.data;
    } catch (error) {
      console.error('Error in getPaged:', error);
      throw error;
    }
  },

  getProductsInStock: async () => {
    try {
      const response = await api.get('/products/instock');
      return response.data;
    } catch (error) {
      console.error('Error in getProductsInStock:', error);
      throw error;
    }
  },

  searchProducts: async (query) => {
    try {
      const response = await api.get('/products/search', { params: { q: query } });
      return response.data;
    } catch (error) {
      console.error('Error in searchProducts:', error);
      throw error;
    }
  }
};