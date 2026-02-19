import React from 'react';
import { Link } from 'react-router-dom';
import './TopProducts.css';

const TopProducts = ({ products }) => {
  return (
    <div className="top-products">
      <div className="top-products-header">
        <h4>Produits les plus vendus</h4>
        <Link to="/dashboard/products" className="view-all">
          Voir tout
        </Link>
      </div>

      <div className="top-products-list">
        {products.map((product, index) => (
          <div key={product.id} className="top-product-item">
            <div className="product-rank">{index + 1}</div>
            
            <div className="product-image">
              <img 
                src={product.imageUrl || '/default-product.jpg'} 
                alt={product.name}
              />
            </div>
            
            <div className="product-info">
              <h5>{product.name}</h5>
              <p className="product-category">{product.category}</p>
            </div>
            
            <div className="product-stats">
              <div className="stat">
                <span className="stat-value">{product.sales || 0}</span>
                <span className="stat-label">ventes</span>
              </div>
              <div className="stat">
                <span className="stat-value">{product.revenue?.toFixed(2) || '0'}€</span>
                <span className="stat-label">CA</span>
              </div>
              <div className={`trend ${product.trend > 0 ? 'up' : 'down'}`}>
                {product.trend > 0 ? '↑' : '↓'} {Math.abs(product.trend)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {!products?.length && (
        <div className="no-products">
          <p>Aucun produit vendu pour le moment</p>
        </div>
      )}
    </div>
  );
};

export default TopProducts;