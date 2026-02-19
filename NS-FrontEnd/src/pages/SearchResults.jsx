import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from '../components/products/ProductCard';
import ShopCard from '../components/shops/ShopCard';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { productsApi } from '../api/products';
import { shopsApi } from '../api/shops';
import './SearchResults.css';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get('q') || '';
  
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const [productsRes, shopsRes] = await Promise.all([
        productsApi.searchProducts(query),
        shopsApi.searchShops(query)
      ]);
      setProducts(productsRes);
      setShops(shopsRes);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput)}`);
    }
  };

  const totalResults = products.length + shops.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="search-results-page"
    >
      <div className="container">
        {/* Search Header */}
        <div className="search-header">
          <h1 className="search-title">
            Résultats pour "{query}"
          </h1>
          <p className="search-count">
            {totalResults} résultat{totalResults > 1 ? 's' : ''} trouvé{totalResults > 1 ? 's' : ''}
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="search-form">
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Rechercher..."
              className="search-input-large"
            />
            <Button type="submit">Rechercher</Button>
          </form>
        </div>

        {/* Tabs */}
        <div className="search-tabs">
          <button
            className={`tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Produits ({products.length})
          </button>
          <button
            className={`tab ${activeTab === 'shops' ? 'active' : ''}`}
            onClick={() => setActiveTab('shops')}
          >
            Boutiques ({shops.length})
          </button>
        </div>

        {/* Results */}
        <div className="search-results">
          {loading ? (
            <div className="search-loading">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton-card" />
              ))}
            </div>
          ) : (
            <>
              {activeTab === 'products' && (
                <>
                  {products.length === 0 ? (
                    <div className="no-results">
                      <span className="no-results-icon">🔍</span>
                      <h3>Aucun produit trouvé</h3>
                      <p>Essayez avec d'autres mots-clés</p>
                    </div>
                  ) : (
                    <div className="products-grid">
                      {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'shops' && (
                <>
                  {shops.length === 0 ? (
                    <div className="no-results">
                      <span className="no-results-icon">🏪</span>
                      <h3>Aucune boutique trouvée</h3>
                      <p>Essayez avec d'autres mots-clés</p>
                    </div>
                  ) : (
                    <div className="shops-grid">
                      {shops.map(shop => (
                        <ShopCard key={shop.id} shop={shop} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SearchResults;