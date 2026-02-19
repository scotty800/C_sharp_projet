import React from 'react';
import ProductCard from './ProductCard';
import { SkeletonProduct } from '../common/Skeleton';
import './ProductGrid.css';

const ProductGrid = ({ products, loading, columns = 4 }) => {
  if (loading) {
    return (
      <div className={`product-grid product-grid-${columns}`}>
        {[...Array(8)].map((_, i) => (
          <SkeletonProduct key={i} />
        ))}
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="product-grid-empty">
        <span className="empty-icon">🔍</span>
        <h3>Aucun produit trouvé</h3>
        <p>Essayez de modifier vos critères de recherche</p>
      </div>
    );
  }

  return (
    <div className={`product-grid product-grid-${columns}`}>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;