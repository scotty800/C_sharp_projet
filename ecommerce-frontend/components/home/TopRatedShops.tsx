'use client';

import { useEffect, useState } from 'react';
import ShopRow from './ShopRow';
import { shopService } from '@/services/api/shops';
import { Shop, ShopResponse } from '@/types/shop';

const TopRatedShops = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopRatedShops = async () => {
      try {
        const response = await shopService.getShops({ 
          page: 1, 
          pageSize: 10,
        });
        
        // Même logique de conversion que TrendingShops
        if (response && response.data) {
          const shopsData: Shop[] = response.data.map((item: ShopResponse) => ({
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
          setShops(shopsData);
        } else if (Array.isArray(response)) {
          const shopsData: Shop[] = response.map((item: ShopResponse) => ({
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
          setShops(shopsData);
        } else {
          setShops([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des boutiques les mieux notées:', error);
        setShops([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopRatedShops();
  }, []);

  return (
    <ShopRow
      title="⭐ Top ventes"
      subtitle="Les boutiques préférées de la communauté"
      shops={shops}
      loading={loading}
    />
  );
};

export default TopRatedShops;