import React from 'react';
import { Link } from 'react-router-dom';
import './ShopCard.css';

const ShopCard = ({ shop }) => {
    return (
        <Link to={`/shop/${shop.slug}`} className="shop-card">
            <div className="shop-card-image">
                <img
                    src={shop.bannerUrl || '/default-shop-banner.jpg'}
                    alt={shop.name}
                    loading="lazy"
                />

                <div className="shop-card-overlay">
                    <button className="shop-card-view">
                        voir la boutique
                    </button>
                </div>
            </div>

            <div className="shop-card-content">
                <div className="shop-card-logo">
                    {shop.logoUrl ? (
                        <img src={shop.logoUrl} alt={shop.name} />
                    ) : (
                        <span className="shop-card-logo-placeholder">
                            {shop.name[0].toUpperCase()}
                        </span>
                    )}
                </div>

                <div className="shop-card-info">
                    <h3 className="shop-card-name">{shop.name}</h3>
                    <p className="shop-card-cartegory">{shop.category || 'Boutique'}</p>

                    <div className="shop-card-stats">
                        <span className="shop-card-rating">
                            ⭐ {shop.rating || 'Nouveau'}
                        </span>
                        <span className="shop-card-products">
                            🛍️ {shop.productCount || 0} produits
                        </span>
                    </div>

                    <p className="shop-card-description">
                        {shop.description || 'Aucune description'}
                    </p>
                </div>
            </div>
        </Link>
    );
};

export default ShopCard;