import api from './axios';
import { ShippingMethod, UpsertShippingMethodDto, CartShippingSummary } from '@/types/shipping';

export const shippingService = {
  async getShopMethods(shopId: number): Promise<ShippingMethod[]> {
    const response = await api.get<ShippingMethod[]>(`/shipping/shop/${shopId}`);
    return response.data;
  },

  async upsertMethod(shopId: number, dto: UpsertShippingMethodDto): Promise<ShippingMethod> {
    const response = await api.post<ShippingMethod>(`/shipping/shop/${shopId}`, dto);
    return response.data;
  },

  async deleteMethod(shopId: number, methodId: number): Promise<void> {
    await api.delete(`/shipping/shop/${shopId}/${methodId}`);
  },

  async getCartShippingSummary(): Promise<CartShippingSummary> {
    const response = await api.get<CartShippingSummary>('/shipping/cart-summary');
    return response.data;
  },
};