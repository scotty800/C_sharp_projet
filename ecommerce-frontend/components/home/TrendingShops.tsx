'use client';

import { useEffect, useState } from 'react';
import ShopRow from './ShopRow';
import { shopService } from '@/services/api/shops';
import { Shop, ShopResponse } from '@/types/shop';

const TrendingShops = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingShops = async () => {
      try {
        const response = await shopService.getShops({ 
          page: 1, 
          pageSize: 10,
        });
        
        // Convertir ShopResponse[] en Shop[]
        if (response && response.data) {
          const shopsData: Shop[] = response.data.map((item: ShopResponse) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            description: item.description || '',
            logoUrl: item.logoUrl,
            bannerUrl: null, // ou item.bannerUrl si disponible
            themeColor: '#e50914', // Valeur par défaut
            backgroundColor: '#ffffff', // Valeur par défaut
            textColor: '#000000', // Valeur par défaut
            email: null,
            phone: null,
            productCount: item.productCount,
            createdAt: new Date().toISOString(), // ou item.createdAt si disponible
            ownerId: 0, // Valeur par défaut
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
            ownerId: 0,
          }));
          setShops(shopsData);
        } else {
          setShops([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des boutiques tendances:', error);
        setShops([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingShops();
  }, []);

  return (
    <ShopRow
      title="🔥 Tendances"
      subtitle="Les boutiques les plus populaires du moment"
      shops={shops}
      loading={loading}
    />
  );
};

export default TrendingShops;