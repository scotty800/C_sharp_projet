import api from './axios';
import { 
  Shop, 
  ShopResponse, 
  CreateShopRequest, 
  CreateShopResponse,  // ← Ajoute ce type
  UpdateShopRequest,
  ShopListResponse,
  PaginationParams 
} from '@/types';

export const shopService = {
  // Récupérer toutes les boutiques avec pagination
  async getShops(params?: PaginationParams & { search?: string }): Promise<ShopListResponse> {
    const response = await api.get<ShopListResponse>('/shops', { params });
    return response.data;
  },

  // Récupérer les boutiques de l'utilisateur connecté
  async getMyShops(): Promise<ShopResponse[]> {
    const response = await api.get<ShopResponse[]>('/shops/my-shops');
    return response.data;
  },

  // Récupérer une boutique par ID
  async getShopById(id: number | string): Promise<Shop> {
    const response = await api.get<Shop>(`/shops/${id}`);
    return response.data;
  },

  // Récupérer une boutique par slug
  async getShopBySlug(slug: string): Promise<Shop> {
    const response = await api.get<Shop>(`/shops/slug/${slug}`);
    return response.data;
  },

  // Créer une boutique
  async createShop(data: CreateShopRequest): Promise<CreateShopResponse> {
    const response = await api.post<CreateShopResponse>('/shops', data);
    return response.data;
  },

  // Mettre à jour une boutique
  async updateShop(id: number, data: UpdateShopRequest): Promise<ShopResponse> {
    const response = await api.put<ShopResponse>(`/shops/${id}`, data);
    return response.data;
  },

  // Supprimer une boutique
  async deleteShop(id: number): Promise<void> {
    await api.delete(`/shops/${id}`);
  },

  // Uploader le logo
  async uploadLogo(id: number, file: File): Promise<{ logoUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<{ logoUrl: string }>(`/shops/${id}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Uploader la bannière
  async uploadBanner(id: number, file: File): Promise<{ bannerUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<{ bannerUrl: string }>(`/shops/${id}/banner`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};