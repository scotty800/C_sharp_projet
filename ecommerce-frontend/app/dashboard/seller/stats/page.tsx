'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { StatsCard, TopProducts } from '@/components/dashboard';
import { RealChart } from '@/components/dashboard/RealChart';
import {
  FiDollarSign, FiShoppingBag, FiEye, FiUsers, FiPackage, FiTrendingUp
} from 'react-icons/fi';
import { dashboardService } from '@/services/api/dashboard';
import { ShopDashboard } from '@/types';
import { formatPrice } from '@/services/utils/formatters';

const DEVICE_COLORS: Record<string, string> = {
  mobile: '#6366f1',
  desktop: '#10b981',
  tablet: '#f59e0b',
  unknown: '#9ca3af',
};

const DEVICE_LABELS: Record<string, string> = {
  mobile: 'Mobile',
  desktop: 'Ordinateur',
  tablet: 'Tablette',
  unknown: 'Inconnu',
};

// ⭐ Construit un tableau complet 00h → 23h, même si certaines heures n'ont aucune visite
function buildHourlyData(visitsByHour: Record<string, number>) {
  const labels: string[] = [];
  const values: number[] = [];
  for (let h = 0; h < 24; h++) {
    const key = h.toString().padStart(2, '0') + 'h';
    labels.push(key);
    values.push(visitsByHour[key] || 0);
  }
  return { labels, values };
}

export default function SellerStatsPage() {
  const searchParams = useSearchParams();
  const shopId = Number(searchParams.get('shopId'));
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<ShopDashboard | null>(null);

  useEffect(() => {
    if (!shopId) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getShopDashboard(shopId);
        setDashboard(data);
      } catch (error) {
        console.error('Erreur chargement statistiques:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [shopId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
        <p className="text-gray-500 dark:text-gray-400">Aucune statistique disponible</p>
      </div>
    );
  }

  const conversionRate = dashboard.totalVisits > 0
    ? ((dashboard.totalOrders / dashboard.totalVisits) * 100).toFixed(1)
    : 'N/A';

  const summaryCards = [
    { title: 'Visites totales (30j)', value: dashboard.totalVisits, icon: FiEye, color: 'blue' as const },
    { title: 'Visiteurs uniques', value: dashboard.uniqueVisitors, icon: FiUsers, color: 'purple' as const },
    { title: 'Commandes (30j)', value: dashboard.totalOrders, icon: FiShoppingBag, color: 'green' as const },
    { title: "Chiffre d'affaires (30j)", value: formatPrice(dashboard.totalRevenue), icon: FiDollarSign, color: 'primary' as const },
    { title: 'Produits vendus', value: dashboard.totalProductsSold, icon: FiPackage, color: 'orange' as const },
    { title: 'Taux de conversion', value: conversionRate === 'N/A' ? 'N/A' : `${conversionRate}%`, icon: FiTrendingUp, color: 'blue' as const },
  ];

  // ─── Revenus par jour ───
  const revenueChartData = {
    labels: dashboard.dailyRevenue.map(d => new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })),
    datasets: [{
      label: 'Revenus (€)',
      data: dashboard.dailyRevenue.map(d => d.amount || 0),
      borderColor: '#6366f1',
      backgroundColor: '#6366f120',
      fill: true,
      tension: 0.4,
    }],
  };

  // ─── Commandes par jour ───
  const ordersChartData = {
    labels: dashboard.dailyOrders.map(d => new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })),
    datasets: [{
      label: 'Commandes',
      data: dashboard.dailyOrders.map(d => d.count),
      backgroundColor: '#10b981',
      borderRadius: 6,
    }],
  };

  // ─── Visites par jour ───
  const visitsChartData = {
    labels: dashboard.dailyVisits.map(d => new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })),
    datasets: [{
      label: 'Visites',
      data: dashboard.dailyVisits.map(d => d.count),
      borderColor: '#f59e0b',
      backgroundColor: '#f59e0b20',
      fill: true,
      tension: 0.4,
    }],
  };

  // ─── Répartition par appareil ───
  const deviceEntries = Object.entries(dashboard.visitsByDevice || {});
  const deviceChartData = {
    labels: deviceEntries.map(([key]) => DEVICE_LABELS[key] || key),
    datasets: [{
      data: deviceEntries.map(([, count]) => count),
      backgroundColor: deviceEntries.map(([key]) => DEVICE_COLORS[key] || '#9ca3af'),
      borderWidth: 0,
    }],
  };

  // ─── Visites par heure ───
  const hourly = buildHourlyData(dashboard.visitsByHour || {});
  const hourlyChartData = {
    labels: hourly.labels,
    datasets: [{
      label: 'Visites',
      data: hourly.values,
      backgroundColor: '#8b5cf6',
      borderRadius: 4,
    }],
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Statistiques détaillées</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analyse complète de votre activité sur les 30 derniers jours.
        </p>
      </div>

      {/* Cartes résumé */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {summaryCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Revenus */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Évolution des revenus</h3>
        {dashboard.dailyRevenue.length > 0 ? (
          <RealChart type="line" data={revenueChartData} height={300} />
        ) : (
          <div className="h-72 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Aucune donnée de vente disponible</p>
          </div>
        )}
      </div>

      {/* Commandes + Visites côte à côte */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Commandes par jour</h3>
          {dashboard.dailyOrders.length > 0 ? (
            <RealChart type="bar" data={ordersChartData} height={260} />
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">Aucune commande</p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Visites par jour</h3>
          {dashboard.dailyVisits.length > 0 ? (
            <RealChart type="line" data={visitsChartData} height={260} />
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">Aucune visite</p>
            </div>
          )}
        </div>
      </div>

      {/* Device + Heures côte à côte */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Répartition par appareil</h3>
          {deviceEntries.length > 0 ? (
            <RealChart type="doughnut" data={deviceChartData} height={260} />
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">Aucune donnée disponible</p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Visites par heure</h3>
          <RealChart type="bar" data={hourlyChartData} height={260} />
        </div>
      </div>

      {/* ⭐ MODIFICATION — Top produits avec titres et messages personnalisés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProducts
          products={dashboard.topProductsBySales}
          title="Produits les plus vendus"
          emptyMessage="Aucun produit vendu sur les 30 derniers jours"
        />
        <TopProducts
          products={dashboard.topProductsByViews}
          title="Produits les plus consultés"
          emptyMessage="Aucune vue produit enregistrée sur les 30 derniers jours"
        />
      </div>
    </div>
  );
}