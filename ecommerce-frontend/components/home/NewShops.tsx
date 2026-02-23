'use client';

import { useEffect, useState } from 'react';
import ShopRow from './ShopRow';
import { shopService } from '@/services/api/shops';
import { Shop } from '@/types/shop';

const NewShops = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewShops = async () => {
      try {
        const response = await shopService.getShops({ 
          page: 1, 
          pageSize: 10,
          sortBy: 'newest'
        });
        setShops(response.data as Shop[]);
      } catch (error) {
        console.error('Erreur lors du chargement des nouvelles boutiques:', error);
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