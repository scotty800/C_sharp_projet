'use client';

import { useState, useEffect } from 'react';
import { shopService } from '@/services/api/shops';
import { Shop } from '@/types/shop';
import { useAuth } from './useAuth';

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
      setShops(response.data);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des boutiques');
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
        setShop(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la boutique');
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
        setShops(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement de vos boutiques');
      } finally {
        setLoading(false);
      }
    };

    fetchMyShops();
  }, [user]);

  return { shops, loading, error };
};