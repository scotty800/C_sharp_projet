import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../products/ProductCard';
import './TrendingSection.css';

const TrendingSection = ({ products, title = "Tendances", subtitle = "Les produits les plus populaires du moment" }) => {
  if (!products?.length) return null;

  return (
    <section className="trending-section">
      <div className="container">
        <div className="trending-header">
          <div>
            <h2 className="trending-title">
              🔥 {title}
            </h2>
            <p className="trending-subtitle">{subtitle}</p>
          </div>
          <Link to="/products?sort=trending" className="trending-view-all">
            Voir toutes les tendances →
          </Link>
        </div>

        <div className="trending-grid">
          {products.slice(0, 4).map((product, index) => (
            <div key={product.id} className={`trending-item trending-item-${index + 1}`}>
              {index === 0 && <span className="trending-badge">#1 Top vente</span>}
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;