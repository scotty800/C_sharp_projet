'use client';

import { useEffect, useState } from 'react';
import ShopRow from './ShopRow';
import { shopService } from '@/services/api/shops';
import { Shop } from '@/types/shop';

const TrendingShops = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingShops = async () => {
      try {
        // À adapter selon ton API
        const response = await shopService.getShops({ 
          page: 1, 
          pageSize: 10,
          sortBy: 'popular'
        });
        setShops(response.data as Shop[]);
      } catch (error) {
        console.error('Erreur lors du chargement des boutiques tendances:', error);
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