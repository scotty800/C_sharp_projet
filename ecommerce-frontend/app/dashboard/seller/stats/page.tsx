'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  StatsCard, 
  RecentOrders, 
  Chart, 
  TopProducts
} from '@/components/dashboard';
import { 
  FiDollarSign, 
  FiShoppingBag, 
  FiUsers, 
  FiEye,
  FiPackage,
  FiStar
} from 'react-icons/fi';
import { dashboardService } from '@/services/api/dashboard';
import { orderService } from '@/services/api/orders';
import { OrderResponseDto } from '@/types/order';
import { formatPrice } from '@/services/utils/formatters';

export default function SellerDashboard() {
  const searchParams = useSearchParams();
  const shopId = Number(searchParams.get('shopId'));
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<OrderResponseDto[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  
  // Initialiser avec des données vides
  const [chartData, setChartData] = useState<{
    labels: string[];
    values: number[];
  }>({
    labels: [],
    values: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!shopId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Récupérer les stats du dashboard
        try {
          const dashboardStats = await dashboardService.getDashboardSummary(shopId);
          setStats(dashboardStats || {});
        } catch (error) {
          console.error('Erreur chargement stats:', error);
          setStats({});
        }

        // Récupérer les commandes récentes
        try {
          const orders = await orderService.getShopOrders(shopId);
          setRecentOrders(Array.isArray(orders) ? orders.slice(0, 5) : []);
        } catch (error) {
          console.error('Erreur chargement commandes:', error);
          setRecentOrders([]);
        }

        // Récupérer les produits les plus vendus
        try {
          const products = await dashboardService.getTopProductsByViews(shopId, 5);
          setTopProducts(Array.isArray(products) ? products : []);
        } catch (error) {
          console.error('Erreur chargement top produits:', error);
          setTopProducts([]);
        }

        // Récupérer les données du graphique
        try {
          const dashboard = await dashboardService.getShopDashboard(shopId);
          if (dashboard && dashboard.dailyRevenue && dashboard.dailyRevenue.length > 0) {
            const validValues = dashboard.dailyRevenue
              .map(d => d.amount)
              .filter((amount): amount is number => amount !== undefined && amount !== null);
            
            if (validValues.length > 0) {
              setChartData({
                labels: dashboard.dailyRevenue.map(d => 
                  new Date(d.date).toLocaleDateString('fr-FR', { weekday: 'short' })
                ),
                values: validValues,
              });
            }
          }
        } catch (error) {
          console.error('Erreur chargement graphique:', error);
        }
      } catch (error) {
        console.error('Erreur chargement dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [shopId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculer les tendances (comparaison mois précédent)
  const calculateTrend = (current: number, previous: number) => {
    if (!previous || previous === 0) return undefined;
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.round(Math.abs(change) * 10) / 10,
      isPositive: change > 0,
    };
  };

  // Valeurs mockées pour les mois précédents (à remplacer par de vraies données)
  const previousMonthRevenue = stats?.monthRevenue ? stats.monthRevenue * 0.8 : 0; // Exemple: -20%
  const previousMonthOrders = stats?.monthOrders ? stats.monthOrders * 1.1 : 0;   // Exemple: +10%
  const previousMonthVisits = stats?.monthVisits ? stats.monthVisits * 0.95 : 0;  // Exemple: -5%

  const statCards = stats ? [
    {
      title: 'Chiffre d\'affaires',
      value: formatPrice(stats.monthRevenue || 0),
      icon: FiDollarSign,
      trend: calculateTrend(stats.monthRevenue || 0, previousMonthRevenue),
      color: 'primary' as const,
    },
    {
      title: 'Commandes',
      value: stats.monthOrders || 0,
      icon: FiShoppingBag,
      trend: calculateTrend(stats.monthOrders || 0, previousMonthOrders),
      color: 'green' as const,
    },
    {
      title: 'Visiteurs',
      value: stats.monthVisits || 0,
      icon: FiEye,
      trend: calculateTrend(stats.monthVisits || 0, previousMonthVisits),
      color: 'blue' as const,
    },
    {
      title: 'Taux de conversion',
      value: `${((stats.monthOrders / (stats.monthVisits || 1)) * 100 || 0).toFixed(1)}%`,
      icon: FiUsers,
      trend: undefined, // Pas de tendance pour le taux de conversion
      color: 'purple' as const,
    },
  ] : [];

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Tableau de bord</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Bienvenue dans votre espace vendeur. Voici un aperçu de votre activité.
        </p>
      </div>

      {/* Statistiques */}
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-500 dark:text-gray-400">Aucune statistique disponible</p>
        </div>
      )}

      {/* Graphique et produits populaires */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {chartData.values.length > 0 ? (
            <Chart data={chartData} title="Évolution des ventes" />
          ) : (
            <div className="h-80 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">Aucune donnée de vente disponible</p>
            </div>
          )}
        </div>
        <div className="lg:col-span-1">
          <TopProducts products={topProducts} />
        </div>
      </div>

      {/* Commandes récentes */}
      {recentOrders && recentOrders.length > 0 ? (
        <RecentOrders orders={recentOrders} />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">Aucune commande récente</p>
        </div>
      )}
    </div>
  );
}