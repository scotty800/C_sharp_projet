// services/api/assets.ts
import api from './axios';
import { Asset, Template } from '@/types/studio';

export interface ShopAsset {
  id: number;
  name: string;
  type: string;
  category: string;
  url: string;
  thumbnailUrl: string | null;
  createdAt: string;
}

export interface CleanBlocksResponse {
  message: string;
  cleaned: number;
}

export const assetsService = {
  // ==================== TEMPLATES ====================
  async getTemplates(category?: string): Promise<Template[]> {
    const response = await api.get('/assets/templates', { params: { category } });
    return response.data;
  },

  // ==================== ASSETS DE LA BOUTIQUE ====================
  
  // Récupérer les assets de la boutique
  async getShopAssets(shopId: number): Promise<ShopAsset[]> {
    const response = await api.get(`/shops/${shopId}/customization/assets`);
    return response.data;
  },

  // Récupérer les assets globaux (bibliothèque)
  async getGlobalAssets(shopId: number, type?: string, category?: string): Promise<ShopAsset[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (category) params.append('category', category);
    const response = await api.get(`/shops/${shopId}/customization/assets/global?${params.toString()}`);
    return response.data;
  },

  // Uploader un asset
  async uploadAsset(shopId: number, file: File, type?: string, category?: string): Promise<ShopAsset> {
    const formData = new FormData();
    formData.append('file', file);
    
    let url = `/shops/${shopId}/customization/assets/upload`;
    const queryParams = new URLSearchParams();
    if (type) queryParams.append('type', type);
    if (category) queryParams.append('category', category);
    
    const queryString = queryParams.toString();
    if (queryString) url += `?${queryString}`;
    
    const response = await api.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Supprimer un asset
  async deleteAsset(shopId: number, assetId: number): Promise<void> {
    await api.delete(`/shops/${shopId}/customization/assets/${assetId}`);
  },

  // Renommer un asset
  async renameAsset(shopId: number, assetId: number, name: string): Promise<ShopAsset> {
    const response = await api.put(`/shops/${shopId}/customization/assets/${assetId}/rename`, { name });
    return response.data;
  },


  // ==================== ASSETS GLOBAUX (anciens endpoints) ====================
  
  async getBackgrounds(category?: string): Promise<Asset[]> {
    const response = await api.get('/assets/backgrounds', { params: { category } });
    return response.data;
  },

  async getStickers(category?: string): Promise<Asset[]> {
    const response = await api.get('/assets/stickers', { params: { category } });
    return response.data;
  },

  async getShapes(): Promise<Asset[]> {
    const response = await api.get('/assets/shapes');
    return response.data;
  },

  async getFonts(): Promise<Asset[]> {
    const response = await api.get('/assets/fonts');
    return response.data;
  },

  async getAnimations(): Promise<Asset[]> {
    const response = await api.get('/assets/animations');
    return response.data;
  },

  // Upload asset (admin only)
  async addAsset(data: FormData): Promise<Asset> {
    const response = await api.post('/assets', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};