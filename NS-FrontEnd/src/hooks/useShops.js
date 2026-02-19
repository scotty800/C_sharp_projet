import { useState, useEffect } from 'react';
import { shopsApi } from '../api/shops';

export const useShops = () => {
  const [trendingShops, setTrendingShops] = useState([]);
  const [newShops, setNewShops] = useState([]);
  const [featuredShops, setFeaturedShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true);
        
        // ✅ CORRIGÉ : Gestion des réponses
        const trendingResponse = await shopsApi.getShops({ 
          sort: 'views', 
          limit: 10 
        });
        // La réponse peut être directe ou dans response.data
        const trendingData = trendingResponse?.data || trendingResponse || [];
        setTrendingShops(Array.isArray(trendingData) ? trendingData : []);

        const newestResponse = await shopsApi.getShops({ 
          sort: 'newest', 
          limit: 10 
        });
        const newestData = newestResponse?.data || newestResponse || [];
        setNewShops(Array.isArray(newestData) ? newestData : []);

        const featuredResponse = await shopsApi.getShops({ 
          sort: 'products', 
          limit: 10 
        });
        const featuredData = featuredResponse?.data || featuredResponse || [];
        setFeaturedShops(Array.isArray(featuredData) ? featuredData : []);

      } catch (err) {
        console.error('Error fetching shops:', err);
        setError(err.message);
        // ✅ Initialiser avec des tableaux vides en cas d'erreur
        setTrendingShops([]);
        setNewShops([]);
        setFeaturedShops([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  return {
    trendingShops,
    newShops,
    featuredShops,
    loading,
    error
  };
};