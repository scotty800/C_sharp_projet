'use client';

import { useState, useEffect } from 'react';
import { productService } from '@/services/api/products';
import { Product } from '@/types/product';

interface UseProductsOptions {
  page?: number;
  pageSize?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  category?: string;
  shopId?: number;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  totalCount: number;
  refetch: () => Promise<void>;
}

export const useProducts = (options: UseProductsOptions = {}): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(options.page || 1);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (options.shopId) {
        // Produits d'une boutique spécifique
        const response = await productService.getProductsByShop(options.shopId, {
          page: currentPage,
          pageSize: options.pageSize || 10,
          minPrice: options.minPrice,
          maxPrice: options.maxPrice,
          sortBy: options.sortBy,
        });
        setProducts(response.products);
        setTotalPages(response.totalPages);
        setTotalCount(response.totalCount);
      } else {
        // Tous les produits avec pagination
        const response = await productService.getProducts({
          page: currentPage,
          pageSize: options.pageSize || 10,
          minPrice: options.minPrice,
          maxPrice: options.maxPrice,
          sortBy: options.sortBy,
          category: options.category,
        });
        setProducts(response.data);
        setTotalPages(response.totalPages);
        setTotalCount(response.totalCount);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, options.minPrice, options.maxPrice, options.sortBy, options.category, options.shopId]);

  return {
    products,
    loading,
    error,
    totalPages,
    currentPage,
    totalCount,
    refetch: fetchProducts,
  };
};

export const useProduct = (id: number) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement du produit');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  return { product, loading, error };
};

export const useProductsInStock = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getProductsInStock();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};