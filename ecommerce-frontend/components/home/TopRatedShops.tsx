'use client';

import { useEffect, useState } from 'react';
import ShopRow from './ShopRow';
import { shopService } from '@/services/api/shops';
import { Shop } from '@/types/shop';

const TopRatedShops = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopRatedShops = async () => {
      try {
        const response = await shopService.getShops({ 
          page: 1, 
          pageSize: 10,
          sortBy: 'rating'
        });
        setShops(response.data as Shop[]);
      } catch (error) {
        console.error('Erreur lors du chargement des boutiques les mieux notées:', error);
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