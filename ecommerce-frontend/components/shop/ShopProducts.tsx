'use client';

import { useState } from 'react';
import { Product } from '@/types/product';
import ProductCard from '@/components/product/ProductCard';
import { FiFilter, FiGrid, FiList } from 'react-icons/fi';

interface ShopProductsProps {
  products: Product[];
  totalCount: number;
  loading?: boolean;
  themeColor?: string;
  onPageChange?: (page: number) => void;
  onSortChange?: (sort: string) => void;
}

const ShopProducts = ({ 
  products = [],
  totalCount, 
  loading = false,
  themeColor = '#e50914',
  onPageChange,
  onSortChange 
}: ShopProductsProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const sortOptions = [
    { value: 'newest', label: 'Plus récents' },
    { value: 'price_asc', label: 'Prix croissant' },
    { value: 'price_desc', label: 'Prix décroissant' },
    { value: 'popular', label: 'Plus populaires' },
  ];

  const handleSortChange = (value: string) => {
    setSortBy(value);
    onSortChange?.(value);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">Aucun produit trouvé</p>
      </div>
    );
  }

  return (
    <div>
      {/* En-tête avec filtres et tri */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <p className="opacity-75 text-gray-600 dark:text-gray-400">
          <span className="font-semibold">{totalCount || 0}</span> produits
        </p>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            style={{ borderColor: themeColor }}
          >
            <FiFilter style={{ color: themeColor }} />
            Filtres
          </button>

          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            style={{ 
              borderColor: themeColor,
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = `0 0 0 2px ${themeColor}40`;
              e.target.style.outline = 'none';
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = 'none';
            }}
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="hidden sm:flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className="p-2 transition-colors bg-white dark:bg-gray-800"
              style={{ 
                backgroundColor: viewMode === 'grid' ? themeColor : 'transparent',
                color: viewMode === 'grid' ? 'white' : 'inherit'
              }}
            >
              <FiGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="p-2 transition-colors bg-white dark:bg-gray-800"
              style={{ 
                backgroundColor: viewMode === 'list' ? themeColor : 'transparent',
                color: viewMode === 'list' ? 'white' : 'inherit'
              }}
            >
              <FiList size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Grille de produits */}
      <div className={
        viewMode === 'grid'
          ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
          : 'space-y-4'
      }>
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            layout={viewMode}
            themeColor={themeColor}
          />
        ))}
      </div>
    </div>
  );
};

export default ShopProducts;