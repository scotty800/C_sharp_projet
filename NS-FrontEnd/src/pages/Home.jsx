import React from 'react';
import { motion } from 'framer-motion';
import { useShops } from '../hooks/useShops';
import { useProducts } from '../hooks/useProducts';
import HeroSection from '../components/home/HeroSection';
import ShopRow from '../components/home/ShopRow';
import ProductRow from '../components/home/ProductRow';
import CategoryRow from '../components/home/CategoryRow';
import './Home.css';

const Home = () => {
    const { trendingShops, newShops, featuredShops, loading: shopsLoading } = useShops();
    const { trendingProducts, topSelling, newProducts, loading: productsLoading } = useProducts();

    const categories = [
        { id: 1, name: 'Mode', icon: '👕', color: '#FF6B6B'},
        { id: 2, name: 'Sports', icon: '⚽', color: '#45B7D1'},
        { id: 3, name: 'Beauté', icon: '💄', color: '#FFEAA7'},
        { id: 4, name: 'Sneakers', icon: '👟', color: '#4ECDC4'},
        { id: 5, name: 'Accessoire', icon: '💍', color: '#DDA0DD'},
    ];

    return (
        <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         className="home-page"
        >
        <HeroSection />

        <div className="home-content">
            {/* Catégories */}
            <section className="home-section">
                <CategoryRow categories={categories} />
            </section>

            {/* Boutiques tendances */}
            {!shopsLoading && trendingShops.length > 0 && (
                <section className="home-section">
                    <ShopRow 
                      title="🔥 Boutiques tendances"
                      shops={trendingShops}
                      seeAllLink="/shops?sort=trending"
                    />
                </section>
            )}

            {/* Top ventes */}
            {!productsLoading && topSelling.length > 0 && (
                <section className="home-section">
                    <ProductRow
                      title="🏆Top ventes"
                      products={topSelling}
                      seeAllLink="/products?sort=top"
                    />
                </section>
            )}

            {/* Nouvelles boutiques */}
            {!shopsLoading && newShops.length > 0 && (
                <section className="home-section">
                    <ShopRow
                      title="🆕 Nouvelles boutiques"
                      shops={newShops}
                      seeAllLink="/shops?sort=trending"
                    />
                </section>
            )}

            {/* Produits tendances */}
            {!productsLoading && trendingProducts.length > 0 && (
                <section className="home-section">
                    <ProductRow
                      title="⭐ Recommandés pour vous"
                      shops={trendingProducts}
                      seeAllLink="/products/recommended"
                    />
                </section>
            )}

            {/* Boutiques en vedette */}
            {!shopsLoading && featuredShops.length > 0 && (
                <section className="home-section">
                    <ShopRow
                      title="✨ Boutique en vedette"
                      shops={featuredShops}
                      seeAllLink="/shops/featured"
                    />
                </section>
            )}

            {/* Nouveautés produits */}
            {!productsLoading && newProducts.length > 0 && (
                <section className="home-section">
                    <ProductRow
                      title="🆕 Nouveautés"
                      products={newProducts}
                      seeAllLink="/products?sort=new"
                    />
                </section>
            )}

            {/* Loading skeletons */}
            {(shopsLoading || productsLoading) && (
                <div className="home-loading">
                    {[1, 2, 3]. map((i) => (
                        <div key={i} className="loading-row">
                            <div className="loading-title skeleton" />
                            <div className="loading-items">
                                {[1, 2, 3, 4].map((j) => (
                                    <div key={j} className="loading-card skeleton" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
        </motion.div>
    );
};