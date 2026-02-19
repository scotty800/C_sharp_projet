import { useState, useEffect } from 'react';
import { productsApi } from '../api/products';

export const useProducts = () => {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // ✅ CORRIGÉ : Gestion des réponses
        const trendingResponse = await productsApi.getProducts({ 
          sort: 'views', 
          limit: 10 
        });
        const trendingData = trendingResponse?.data || trendingResponse || [];
        setTrendingProducts(Array.isArray(trendingData) ? trendingData : []);

        const topResponse = await productsApi.getProducts({ 
          sort: 'sales', 
          limit: 10 
        });
        const topData = topResponse?.data || topResponse || [];
        setTopSelling(Array.isArray(topData) ? topData : []);

        const newestResponse = await productsApi.getProducts({ 
          sort: 'newest', 
          limit: 10 
        });
        const newestData = newestResponse?.data || newestResponse || [];
        setNewProducts(Array.isArray(newestData) ? newestData : []);

      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        // ✅ Initialiser avec des tableaux vides en cas d'erreur
        setTrendingProducts([]);
        setTopSelling([]);
        setNewProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return {
    trendingProducts,
    topSelling,
    newProducts,
    loading,
    error
  };
};