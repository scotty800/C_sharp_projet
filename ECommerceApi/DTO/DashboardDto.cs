namespace ECommerceApi.DTO
{
    public class ShopDashboardDto
    {
        // Statistiques générales
        public int TotalVisits { get; set; }
        public int UniqueVisitors { get; set; }
        public int TotalOrders { get; set; }
        public decimal TotalRevenue { get; set; }
        public int TotalProductsSold { get; set; }

        // Évolution
        public List<DailyStatDto> DailyVisits { get; set; } = new();
        public List<DailyStatDto> DailyOrders { get; set; } = new();
        public List<DailyStatDto> DailyRevenue { get; set; } = new();

        // Top produits
        public List<ProductStatsDto> TopProductsByViews { get; set; } = new();
        public List<ProductStatsDto> TopProductsBySales { get; set; } = new();

        // Démographie
        public Dictionary<string, int> VisitsByDevice { get; set; } = new();
        public Dictionary<string, int> VisitsByHour { get; set; } = new();
    }

    public class DailyStatDto
    {
        public string Date { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal? Amount { get; set; }
    }

    public class ProductStatsDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Views { get; set; }
        public int Orders { get; set; }
        public int QuantitySold { get; set; }
        public decimal Revenue { get; set; }
        public double ConversionRate { get; set; } // (Orders / Views) * 100
    }

    public class DashboardSummaryDto
    {
        public int TodayVisits { get; set; }
        public int TodayOrders { get; set; }
        public decimal TodayRevenue { get; set; }

        public int WeekVisits { get; set; }
        public int WeekOrders { get; set; }
        public decimal WeekRevenue { get; set; }

        public int MonthVisits { get; set; }
        public int MonthOrders { get; set; }
        public decimal MonthRevenue { get; set; }

        public int TotalVisits { get; set; }
        public int TotalOrders { get; set; }
        public decimal TotalRevenue { get; set; }

        public double ConversionRate { get; set; } // (TotalOrders / TotalVisits) * 100
        public double AverageOrderValue { get; set; }
    }
}