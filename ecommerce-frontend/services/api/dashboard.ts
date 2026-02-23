import api from './axios';
import { ShopDashboard, TopProduct, DashboardSummary, RealtimeStats } from '@/types';

export const dashboardService = {
  // Récupérer le dashboard d'une boutique
  async getShopDashboard(
    shopId: number, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<ShopDashboard> {
    const response = await api.get<ShopDashboard>(`/dashboard/shop/${shopId}`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Récupérer les produits les plus vus
  async getTopProductsByViews(shopId: number, limit = 10): Promise<TopProduct[]> {
    const response = await api.get<TopProduct[]>(`/dashboard/shop/${shopId}/top-views`, {
      params: { limit },
    });
    return response.data;
  },

  // Récupérer le résumé du dashboard
  async getDashboardSummary(shopId: number): Promise<DashboardSummary> {
    const response = await api.get<DashboardSummary>(`/dashboard/shop/${shopId}/top-sales`);
    return response.data;
  },

  // Exporter les données du dashboard
  async exportDashboardData(shopId: number, startDate?: Date, endDate?: Date): Promise<Blob> {
    const response = await api.get(`/dashboard/shop/${shopId}/export`, {
      params: { startDate, endDate },
      responseType: 'blob',
    });
    return response.data;
  },

  // Récupérer les statistiques en temps réel
  async getRealtimeStats(shopId: number): Promise<RealtimeStats> {
    const response = await api.get<RealtimeStats>(`/dashboard/shop/${shopId}/realtime`);
    return response.data;
  },
};