import { useState } from 'react';
import { Shop, ShopResponse } from '@/types/shop';

export const useShopsData = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  const mapResponseToShops = (response: any): Shop[] => {
    if (response && response.data) {
      return response.data.map((item: ShopResponse) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description || '',
        logoUrl: item.logoUrl,
        bannerUrl: null,
        themeColor: '#e50914',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        email: null,
        phone: null,
        productCount: item.productCount,
        createdAt: new Date().toISOString(),
        ownerId: item.ownerId || 0,
      }));
    } else if (Array.isArray(response)) {
      return response.map((item: ShopResponse) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description || '',
        logoUrl: item.logoUrl,
        bannerUrl: null,
        themeColor: '#e50914',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        email: null,
        phone: null,
        productCount: item.productCount,
        createdAt: new Date().toISOString(),
        ownerId: item.ownerId || 0,
      }));
    }
    return [];
  };

  return {
    shops,
    setShops,
    loading,
    setLoading,
    mapResponseToShops,
  };
};