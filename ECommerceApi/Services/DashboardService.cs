using ECommerceApi.Data;
using ECommerceApi.DTO;
using ECommerceApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ECommerceApi.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<DashboardService> _logger;

        public DashboardService(AppDbContext context, ILogger<DashboardService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ShopDashboardDto> GetShopDashboardAsync(int shopId, DateTime? startDate = null, DateTime? endDate = null)
        {
            startDate ??= DateTime.UtcNow.AddDays(-30);
            endDate ??= DateTime.UtcNow;

            var dashboard = new ShopDashboardDto();

            var visits = await _context.ShopVisits
                .Where(v => v.ShopId == shopId && v.VisitedAt >= startDate && v.VisitedAt <= endDate)
                .ToListAsync();

            dashboard.TotalVisits = visits.Count;
            dashboard.UniqueVisitors = visits
                .Select(v => v.UserId.HasValue
                    ? v.UserId.Value.ToString()
                    : v.IpAddress)
                .Distinct()
                .Count();

            dashboard.VisitsByDevice = visits
                .GroupBy(v => v.Device ?? "unknown")
                .ToDictionary(g => g.Key, g => g.Count());

            dashboard.VisitsByHour = visits
                .GroupBy(v => v.VisitedAt.Hour)
                .OrderBy(g => g.Key)
                .ToDictionary(g => g.Key.ToString("00") + "h", g => g.Count());

            dashboard.DailyVisits = visits
                .GroupBy(v => v.VisitedAt.Date)
                .Select(g => new DailyStatDto
                {
                    Date = g.Key.ToString("yyyy-MM-dd"),
                    Count = g.Count()
                })
                .OrderBy(d => d.Date)
                .ToList();

            var orders = await _context.Orders
                .Include(o => o.Items)
                .ThenInclude(i => i.Product)
                .Where(o => o.Items.Any(i => i.Product.ShopId == shopId)
                    && o.CreatedAt >= startDate && o.CreatedAt <= endDate)
                .ToListAsync();

            dashboard.TotalOrders = orders.Count;
            dashboard.TotalRevenue = orders.Sum(o => o.FinalAmount);

            dashboard.DailyOrders = orders
                .GroupBy(o => o.CreatedAt.Date)
                .Select(g => new DailyStatDto
                {
                    Date = g.Key.ToString("yyyy-MM-dd"),
                    Count = g.Count()
                })
                .OrderBy(d => d.Date)
                .ToList();

            // ⭐ AJOUT — DailyRevenue
            dashboard.DailyRevenue = orders
                .GroupBy(o => o.CreatedAt.Date)
                .Select(g => new DailyStatDto
                {
                    Date = g.Key.ToString("yyyy-MM-dd"),
                    Count = g.Count(),
                    Amount = g.Sum(o => o.FinalAmount)
                })
                .OrderBy(d => d.Date)
                .ToList();

            dashboard.TotalProductsSold = orders
                .SelectMany(o => o.Items)
                .Where(i => i.Product.ShopId == shopId)
                .Sum(i => i.Quantity);

            dashboard.TopProductsByViews = await GetTopProductsByViewsAsync(shopId, 5);

            dashboard.TopProductsBySales = await GetTopProductsBySalesAsync(shopId, 5);

            return dashboard;
        }

        // ⭐ MODIFICATION — GetTopProductsByViewsAsync avec ProductImage
        public async Task<List<ProductStatsDto>> GetTopProductsByViewsAsync(int shopId, int limit = 10)
        {
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

            var productViews = await _context.ProductViews
                .Include(pv => pv.Product)
                .Where(pv => pv.Product != null
                    && pv.Product.ShopId == shopId
                    && pv.ViewedAt >= thirtyDaysAgo)
                .GroupBy(pv => pv.ProductId)
                .Select(g => new
                {
                    ProductId = g.Key,
                    Views = g.Count()
                })
                .OrderByDescending(x => x.Views)
                .Take(limit)
                .ToListAsync();

            var result = new List<ProductStatsDto>();

            foreach (var item in productViews)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                if (product != null)
                {
                    var orders = await _context.OrderItems
                        .Include(oi => oi.Order)
                        .Where(oi => oi.ProductId == item.ProductId && oi.Order.CreatedAt >= thirtyDaysAgo)
                        .ToListAsync();

                    // ⭐ APRÈS — avec ProductImage
                    result.Add(new ProductStatsDto
                    {
                        ProductId = product.Id,
                        ProductName = product.Name,
                        ProductImage = product.ImageUrl ?? product.ImageUrl1 ?? product.ImageUrl2 ?? product.ImageUrl3,
                        Price = product.Price,
                        Views = item.Views,
                        Orders = orders.Count,
                        QuantitySold = orders.Sum(o => o.Quantity),
                        Revenue = orders.Sum(o => o.TotalPrice),
                        ConversionRate = item.Views > 0
                            ? Math.Round((double)orders.Count / item.Views * 100, 2)
                            : 0
                    });
                }
            }

            return result;
        }

        // ⭐ MODIFICATION — GetTopProductsBySalesAsync avec ProductImage
        public async Task<List<ProductStatsDto>> GetTopProductsBySalesAsync(int shopId, int limit = 10)
        {
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

            var orderItems = await _context.OrderItems
                .Include(oi => oi.Product)
                .Include(oi => oi.Order)
                .Where(oi => oi.Product.ShopId == shopId
                             && oi.Order.CreatedAt >= thirtyDaysAgo
                             && oi.Order.Status != OrderStatus.Cancelled)
                .ToListAsync();

            // ⭐ APRÈS — avec ProductImage
            var productSales = orderItems
                .GroupBy(oi => oi.ProductId)
                .Select(g => new
                {
                    ProductId = g.Key,
                    ProductName = g.First().Product.Name,
                    ProductImage = g.First().Product.ImageUrl ?? g.First().Product.ImageUrl1 ?? g.First().Product.ImageUrl2 ?? g.First().Product.ImageUrl3,
                    Price = g.First().Product.Price,
                    QuantitySold = g.Sum(oi => oi.Quantity),
                    Revenue = g.Sum(oi => oi.Quantity * oi.UnitPrice),
                    Orders = g.Select(oi => oi.OrderId).Distinct().Count()
                })
                .OrderByDescending(x => x.Revenue)
                .Take(limit)
                .ToList();

            var result = new List<ProductStatsDto>();

            foreach (var item in productSales)
            {
                var views = await _context.ProductViews
                    .CountAsync(pv => pv.ProductId == item.ProductId && pv.ViewedAt >= thirtyDaysAgo);

                // ⭐ APRÈS — avec ProductImage
                result.Add(new ProductStatsDto
                {
                    ProductId = item.ProductId,
                    ProductName = item.ProductName,
                    ProductImage = item.ProductImage,
                    Price = item.Price,
                    Views = views,
                    Orders = item.Orders,
                    QuantitySold = item.QuantitySold,
                    Revenue = item.Revenue,
                    ConversionRate = views > 0
                        ? Math.Round((double)item.Orders / views * 100, 2)
                        : 0
                });
            }

            return result;
        }

        public async Task<DashboardSummaryDto> GetDashboardSummaryAsync(int shopId)
        {
            var now = DateTime.UtcNow;
            var today = now.Date;
            var weekAgo = now.AddDays(-7);
            var monthAgo = now.AddDays(-30);

            var summary = new DashboardSummaryDto();

            summary.TodayVisits = await _context.ShopVisits
                .CountAsync(v => v.ShopId == shopId && v.VisitedAt >= today);

            summary.WeekVisits = await _context.ShopVisits
                .CountAsync(v => v.ShopId == shopId && v.VisitedAt >= weekAgo);

            summary.MonthVisits = await _context.ShopVisits
                .CountAsync(v => v.ShopId == shopId && v.VisitedAt >= monthAgo);

            summary.TotalVisits = await _context.ShopVisits
                .CountAsync(v => v.ShopId == shopId);

            var orders = await _context.Orders
                .Include(o => o.Items)
                .ThenInclude(i => i.Product)
                .Where(o => o.Items.Any(i => i.Product.ShopId == shopId))
                .ToListAsync();

            summary.TotalOrders = orders.Count;
            summary.TotalRevenue = orders.Sum(o => o.FinalAmount);

            summary.TodayOrders = orders.Count(o => o.CreatedAt >= today);
            summary.TodayRevenue = orders.Where(o => o.CreatedAt >= today).Sum(o => o.FinalAmount);

            summary.WeekOrders = orders.Count(o => o.CreatedAt >= weekAgo);
            summary.WeekRevenue = orders.Where(o => o.CreatedAt >= weekAgo).Sum(o => o.FinalAmount);

            summary.MonthOrders = orders.Count(o => o.CreatedAt >= monthAgo);
            summary.MonthRevenue = orders.Where(o => o.CreatedAt >= monthAgo).Sum(o => o.FinalAmount);

            summary.ConversionRate = summary.TotalVisits > 0
                ? Math.Round((double)summary.TotalOrders / summary.TotalVisits * 100, 2)
                : 0;

            summary.AverageOrderValue = summary.TotalOrders > 0
                ? Math.Round((double)(summary.TotalRevenue / summary.TotalOrders), 2)
                : 0;

            return summary;
        }
    }
}