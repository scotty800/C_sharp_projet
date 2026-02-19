import React from 'react';
import ShopCard from './ShopCard';
import { SkeletonShop } from '../common/Skeleton';
import './ShopGrid.css';

const ShopGrid = ({ shops, loading, columns = 4 }) => {
  if (loading) {
    return (
      <div className={`shop-grid shop-grid-${columns}`}>
        {[...Array(8)].map((_, i) => (
          <SkeletonShop key={i} />
        ))}
      </div>
    );
  }

  if (!shops?.length) {
    return (
      <div className="shop-grid-empty">
        <span className="empty-icon">🏪</span>
        <h3>Aucune boutique trouvée</h3>
        <p>Essayez de modifier vos critères de recherche</p>
      </div>
    );
  }

  return (
    <div className={`shop-grid shop-grid-${columns}`}>
      {shops.map(shop => (
        <ShopCard key={shop.id} shop={shop} />
      ))}
    </div>
  );
};

export default ShopGrid;