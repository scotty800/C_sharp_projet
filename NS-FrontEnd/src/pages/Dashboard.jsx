import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import { shopsApi } from '../api/shops';
import './Dashboard.css';

const Dashboard = () => {
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
      console.log('Mes boutiques:', data); // Debug
      
      // ✅ S'assurer que data est un tableau
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
    navigate(`/shop/${slug}`);
  };

  const handleAddProduct = (shopId) => {
    navigate(`/dashboard/products/new?shop=${shopId}`);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="dashboard-page"
    >
      <div className="container">
        <div className="dashboard-header">
          <h1>Tableau de bord</h1>
          <Button onClick={() => navigate('/create-shop')}>
            + Nouvelle boutique
          </Button>
        </div>

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        {/* Mes boutiques */}
        <section className="dashboard-section">
          <h2>Mes boutiques</h2>
          
          {shops.length === 0 ? (
            <div className="empty-shops">
              <p>Vous n'avez pas encore de boutique.</p>
              <Button variant="outline" onClick={() => navigate('/create-shop')}>
                Créer ma première boutique
              </Button>
            </div>
          ) : (
            <div className="shops-grid-dashboard">
              {shops.map(shop => (
                <div key={shop.id} className="shop-card-dashboard">
                  <div className="shop-card-header">
                    {shop.logoUrl ? (
                      <img 
                        src={`http://127.0.0.1:5019${shop.logoUrl}`} 
                        alt={shop.name}
                        className="shop-logo-small"
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
                      <p className="shop-slug">/shop/{shop.slug}</p>
                      <p className="shop-stats">
                        {shop.productCount || 0} produits
                      </p>
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
        </section>

        {/* Statistiques globales */}
        {shops.length > 0 && (
          <section className="dashboard-section">
            <h2>Aperçu global</h2>
            <div className="stats-cards">
              <div className="stat-card">
                <span className="stat-value">{shops.length}</span>
                <span className="stat-label">Boutiques</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">
                  {shops.reduce((acc, shop) => acc + (shop.productCount || 0), 0)}
                </span>
                <span className="stat-label">Produits</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">
                  {shops.reduce((acc, shop) => acc + (shop.orderCount || 0), 0)}
                </span>
                <span className="stat-label">Commandes</span>
              </div>
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;