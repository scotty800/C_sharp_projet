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

                const trending = await productsApi.getProdcuts({
                    sort: 'views',
                    limit: 10
                });
                setTrendingProducts(trending.data || []);

                const top = await productsApi.getProdcuts({
                    sort: 'sales',
                    limit: 10
                });
                setTopSelling(top.data || []);

                const newest = await productsApi.getProdcuts({
                    sort: 'newest',
                    limit: 10
                });
                setNewProducts(newest.data || []);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching products:', err);
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