import React from 'react';
import { Link } from 'react-router-dom';
import ShopCard from '../shops/ShopCard';
import './FeaturedShops.css';

const FeaturedShops = ({ shops, title = "Boutiques en vedette" }) => {
  if (!shops?.length) return null;

  return (
    <section className="featured-shops">
      <div className="container">
        <div className="featured-header">
          <h2 className="featured-title">
            ✨ {title}
          </h2>
          <Link to="/shops?sort=featured" className="featured-view-all">
            Découvrir toutes les boutiques →
          </Link>
        </div>

        <div className="featured-grid">
          {shops.slice(0, 6).map((shop, index) => (
            <div key={shop.id} className={`featured-shop-card featured-shop-${index + 1}`}>
              <div className="featured-shop-badge">
                {index === 0 && <span className="badge-top">⭐ Coup de cœur</span>}
                {index === 1 && <span className="badge-new">🆕 Nouvelle</span>}
                {index === 2 && <span className="badge-trending">🔥 Tendance</span>}
              </div>
              <ShopCard shop={shop} />
            </div>
          ))}
        </div>

        <div className="featured-cta">
          <h3>Vous avez une boutique ?</h3>
          <p>Rejoignez notre communauté de vendeurs et développez votre activité</p>
          <Link to="/create-shop" className="featured-cta-btn">
            Créer ma boutique
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedShops;