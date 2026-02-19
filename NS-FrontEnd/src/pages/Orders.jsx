import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import { ordersApi } from '../api/orders';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await ordersApi.getMyOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status.toLowerCase() === filter.toLowerCase();
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      processing: 'info',
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'danger',
      refunded: 'secondary'
    };
    return colors[status.toLowerCase()] || 'secondary';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'En attente',
      processing: 'En traitement',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
      refunded: 'Remboursée'
    };
    return labels[status.toLowerCase()] || status;
  };

  if (loading) {
    return (
      <div className="orders-page-loading">
        <div className="container">
          {[1, 2, 3].map(i => (
            <div key={i} className="order-skeleton">
              <div className="skeleton-header" />
              <div className="skeleton-items">
                <div className="skeleton-item" />
                <div className="skeleton-item" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="orders-page"
    >
      <div className="container">
        <div className="orders-header">
          <h1 className="orders-title">Mes commandes</h1>
          
          {/* Filters */}
          <div className="orders-filters">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Toutes
            </button>
            <button
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              En attente
            </button>
            <button
              className={`filter-btn ${filter === 'processing' ? 'active' : ''}`}
              onClick={() => setFilter('processing')}
            >
              En traitement
            </button>
            <button
              className={`filter-btn ${filter === 'shipped' ? 'active' : ''}`}
              onClick={() => setFilter('shipped')}
            >
              Expédiées
            </button>
            <button
              className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
              onClick={() => setFilter('delivered')}
            >
              Livrées
            </button>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <span className="no-orders-icon">📦</span>
            <h2>Aucune commande</h2>
            <p>Vous n'avez pas encore passé de commande.</p>
            <Button onClick={() => window.location.href = '/products'}>
              Découvrir nos produits
            </Button>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <div className="order-info">
                    <span className="order-number">Commande #{order.orderNumber}</span>
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="order-status">
                    <span className={`status-badge ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <span className="order-total">
                      Total: <strong>{order.finalAmount?.toFixed(2)}€</strong>
                    </span>
                  </div>
                </div>

                <div className="order-items-preview">
                  {order.items?.slice(0, 3).map(item => (
                    <div key={item.id} className="order-item-preview">
                      <div className="preview-image">
                        <img 
                          src={item.productImage || '/default-product.jpg'} 
                          alt={item.productName}
                        />
                      </div>
                      <div className="preview-info">
                        <span className="preview-name">{item.productName}</span>
                        <span className="preview-quantity">x{item.quantity}</span>
                      </div>
                    </div>
                  ))}
                  
                  {order.items?.length > 3 && (
                    <div className="more-items">
                      +{order.items.length - 3} autres articles
                    </div>
                  )}
                </div>

                <div className="order-card-footer">
                  <Link to={`/orders/${order.id}`} className="order-details-link">
                    Voir les détails →
                  </Link>
                  
                  {order.status === 'delivered' && (
                    <Button variant="outline" size="sm">
                      Écrire un avis
                    </Button>
                  )}
                  
                  {order.status === 'pending' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="cancel-order"
                      onClick={() => handleCancelOrder(order.id)}
                    >
                      Annuler la commande
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Orders;