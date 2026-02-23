'use client';

import { useEffect, useState } from 'react';
import ShopRow from './ShopRow';
import { shopService } from '@/services/api/shops';
import { Shop } from '@/types/shop';
import { useAuth } from '@/hooks/useAuth';

const RecommendedShops = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecommendedShops = async () => {
      try {
        // Si l'utilisateur est connecté, on peut personnaliser les recommandations
        const response = await shopService.getShops({ 
          page: 1, 
          pageSize: 10,
          ...(user && { userId: user.id }) // À adapter selon ton API
        });
        setShops(response.data as Shop[]);
      } catch (error) {
        console.error('Erreur lors du chargement des recommandations:', error);
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