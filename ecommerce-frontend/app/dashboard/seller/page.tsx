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
import { formatPrice } from '@/services/utils/formatters';
import { OrderResponseDto } from '@/types/order';

// Interface correspondant au type réel retourné par l'API
interface DailyStats {
  date: string;
  amount?: number; // amount peut être undefined
}

interface DashboardStats {
  monthRevenue: number;
  monthOrders: number;
  monthVisits: number;
}

interface DashboardData {
  dailyRevenue: DailyStats[];
  topProducts: any[];
}

export default function SellerDashboard() {
  const searchParams = useSearchParams();
  const shopId = Number(searchParams.get('shopId'));
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderResponseDto[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [chartData, setChartData] = useState({
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    values: [1200, 1900, 1500, 2100, 2800, 2400, 3200],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!shopId) return;

      try {
        setLoading(true);
        
        // Récupérer les stats du dashboard
        const dashboardStats = await dashboardService.getDashboardSummary(shopId);
        setStats(dashboardStats);

        // Récupérer les commandes récentes
        const orders = await orderService.getShopOrders(shopId);
        setRecentOrders(orders.slice(0, 5));

        // Récupérer les produits les plus vendus
        const products = await dashboardService.getTopProductsByViews(shopId, 5);
        setTopProducts(products);

        // Récupérer les données du graphique
        const dashboard = await dashboardService.getShopDashboard(shopId);
        
        // ✅ CORRECTION : Utilisation du type réel DailyStats
        const labels = dashboard.dailyRevenue.map((d: DailyStats) => {
          try {
            const date = new Date(d.date);
            if (isNaN(date.getTime())) {
              return 'Date';
            }
            return date.toLocaleDateString('fr-FR', { weekday: 'short' });
          } catch {
            return 'Date';
          }
        });

        // ✅ CORRECTION : Gestion de amount qui peut être undefined
        const values = dashboard.dailyRevenue.map((d: DailyStats) => 
          typeof d.amount === 'number' ? d.amount : 0
        );

        setChartData({
          labels,
          values,
        });
      } catch (error) {
        console.error('Erreur chargement dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    if (shopId) {
      fetchDashboardData();
    }
  }, [shopId]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calcul sécurisé du taux de conversion
  const conversionRate = stats.monthVisits > 0 
    ? ((stats.monthOrders / stats.monthVisits) * 100).toFixed(1)
    : '0.0';

  const statCards = [
    {
      title: "Chiffre d'affaires",
      value: formatPrice(stats.monthRevenue || 0),
      icon: FiDollarSign,
      trend: { value: 12, isPositive: true },
      color: 'primary' as const,
    },
    {
      title: 'Commandes',
      value: stats.monthOrders || 0,
      icon: FiShoppingBag,
      trend: { value: 8, isPositive: true },
      color: 'green' as const,
    },
    {
      title: 'Visiteurs',
      value: stats.monthVisits || 0,
      icon: FiEye,
      trend: { value: 5, isPositive: true },
      color: 'blue' as const,
    },
    {
      title: 'Taux de conversion',
      value: `${conversionRate}%`,
      icon: FiUsers,
      trend: { value: 2, isPositive: false },
      color: 'purple' as const,
    },
  ];

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Graphique et produits populaires */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
          <Chart 
            data={chartData} 
            title="Évolution des ventes" 
          />
        </div>
        <div className="lg:col-span-1">
          <TopProducts products={topProducts} />
        </div>
      </div>

      {/* Commandes récentes */}
      <RecentOrders orders={recentOrders} />

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