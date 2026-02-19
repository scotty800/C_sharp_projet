import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import StatsCards from '../../components/dashboard/StatsCards';  // ✅ Correction: ../ -> ../../
import RevenueChart from '../../components/dashboard/RevenueChart';  // ✅ Correction
import TopProducts from '../../components/dashboard/TopProducts';  // ✅ Correction
import RecentOrders from '../../components/dashboard/RecentOrders';  // ✅ Correction
import './ShopDashboard.css';

const ShopDashboard = () => {
  const { id } = useParams();

  // Données mockées pour l'exemple
  const stats = {
    revenue: 12580,
    revenueChange: '+15%',
    orders: 342,
    ordersChange: '+8%',
    productsSold: 567,
    productsChange: '+12%',
    visitors: 2341,
    visitorsChange: '+24%'
  };

  const chartData = [
    { label: 'Lun', value: 1200 },
    { label: 'Mar', value: 1800 },
    { label: 'Mer', value: 1400 },
    { label: 'Jeu', value: 2200 },
    { label: 'Ven', value: 2800 },
    { label: 'Sam', value: 2400 },
    { label: 'Dim', value: 1900 }
  ];

  const topProducts = [
    { id: 1, name: 'Produit 1', category: 'Mode', sales: 45, revenue: 2250, trend: 12 },
    { id: 2, name: 'Produit 2', category: 'Électronique', sales: 38, revenue: 4560, trend: 8 },
    { id: 3, name: 'Produit 3', category: 'Maison', sales: 32, revenue: 1920, trend: -3 },
    { id: 4, name: 'Produit 4', category: 'Beauté', sales: 28, revenue: 1120, trend: 15 },
    { id: 5, name: 'Produit 5', category: 'Sports', sales: 24, revenue: 1680, trend: 5 }
  ];

  const recentOrders = [
    { id: 1, orderNumber: 'CMD-001', createdAt: new Date(), userName: 'Jean Dupont', finalAmount: 89.99, status: 'delivered' },
    { id: 2, orderNumber: 'CMD-002', createdAt: new Date(), userName: 'Marie Martin', finalAmount: 145.50, status: 'processing' },
    { id: 3, orderNumber: 'CMD-003', createdAt: new Date(), userName: 'Pierre Durand', finalAmount: 67.80, status: 'shipped' },
    { id: 4, orderNumber: 'CMD-004', createdAt: new Date(), userName: 'Sophie Lefebvre', finalAmount: 234.00, status: 'pending' },
    { id: 5, orderNumber: 'CMD-005', createdAt: new Date(), userName: 'Thomas Bernard', finalAmount: 56.90, status: 'delivered' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="shop-dashboard-page"
    >
      <div className="container">
        <h1>Dashboard de la boutique #{id}</h1>
        
        <StatsCards stats={stats} />
        
        <div className="dashboard-charts">
          <RevenueChart data={chartData} period="week" />
          <TopProducts products={topProducts} />
        </div>
        
        <RecentOrders orders={recentOrders} />
      </div>
    </motion.div>
  );
};

export default ShopDashboard;