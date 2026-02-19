import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { shopsApi } from '../../api/shops';
import './AdminShops.css';

const AdminShops = () => {
  const [shops, setShops] = useState([]);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    const data = await shopsApi.getAllShops();
    setShops(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="admin-shops-page"
    >
      <div className="container">
        <h1>Gestion des boutiques</h1>
        {/* Liste des boutiques */}
      </div>
    </motion.div>
  );
};

export default AdminShops;