import React from 'react';
import { motion } from 'framer-motion';
import './AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="admin-dashboard-page"
    >
      <div className="container">
        <h1>Dashboard Admin</h1>
        {/* Stats globales de la plateforme */}
      </div>
    </motion.div>
  );
};

export default AdminDashboard;