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

                const trending = await shopsApi.getShops({
                    sort: 'views',
                    limit: 10
                });
                setTrendingShops(trending.data || []);

                const newest = await shopsApi.getShops({
                    sort: 'newest',
                    limit: 10
                });
                setNewShops(newest.data || []);

                const featured = await shopsApi.getShops({
                    sort: 'products',
                    limit: 10
                });
                setFeaturedShops(featured.data || []);

            } catch (err) {
                setError(err.message);
                console.error('Error fetching shops:', err);
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