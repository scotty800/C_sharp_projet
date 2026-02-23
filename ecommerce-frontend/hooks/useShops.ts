// hooks/useShops.ts
'use client';

import { useState, useEffect } from 'react';
import { shopService } from '@/services/api/shops';
import { Shop, ShopResponse } from '@/types/shop';
import { useAuth } from './useAuth';

// Type guard pour vérifier si c'est un Shop complet
const isFullShop = (item: Shop | ShopResponse): item is Shop => {
  return 'themeColor' in item && 'backgroundColor' in item && 'textColor' in item;
};

// Fonction utilitaire pour convertir ShopResponse en Shop
const transformShopResponse = (response: ShopResponse): Shop => {
  return {
    id: response.id,
    name: response.name,
    slug: response.slug,
    description: response.description,
    logoUrl: response.logoUrl,
    bannerUrl: response.bannerUrl,
    themeColor: '#e50914',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    email: response.email || null,
    phone: response.phone || null,
    productCount: response.productCount,
    createdAt: response.createdAt || new Date().toISOString(),
    ownerId: response.ownerId,
    owner: undefined,
    products: []
  };
};

// Fonction pour garantir qu'on a un tableau de Shop
const ensureShops = (data: (Shop | ShopResponse)[]): Shop[] => {
  return data.map(item => {
    if (isFullShop(item)) {
      return item;
    }
    return transformShopResponse(item);
  });
};

interface UseShopsOptions {
  page?: number;
  pageSize?: number;
  search?: string;
}

interface UseShopsReturn {
  shops: Shop[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  refetch: () => Promise<void>;
}

export const useShops = (options: UseShopsOptions = {}): UseShopsReturn => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(options.page || 1);

  const fetchShops = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await shopService.getShops({
        page: currentPage,
        pageSize: options.pageSize || 10,
        search: options.search,
      });
      
      // Utiliser la fonction ensureShops pour garantir le type
      const transformedShops = ensureShops(response.data);
      
      setShops(transformedShops);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des boutiques');
      console.error('Erreur fetchShops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, [currentPage, options.search]);

  return {
    shops,
    loading,
    error,
    totalPages,
    currentPage,
    refetch: fetchShops,
  };
};

export const useShop = (id: number | string) => {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        setLoading(true);
        const data = await shopService.getShopById(id);
        
        // Garantir que c'est un Shop
        if (isFullShop(data)) {
          setShop(data);
        } else {
          setShop(transformShopResponse(data));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la boutique');
        console.error('Erreur fetchShop:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchShop();
    }
  }, [id]);

  return { shop, loading, error };
};

export const useMyShops = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMyShops = async () => {
      if (!user) {
        setShops([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await shopService.getMyShops();
        
        // ✅ CORRECTION : Utiliser ensureShops pour transformer si nécessaire
        const transformedShops = ensureShops(data);
        setShops(transformedShops);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement de vos boutiques');
        console.error('Erreur fetchMyShops:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyShops();
  }, [user]);

  return { shops, loading, error };
};