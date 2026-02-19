import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import { ordersApi } from '../api/orders';
import './OrderDetail.css';

const OrderDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const data = await ordersApi.getOrderById(id);
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (!order) return <div className="not-found">Commande non trouvée</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="order-detail-page"
    >
      <div className="container">
        <h1>Détail de la commande #{order.orderNumber}</h1>
        {/* Contenu du détail de commande */}
      </div>
    </motion.div>
  );
};

export default OrderDetail;