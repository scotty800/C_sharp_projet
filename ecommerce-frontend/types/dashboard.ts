export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalViews: number;
  averageOrderValue: number;
  conversionRate: number;
}

export interface DailyStats {
  date: string;
  count: number;
  amount?: number;
}

export interface ShopDashboard {
  dailyVisits: DailyStats[];
  dailyOrders: DailyStats[];
  dailyRevenue: DailyStats[];
  topProducts: TopProduct[];
  stats: DashboardStats;
}

export interface TopProduct {
  id: number;
  name: string;
  views: number;
  sales: number;
  revenue: number;
}

export interface DashboardSummary {
  todayVisits: number;
  todayOrders: number;
  todayRevenue: number;
  weekVisits: number;
  weekOrders: number;
  weekRevenue: number;
  monthVisits: number;
  monthOrders: number;
  monthRevenue: number;
}

export interface RealtimeStats {
  timestamp: string;
  visitsToday: number;
  visitsLastHour: number;
  ordersToday: number;
  revenueToday: number;
  averageOrderValue: number;
}