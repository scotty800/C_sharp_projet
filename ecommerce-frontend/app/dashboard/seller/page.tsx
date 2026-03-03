'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  StatsCard, 
  RecentOrders, 
  Chart, 
  TopProducts, 
  QuickActions 
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
  
  // Initialiser avec des données vides, pas des données mockées
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

  const statCards = stats ? [
    {
      title: 'Chiffre d\'affaires',
      value: formatPrice(stats.monthRevenue || 0),
      icon: FiDollarSign,
      trend: { value: 0, isPositive: true },
      color: 'primary' as const,
    },
    {
      title: 'Commandes',
      value: stats.monthOrders || 0,
      icon: FiShoppingBag,
      trend: { value: 0, isPositive: true },
      color: 'green' as const,
    },
    {
      title: 'Visiteurs',
      value: stats.monthVisits || 0,
      icon: FiEye,
      trend: { value: 0, isPositive: true },
      color: 'blue' as const,
    },
    {
      title: 'Taux de conversion',
      value: `${((stats.monthOrders / (stats.monthVisits || 1)) * 100 || 0).toFixed(1)}%`,
      icon: FiUsers,
      trend: { value: 0, isPositive: false },
      color: 'purple' as const,
    },
  ] : [];

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Tableau de bord</h1>
        <p className="text-gray-600">
          Bienvenue dans votre espace vendeur. Voici un aperçu de votre activité.
        </p>
      </div>

      {/* Actions rapides */}
      <QuickActions shopId={shopId} />

      {/* Statistiques */}
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">Aucune statistique disponible</p>
        </div>
      )}

      {/* Graphique et produits populaires */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
          {chartData.values.length > 0 ? (
            <Chart data={chartData} title="Évolution des ventes" />
          ) : (
            <div className="h-80 flex items-center justify-center">
              <p className="text-gray-500">Aucune donnée de vente disponible</p>
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
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-500">Aucune commande récente</p>
        </div>
      )}

      {/* Liens rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FiPackage className="text-primary" size={24} />
            </div>
            <div>
              <h3 className="font-semibold">Gestion des stocks</h3>
              <p className="text-sm text-gray-500">Mettez à jour vos quantités</p>
            </div>
          </div>
          <a
            href={`/dashboard/seller/products?shopId=${shopId}`}
            className="text-primary hover:text-primary-dark font-semibold text-sm"
          >
            Gérer le stock →
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <FiStar className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold">Avis clients</h3>
              <p className="text-sm text-gray-500">Répondez aux avis</p>
            </div>
          </div>
          <a
            href={`/dashboard/seller/reviews?shopId=${shopId}`}
            className="text-green-600 hover:text-green-700 font-semibold text-sm"
          >
            Voir les avis →
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <FiDollarSign className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold">Paiements</h3>
              <p className="text-sm text-gray-500">Historique et relevés</p>
            </div>
          </div>
          <a
            href={`/dashboard/seller/payments?shopId=${shopId}`}
            className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
          >
            Voir les paiements →
          </a>
        </div>
      </div>
    </div>
  );
}