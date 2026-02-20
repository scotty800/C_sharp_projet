import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import { ordersApi } from '../api/orders';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]); // ✅ Toujours un tableau
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ordersApi.getMyOrders();
      
      // ✅ S'assurer que data est un tableau
      if (Array.isArray(data)) {
        setOrders(data);
      } else if (data?.data && Array.isArray(data.data)) {
        setOrders(data.data);
      } else {
        console.warn('Orders data is not an array:', data);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Impossible de charger vos commandes');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Filtrer les commandes avec vérification
  const filteredOrders = Array.isArray(orders) 
    ? orders.filter(order => {
        if (filter === 'all') return true;
        return order?.status?.toLowerCase() === filter.toLowerCase();
      })
    : [];

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      processing: 'info',
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'danger',
      refunded: 'secondary'
    };
    return colors[status?.toLowerCase()] || 'secondary';
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
    return labels[status?.toLowerCase()] || status;
  };

  if (loading) {
    return (
      <div className="orders-loading">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-error">
        <p>{error}</p>
        <Button onClick={fetchOrders}>Réessayer</Button>
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
          
          {/* Filtres */}
          <div className="orders-filters">
            {['all', 'pending', 'processing', 'shipped', 'delivered'].map(f => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'Toutes' : getStatusLabel(f)}
              </button>
            ))}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <span className="no-orders-icon">📦</span>
            <h2>Aucune commande</h2>
            <p>Vous n'avez pas encore passé de commande.</p>
            <Link to="/products">
              <Button>Découvrir nos produits</Button>
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <div className="order-info">
                    <span className="order-number">Commande #{order.orderNumber}</span>
                    <span className="order-date">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
                    </span>
                  </div>
                  
                  <div className="order-status">
                    <span className={`status-badge ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <span className="order-total">
                      Total: <strong>{order.finalAmount?.toFixed(2) || '0.00'}€</strong>
                    </span>
                  </div>
                </div>

                <div className="order-items-preview">
                  {Array.isArray(order.items) && order.items.slice(0, 3).map(item => (
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