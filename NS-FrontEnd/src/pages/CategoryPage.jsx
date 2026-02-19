import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from '../components/products/ProductCard';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { productsApi } from '../api/products';
import './CategoryPage.css';

const CategoryPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    sort: 'popular',
    inStock: false
  });
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const categories = {
    mode: { name: 'Mode', icon: '👕', color: '#FF6B6B' },
    electronique: { name: 'Électronique', icon: '📱', color: '#4ECDC4' },
    maison: { name: 'Maison', icon: '🏠', color: '#45B7D1' },
    beaute: { name: 'Beauté', icon: '💄', color: '#FFEAA7' },
    sports: { name: 'Sports', icon: '⚽', color: '#96CEB4' },
    livres: { name: 'Livres', icon: '📚', color: '#DDA0DD' },
    artisanat: { name: 'Artisanat', icon: '🪵', color: '#BC8F8F' },
    vintage: { name: 'Vintage', icon: '📻', color: '#CD853F' },
    art: { name: 'Art', icon: '🎨', color: '#9370DB' },
    alimentation: { name: 'Alimentation', icon: '🍎', color: '#98FB98' }
  };

  const currentCategory = categories[category?.toLowerCase()] || {
    name: category || 'Catégorie',
    icon: '🏷️',
    color: '#64748B'
  };

  useEffect(() => {
    fetchProducts(true);
  }, [category, filters]);

  const fetchProducts = async (reset = false) => {
    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;
      
      const response = await productsApi.getProducts({
        category: category,
        page: currentPage,
        pageSize: 12,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        sort: filters.sort,
        inStock: filters.inStock || undefined
      });

      if (reset) {
        setProducts(response.data);
        setPage(2);
      } else {
        setProducts(prev => [...prev, ...response.data]);
        setPage(prev => prev + 1);
      }

      setHasMore(response.data.length === 12);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleLoadMore = () => {
    fetchProducts(false);
  };

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      sort: 'popular',
      inStock: false
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="category-page"
    >
      {/* Category Header */}
      <div 
        className="category-header"
        style={{ '--category-color': currentCategory.color }}
      >
        <div className="container">
          <div className="category-header-content">
            <span className="category-icon">{currentCategory.icon}</span>
            <h1 className="category-title">{currentCategory.name}</h1>
            <p className="category-description">
              Découvrez tous nos produits dans la catégorie {currentCategory.name}
            </p>
          </div>
        </div>
        <div className="category-wave">
          <svg viewBox="0 0 1440 120" fill="none">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
              fill="white"/>
          </svg>
        </div>
      </div>

      <div className="container">
        <div className="category-layout">
          {/* Filters Sidebar */}
          <aside className="category-filters">
            <div className="filters-header">
              <h3>Filtres</h3>
              <button onClick={clearFilters} className="clear-filters">
                Réinitialiser
              </button>
            </div>

            {/* Price Range */}
            <div className="filter-section">
              <h4>Prix</h4>
              <div className="price-range">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  min="0"
                />
                <span className="price-separator">-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  min="0"
                />
              </div>
            </div>

            {/* Stock Filter */}
            <div className="filter-section">
              <label className="stock-filter">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                />
                <span>En stock uniquement</span>
              </label>
            </div>

            {/* Sort Options */}
            <div className="filter-section">
              <h4>Trier par</h4>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="sort-select"
              >
                <option value="popular">Plus populaires</option>
                <option value="newest">Plus récents</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="rating">Meilleures notes</option>
              </select>
            </div>

            {/* Category Stats */}
            <div className="filter-section stats">
              <h4>Statistiques</h4>
              <div className="stat-item">
                <span>Produits trouvés</span>
                <strong>{products.length}</strong>
              </div>
              <div className="stat-item">
                <span>Prix moyen</span>
                <strong>
                  {products.length > 0 
                    ? (products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(2) 
                    : 0}€
                </strong>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="category-products">
            {/* Active Filters */}
            {(filters.minPrice || filters.maxPrice || filters.inStock) && (
              <div className="active-filters">
                <span className="active-filters-label">Filtres actifs:</span>
                {filters.minPrice && (
                  <span className="active-filter">
                    Prix min: {filters.minPrice}€
                    <button onClick={() => handleFilterChange('minPrice', '')}>✕</button>
                  </span>
                )}
                {filters.maxPrice && (
                  <span className="active-filter">
                    Prix max: {filters.maxPrice}€
                    <button onClick={() => handleFilterChange('maxPrice', '')}>✕</button>
                  </span>
                )}
                {filters.inStock && (
                  <span className="active-filter">
                    En stock
                    <button onClick={() => handleFilterChange('inStock', false)}>✕</button>
                  </span>
                )}
              </div>
            )}

            {/* Products Grid */}
            {products.length === 0 && !loading ? (
              <div className="no-products-category">
                <span className="no-products-icon">🔍</span>
                <h3>Aucun produit trouvé</h3>
                <p>Essayez de modifier vos filtres</p>
                <Button variant="outline" onClick={clearFilters}>
                  Réinitialiser les filtres
                </Button>
              </div>
            ) : (
              <>
                <div className="products-grid-category">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Loading Skeletons */}
                {loading && (
                  <div className="products-grid-category">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="product-skeleton">
                        <div className="skeleton-image" />
                        <div className="skeleton-content">
                          <div className="skeleton-line" />
                          <div className="skeleton-line short" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Load More */}
                {hasMore && !loading && (
                  <div className="load-more-category">
                    <Button variant="outline" onClick={handleLoadMore}>
                      Voir plus de produits
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>

        {/* Related Categories */}
        <section className="related-categories">
          <h2>Catégories similaires</h2>
          <div className="related-categories-grid">
            {Object.entries(categories)
              .filter(([key]) => key !== category?.toLowerCase())
              .slice(0, 4)
              .map(([key, cat]) => (
                <div
                  key={key}
                  className="related-category-card"
                  onClick={() => navigate(`/category/${key}`)}
                  style={{ '--category-color': cat.color }}
                >
                  <span className="related-category-icon">{cat.icon}</span>
                  <h3>{cat.name}</h3>
                  <span className="related-category-link">Découvrir →</span>
                </div>
              ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default CategoryPage;