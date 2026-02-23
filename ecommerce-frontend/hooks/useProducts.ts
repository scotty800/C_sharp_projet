// hooks/useProducts.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { productService } from '@/services/api/products';
import { Product, ProductResponse } from '@/types/product';

// ==================== UTILS ====================
const transformProduct = (response: ProductResponse): Product => ({
  id: response.id,
  name: response.name,
  description: response.description,
  price: response.price,
  stock: response.stock,
  size: response.size,
  color: response.color,
  category: response.category,
  imageUrl: response.imageUrl || null,
  imageUrl1: null,
  imageUrl2: null,
  imageUrl3: null,
  shopId: response.shopId || null,
  createdAt: response.createdAt,
});

// Type guard pour vérifier si c'est déjà un Product complet
const isProduct = (item: any): item is Product => {
  return item && 'imageUrl1' in item;
};

// Normalisation des réponses API
const normalizeResponse = (response: any) => {
  // Cas 1: Tableau direct
  if (Array.isArray(response)) {
    return {
      items: response,
      totalPages: 1,
      totalCount: response.length
    };
  }
  
  // Cas 2: Réponse avec propriété 'data' (pagination standard)
  if (response?.data && Array.isArray(response.data)) {
    return {
      items: response.data,
      totalPages: response.totalPages || 1,
      totalCount: response.totalCount || response.data.length
    };
  }
  
  // Cas 3: Réponse avec propriété 'products' (getProductsByShop)
  if (response?.products && Array.isArray(response.products)) {
    return {
      items: response.products,
      totalPages: response.totalPages || 1,
      totalCount: response.totalCount || response.products.length
    };
  }
  
  // Cas par défaut
  console.warn('Structure de réponse non reconnue:', response);
  return {
    items: [],
    totalPages: 1,
    totalCount: 0
  };
};

// ==================== TYPES ====================
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
  goToPage: (page: number) => void;
  isEmpty: boolean;
  hasMore: boolean;
}

// ==================== HOOK PRINCIPAL ====================
export const useProducts = (options: UseProductsOptions = {}): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(options.page || 1);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Appel API selon le contexte
      const response = options.shopId
        ? await productService.getProductsByShop(options.shopId, {
            page: currentPage,
            pageSize: options.pageSize || 10,
            minPrice: options.minPrice,
            maxPrice: options.maxPrice,
            sortBy: options.sortBy,
          })
        : await productService.getProducts({
            page: currentPage,
            pageSize: options.pageSize || 10,
            minPrice: options.minPrice,
            maxPrice: options.maxPrice,
            sortBy: options.sortBy,
            category: options.category,
          });

      // Normalisation de la réponse
      const { items, totalPages: pages, totalCount: count } = normalizeResponse(response);
      
      // Transformation des items en produits
      const transformedProducts = items.map((item: any) => 
        isProduct(item) ? item : transformProduct(item)
      );
      
      setProducts(transformedProducts);
      setTotalPages(pages);
      setTotalCount(count);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      console.error('Erreur fetchProducts:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, options]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    products,
    loading,
    error,
    totalPages,
    currentPage,
    totalCount,
    refetch: fetchProducts,
    goToPage,
    isEmpty: !loading && products.length === 0,
    hasMore: currentPage < totalPages,
  };
};

// ==================== HOOK POUR UN PRODUIT ====================
export const useProduct = (id: number) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await productService.getProductById(id);
      
      setProduct(isProduct(data) ? data : transformProduct(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
      console.error('Erreur fetchProduct:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { 
    product, 
    loading, 
    error,
    refetch: fetchProduct 
  };
};

// ==================== HOOK POUR PRODUITS EN STOCK ====================
export const useProductsInStock = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await productService.getProductsInStock();
      
      const transformedProducts = Array.isArray(data) 
        ? data.map(item => isProduct(item) ? item : transformProduct(item))
        : [];
      
      setProducts(transformedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
      console.error('Erreur fetchProductsInStock:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { 
    products, 
    loading, 
    error,
    refetch: fetchProducts,
    isEmpty: !loading && products.length === 0
  };
};

// ==================== HOOK POUR PRODUITS D'UNE BOUTIQUE ====================
export const useShopProducts = (shopId: number, options: Omit<UseProductsOptions, 'shopId'> = {}) => {
  return useProducts({ ...options, shopId });
};