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

// ⭐ APRÈS — aligné sur ShopDashboardDto réel
export interface ShopDashboard {
  totalVisits: number;
  uniqueVisitors: number;
  totalOrders: number;
  totalRevenue: number;
  totalProductsSold: number;
  dailyVisits: DailyStats[];
  dailyOrders: DailyStats[];
  dailyRevenue: DailyStats[];
  topProductsByViews: TopProduct[];
  topProductsBySales: TopProduct[];
  visitsByDevice: Record<string, number>;
  visitsByHour: Record<string, number>;
}

export interface TopProduct {
  productId: number;
  productName: string;
  productImage?: string;
  price: number;
  views: number;
  orders: number;
  quantitySold: number;
  revenue: number;
  conversionRate: number;
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