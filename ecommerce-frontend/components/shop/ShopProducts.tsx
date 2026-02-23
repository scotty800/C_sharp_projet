'use client';

import { useState } from 'react';
import { Product } from '@/types/product';
import ProductCard from '@/components/product/ProductCard';
import { FiFilter, FiGrid, FiList } from 'react-icons/fi';

interface ShopProductsProps {
  products: Product[];
  totalCount: number;
  loading?: boolean;
  onPageChange?: (page: number) => void;
  onSortChange?: (sort: string) => void;
}

const ShopProducts = ({ 
  products, 
  totalCount, 
  loading = false,
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
            <div className="bg-gray-200 h-48 rounded-lg mb-4" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Aucun produit trouvé</p>
      </div>
    );
  }

  return (
    <div>
      {/* En-tête avec filtres et tri */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <p className="text-gray-600">
          <span className="font-semibold">{totalCount}</span> produits
        </p>

        <div className="flex items-center gap-4">
          {/* Bouton filtres mobile */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <FiFilter />
            Filtres
          </button>

          {/* Sélecteur de tri */}
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Boutons d'affichage */}
          <div className="hidden sm:flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
            >
              <FiGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
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
          />
        ))}
      </div>

      {/* Pagination (à implémenter) */}
      {totalCount > 12 && (
        <div className="flex justify-center mt-8">
          <nav className="flex gap-2">
            {/* Boutons de pagination */}
          </nav>
        </div>
      )}
    </div>
  );
};

export default ShopProducts;