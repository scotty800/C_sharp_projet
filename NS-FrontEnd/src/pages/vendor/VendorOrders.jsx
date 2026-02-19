import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ordersApi } from '../../api/orders';
import { useAuth } from '../../hooks/useAuth';
import './VendorOrders.css';

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const data = await ordersApi.getVendorOrders();
    setOrders(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="vendor-orders-page"
    >
      <div className="container">
        <h1>Commandes de mes boutiques</h1>
        {/* Liste des commandes */}
      </div>
    </motion.div>
  );
};

export default VendorOrders;