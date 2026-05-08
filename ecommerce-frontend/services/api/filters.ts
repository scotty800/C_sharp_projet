// services/api/filters.ts
import api from './axios';
import { ShopFilter, ImageFilter, ProductImageFilter } from '@/types/studio';

export const filterService = {
  // Shop filters
  async getShopFilter(shopId: number): Promise<ShopFilter | null> {
    try {
      const response = await api.get(`/shops/${shopId}/filters/global`);
      return response.data;
    } catch {
      return null;
    }
  },

  async updateShopFilter(shopId: number, data: Partial<ShopFilter>): Promise<ShopFilter> {
    const response = await api.put(`/shops/${shopId}/filters/global`, data);
    return response.data;
  },

  // Image filters
  async getImageFilters(shopId: number): Promise<ImageFilter[]> {
    const response = await api.get(`/shops/${shopId}/filters/images`);
    return response.data;
  },

  async addImageFilter(shopId: number, data: Partial<ImageFilter>): Promise<ImageFilter> {
    const response = await api.post(`/shops/${shopId}/filters/images`, data);
    return response.data;
  },

  async updateImageFilter(shopId: number, filterId: number, data: Partial<ImageFilter>): Promise<ImageFilter> {
    const response = await api.put(`/shops/${shopId}/filters/images/${filterId}`, data);
    return response.data;
  },

  async deleteImageFilter(shopId: number, filterId: number): Promise<void> {
    await api.delete(`/shops/${shopId}/filters/images/${filterId}`);
  },

  // Product image filters
  async getProductImageFilter(shopId: number, productId: number, imageIndex: number = 1): Promise<ProductImageFilter | null> {
    try {
      const response = await api.get(`/shops/${shopId}/filters/products/${productId}/filter`, {
        params: { imageIndex },
      });
      return response.data;
    } catch {
      return null;
    }
  },

  async updateProductImageFilter(shopId: number, productId: number, data: Partial<ProductImageFilter>): Promise<ProductImageFilter> {
    const response = await api.put(`/shops/${shopId}/filters/products/${productId}/filter`, data);
    return response.data;
  },

  async deleteProductImageFilter(shopId: number, productId: number): Promise<void> {
    await api.delete(`/shops/${shopId}/filters/products/${productId}/filter`);
  },

  // Presets
  async getFilterPresets(category?: string): Promise<any[]> {
    const response = await api.get('/shops/filters/presets', { params: { category } });
    return response.data;
  },

  // Seasonal effects
  async applySeasonalEffect(shopId: number, effect: string): Promise<ShopFilter> {
    const response = await api.post(`/shops/${shopId}/filters/seasonal/${effect}`);
    return response.data;
  },

  async removeSeasonalEffect(shopId: number): Promise<void> {
    await api.delete(`/shops/${shopId}/filters/seasonal`);
  },
};