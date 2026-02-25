'use client';

import { useEffect, useState } from 'react';
import ShopRow from './ShopRow';
import { shopService } from '@/services/api/shops';
import { Shop, ShopResponse } from '@/types/shop';

const NewShops = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewShops = async () => {
      try {
        const response = await shopService.getShops({ 
          page: 1, 
          pageSize: 10,
        });
        
        // Même logique de conversion
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
        console.error('Erreur lors du chargement des nouvelles boutiques:', error);
        setShops([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNewShops();
  }, []);

  return (
    <ShopRow
      title="🆕 Nouvelles boutiques"
      subtitle="Les dernières boutiques à rejoindre la plateforme"
      shops={shops}
      loading={loading}
    />
  );
};

export default NewShops;