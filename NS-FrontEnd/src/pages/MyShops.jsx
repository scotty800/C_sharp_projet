import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import { shopsApi } from '../api/shops';
import './MyShops.css';

const MyShops = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyShops();
  }, []);

  const fetchMyShops = async () => {
    try {
      setLoading(true);
      const data = await shopsApi.getMyShops();
      console.log('📦 Mes boutiques:', data);
      setShops(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching shops:', err);
      setError('Impossible de charger vos boutiques');
    } finally {
      setLoading(false);
    }
  };

  const handleEditShop = (shopId) => {
    navigate(`/edit-shop/${shopId}`);
  };

  const handleViewShop = (slug) => {
    navigate(`/shops/${slug}`);
  };

  const handleAddProduct = (shopId) => {
    console.log('🛒 Ajout produit pour shop ID:', shopId);
    navigate(`/dashboard/products/new?shop=${shopId}`);
  };

  if (loading) {
    return (
      <div className="my-shops-loading">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-shops-error">
        <p>{error}</p>
        <Button onClick={fetchMyShops}>Réessayer</Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="my-shops-page"
    >
      <div className="container">
        <div className="my-shops-header">
          <h1>Mes boutiques</h1>
          <Button onClick={() => navigate('/create-shop')}>
            + Créer une boutique
          </Button>
        </div>

        {shops.length === 0 ? (
          <div className="no-shops">
            <span className="no-shops-icon">🏪</span>
            <h2>Vous n'avez pas encore de boutique</h2>
            <p>Créez votre première boutique et commencez à vendre !</p>
            <Button onClick={() => navigate('/create-shop')}>
              Créer ma première boutique
            </Button>
          </div>
        ) : (
          <div className="shops-grid">
            {shops.map(shop => (
              <div key={shop.id} className="shop-card">
                <div className="shop-card-header">
                  {shop.logoUrl ? (
                    <img 
                      src={`http://127.0.0.1:5019${shop.logoUrl}`} 
                      alt={shop.name}
                      className="shop-logo"
                      onError={(e) => {
                        e.target.src = '/default-shop-logo.png';
                      }}
                    />
                  ) : (
                    <div className="shop-logo-placeholder">
                      {shop.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="shop-info">
                    <h3>{shop.name}</h3>
                    <p className="shop-slug">/shops/{shop.slug}</p>
                    <p className="shop-stats">{shop.productCount || 0} produits</p>
                  </div>
                </div>

                <div className="shop-card-actions">
                  <button 
                    className="action-btn view"
                    onClick={() => handleViewShop(shop.slug)}
                  >
                    Voir
                  </button>
                  <button 
                    className="action-btn edit"
                    onClick={() => handleEditShop(shop.id)}
                  >
                    Modifier
                  </button>
                  <button 
                    className="action-btn add"
                    onClick={() => handleAddProduct(shop.id)}
                  >
                    + Produit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MyShops;