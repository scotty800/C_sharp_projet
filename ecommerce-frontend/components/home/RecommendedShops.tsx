'use client';

import { useEffect, useState } from 'react';
import ShopRow from './ShopRow';
import { shopService } from '@/services/api/shops';
import { Shop, ShopResponse } from '@/types/shop';
import { useAuth } from '@/hooks/useAuth';

const RecommendedShops = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecommendedShops = async () => {
      try {
        const response = await shopService.getShops({ 
          page: 1, 
          pageSize: 10,
        });
        
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
        console.error('Erreur lors du chargement des recommandations:', error);
        setShops([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedShops();
  }, [user]);

  if (!user) return null;

  return (
    <ShopRow
      title="🎯 Pour vous"
      subtitle="Basé sur votre historique de navigation"
      shops={shops}
      loading={loading}
    />
  );
};

export default RecommendedShops;