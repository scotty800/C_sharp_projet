import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import { shopsApi } from '../api/shops';
import { ordersApi } from '../api/orders';
import { productsApi } from '../api/products';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shops, setShops] = useState([]);
  const [stats, setStats] = useState({
    totalShops: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les boutiques du vendeur
      const userShops = await shopsApi.getMyShops();
      setShops(userShops);

      // Calculer les stats globales
      let totalProducts = 0;
      let totalRevenue = 0;
      let allOrders = [];

      for (const shop of userShops) {
        totalProducts += shop.productCount || 0;
        
        // Récupérer les commandes de chaque boutique
        const shopOrders = await ordersApi.getShopOrders(shop.id);
        allOrders = [...allOrders, ...shopOrders];
        
        // Calculer le revenu
        const shopRevenue = shopOrders.reduce((sum, order) => 
          sum + (order.finalAmount || 0), 0);
        totalRevenue += shopRevenue;
      }

      setStats({
        totalShops: userShops.length,
        totalProducts,
        totalOrders: allOrders.length,
        totalRevenue
      });

      // Trier et prendre les 5 commandes les plus récentes
      const sortedOrders = allOrders.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      ).slice(0, 5);
      setRecentOrders(sortedOrders);

    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      processing: 'info',
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'danger'
    };
    return colors[status?.toLowerCase()] || 'secondary';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'En attente',
      processing: 'En traitement',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    return labels[status?.toLowerCase()] || status;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="container">
          <div className="loading-grid">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="dashboard-page"
    >
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Tableau de bord vendeur</h1>
            <p className="dashboard-subtitle">
              Bienvenue, {user?.username} ! Gérez vos boutiques et vos ventes.
            </p>
          </div>
          
          <Button onClick={() => navigate('/create-shop')}>
            + Nouvelle boutique
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🏪</div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalShops}</span>
              <span className="stat-label">Boutiques</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalProducts}</span>
              <span className="stat-label">Produits</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🛒</div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalOrders}</span>
              <span className="stat-label">Commandes</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <span className="stat-value">{formatCurrency(stats.totalRevenue)}</span>
              <span className="stat-label">Revenus</span>
            </div>
          </div>
        </div>

        {/* Mes boutiques */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Mes boutiques</h2>
            <Link to="/shops/my-shops" className="view-all-link">
              Voir tout →
            </Link>
          </div>

          {shops.length === 0 ? (
            <div className="empty-shops">
              <p>Vous n'avez pas encore de boutique.</p>
              <Button variant="outline" onClick={() => navigate('/create-shop')}>
                Créer ma première boutique
              </Button>
            </div>
          ) : (
            <div className="shops-list">
              {shops.map(shop => (
                <div key={shop.id} className="shop-card-dashboard">
                  <div className="shop-info">
                    <div className="shop-logo-small">
                      {shop.logoUrl ? (
                        <img src={shop.logoUrl} alt={shop.name} />
                      ) : (
                        <span className="logo-placeholder-small">
                          {shop.name[0]}
                        </span>
                      )}
                    </div>
                    <div className="shop-details">
                      <h3>{shop.name}</h3>
                      <p>{shop.productCount || 0} produits • {shop.orderCount || 0} commandes</p>
                    </div>
                  </div>
                  <div className="shop-actions">
                    <Link to={`/shop/${shop.slug}`} className="action-link">Voir</Link>
                    <Link to={`/dashboard/shops/${shop.id}`} className="action-link">Gérer</Link>
                    <Link to={`/dashboard/products/new?shop=${shop.id}`} className="action-link primary">
                      + Produit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Graphique des ventes */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Aperçu des ventes</h2>
            <div className="period-selector">
              <button 
                className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
                onClick={() => setSelectedPeriod('week')}
              >
              Semaine
              </button>
              <button 
                className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
                onClick={() => setSelectedPeriod('month')}
              >
                Mois
              </button>
              <button 
                className={`period-btn ${selectedPeriod === 'year' ? 'active' : ''}`}
                onClick={() => setSelectedPeriod('year')}
              >
                Année
              </button>
            </div>
          </div>

          <div className="chart-placeholder">
            <div className="chart-message">
              <span className="chart-icon">📊</span>
              <p>Graphique des ventes à venir</p>
              <small>Intégration avec Chart.js ou Recharts</small>
            </div>
          </div>
        </section>

        {/* Commandes récentes */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Commandes récentes</h2>
            <Link to="/dashboard/orders" className="view-all-link">
              Voir tout →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="empty-orders">
              <p>Aucune commande pour le moment.</p>
            </div>
          ) : (
            <div className="recent-orders">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>N° Commande</th>
                    <th>Date</th>
                    <th>Boutique</th>
                    <th>Client</th>
                    <th>Total</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id}>
                      <td className="order-number">#{order.orderNumber}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td>{order.shopName}</td>
                      <td>{order.userName || 'Client'}</td>
                      <td className="order-total">{formatCurrency(order.finalAmount)}</td>
                      <td>
                        <span className={`status-badge ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td>
                        <Link to={`/dashboard/orders/${order.id}`} className="order-action">
                          Détails
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Produits les plus vendus */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Top produits</h2>
            <Link to="/dashboard/products" className="view-all-link">
              Voir tout →
            </Link>
          </div>

          <div className="top-products">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="top-product-item">
                <div className="product-rank">{i}</div>
                <div className="product-info-top">
                  <div className="product-image-placeholder" />
                  <div className="product-details-top">
                    <h4>Produit exemple {i}</h4>
                    <p>Vendu 24 fois • {formatCurrency(89.99)}</p>
                  </div>
                </div>
                <div className="product-stats-top">
                  <span className="trend up">+12%</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Actions rapides */}
        <section className="dashboard-section">
          <h2>Actions rapides</h2>
          <div className="quick-actions">
            <button className="quick-action" onClick={() => navigate('/dashboard/products/new')}>
              <span className="action-icon">➕</span>
              <span>Ajouter un produit</span>
            </button>
            <button className="quick-action" onClick={() => navigate('/dashboard/orders')}>
              <span className="action-icon">📦</span>
              <span>Voir les commandes</span>
            </button>
            <button className="quick-action" onClick={() => navigate('/dashboard/analytics')}>
              <span className="action-icon">📈</span>
              <span>Analyses</span>
            </button>
            <button className="quick-action" onClick={() => navigate('/dashboard/settings')}>
              <span className="action-icon">⚙️</span>
              <span>Paramètres</span>
            </button>
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default Dashboard;