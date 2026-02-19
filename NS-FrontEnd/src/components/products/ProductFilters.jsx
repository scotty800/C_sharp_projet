import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import Input from '../common/Input';
import './ProductFilters.css';

const ProductFilters = ({ filters, onFilterChange, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    category: true,
    rating: true,
    stock: true
  });

  const categories = [
    'Mode', 'Électronique', 'Maison', 'Beauté', 
    'Sports', 'Livres', 'Artisanat', 'Vintage'
  ];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    if (onClose) onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      minPrice: '',
      maxPrice: '',
      category: '',
      rating: 0,
      inStock: false,
      sort: 'popular'
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="product-filters">
      <div className="filters-header">
        <h3>Filtres</h3>
        <button className="reset-filters" onClick={handleReset}>
          Réinitialiser
        </button>
      </div>

      {/* Price Range */}
      <div className="filter-section">
        <div 
          className="filter-section-header"
          onClick={() => toggleSection('price')}
        >
          <h4>Prix</h4>
          <span className={`chevron ${expandedSections.price ? 'expanded' : ''}`}>
            ▼
          </span>
        </div>
        
        <AnimatePresence>
          {expandedSections.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="filter-section-content"
            >
              <div className="price-range">
                <Input
                  type="number"
                  placeholder="Min"
                  value={localFilters.minPrice}
                  onChange={(e) => handleChange('minPrice', e.target.value)}
                  min="0"
                />
                <span className="price-separator">-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={localFilters.maxPrice}
                  onChange={(e) => handleChange('maxPrice', e.target.value)}
                  min="0"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Categories */}
      <div className="filter-section">
        <div 
          className="filter-section-header"
          onClick={() => toggleSection('category')}
        >
          <h4>Catégories</h4>
          <span className={`chevron ${expandedSections.category ? 'expanded' : ''}`}>
            ▼
          </span>
        </div>
        
        <AnimatePresence>
          {expandedSections.category && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="filter-section-content"
            >
              <div className="category-list">
                {categories.map(cat => (
                  <label key={cat} className="category-item">
                    <input
                      type="radio"
                      name="category"
                      value={cat}
                      checked={localFilters.category === cat}
                      onChange={(e) => handleChange('category', e.target.value)}
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rating */}
      <div className="filter-section">
        <div 
          className="filter-section-header"
          onClick={() => toggleSection('rating')}
        >
          <h4>Note minimum</h4>
          <span className={`chevron ${expandedSections.rating ? 'expanded' : ''}`}>
            ▼
          </span>
        </div>
        
        <AnimatePresence>
          {expandedSections.rating && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="filter-section-content"
            >
              <div className="rating-filter">
                {[5, 4, 3, 2, 1].map(rating => (
                  <label key={rating} className="rating-item">
                    <input
                      type="radio"
                      name="rating"
                      value={rating}
                      checked={localFilters.rating === rating}
                      onChange={(e) => handleChange('rating', parseInt(e.target.value))}
                    />
                    <span>
                      {'⭐'.repeat(rating)}
                      {rating > 1 ? ' et plus' : ' et plus'}
                    </span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stock */}
      <div className="filter-section">
        <div 
          className="filter-section-header"
          onClick={() => toggleSection('stock')}
        >
          <h4>Disponibilité</h4>
          <span className={`chevron ${expandedSections.stock ? 'expanded' : ''}`}>
            ▼
          </span>
        </div>
        
        <AnimatePresence>
          {expandedSections.stock && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="filter-section-content"
            >
              <label className="stock-filter">
                <input
                  type="checkbox"
                  checked={localFilters.inStock}
                  onChange={(e) => handleChange('inStock', e.target.checked)}
                />
                <span>En stock uniquement</span>
              </label>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sort */}
      <div className="filter-section">
        <h4>Trier par</h4>
        <select
          value={localFilters.sort}
          onChange={(e) => handleChange('sort', e.target.value)}
          className="sort-select"
        >
          <option value="popular">Plus populaires</option>
          <option value="newest">Plus récents</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
          <option value="rating">Meilleures notes</option>
        </select>
      </div>

      {/* Apply Button */}
      <div className="filters-actions">
        <Button fullWidth onClick={handleApply}>
          Appliquer les filtres
        </Button>
      </div>
    </div>
  );
};

export default ProductFilters;