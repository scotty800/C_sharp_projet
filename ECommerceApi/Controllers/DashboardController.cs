using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ECommerceApi.Services;
using ECommerceApi.Data;
using ECommerceApi.DTO;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;

namespace ECommerceApi.Controllers
{
    [ApiController]
    [Route("api/dashboard")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;
        private readonly IShopService _shopService;
        private readonly ILogger<DashboardController> _logger;
        private readonly AppDbContext _context;

        public DashboardController(
            IDashboardService dashboardService,
            IShopService shopService,
            ILogger<DashboardController> logger,
            AppDbContext context)
        {
            _dashboardService = dashboardService;
            _shopService = shopService;
            _logger = logger;
            _context = context;
        }

        // ⭐ MODIFICATION — Retourne directement le dashboard sans wrapper
        [HttpGet("shop/{shopId}")]
        public async Task<IActionResult> GetShopDashboard(
            int shopId,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var shop = await _shopService.GetShopByIdAsync(shopId);

            if (shop == null)
                return NotFound("Shop non trouvé");

            var dashboard = await _dashboardService.GetShopDashboardAsync(shopId, startDate, endDate);

            // ⭐ Retourner directement le dashboard, le frontend n'a pas besoin du shop ici
            return Ok(dashboard);
        }

        [HttpGet("shop/{shopId}/top-views")]
        public async Task<IActionResult> GetTopProductsByViews(int shopId, [FromQuery] int limit = 10)
        {
            var products = await _dashboardService.GetTopProductsByViewsAsync(shopId, limit);
            return Ok(products);
        }

        [HttpGet("shop/{shopId}/top-sales")]
        public async Task<IActionResult> GetDashboardSummary(int shopId)
        {
            var summary = await _dashboardService.GetDashboardSummaryAsync(shopId);
            return Ok(summary);
        }

        // ⭐ AJOUT — Nouvel endpoint pour les produits les plus vendus
        [HttpGet("shop/{shopId}/top-products-sales")]
        public async Task<IActionResult> GetTopProductsBySales(int shopId, [FromQuery] int limit = 10)
        {
            var products = await _dashboardService.GetTopProductsBySalesAsync(shopId, limit);
            return Ok(products);
        }

        [HttpGet("shop/{shopId}/export")]
        public async Task<IActionResult> ExportDashboardData(
            int shopId,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            startDate ??= DateTime.UtcNow.AddDays(-30);
            endDate ??= DateTime.UtcNow;

            var dashboard = await _dashboardService.GetShopDashboardAsync(shopId, startDate, endDate);

            var csv = new StringBuilder();
            csv.AppendLine("Date,Visites,Commandes,Revenus");

            for (int i = 0; i < dashboard.DailyVisits.Count; i++)
            {
                var date = dashboard.DailyVisits[i].Date;
                var visits = dashboard.DailyVisits[i].Count;
                var orders = dashboard.DailyOrders.FirstOrDefault(o => o.Date == date)?.Count ?? 0;
                var revenue = dashboard.DailyRevenue.FirstOrDefault(r => r.Date == date)?.Amount ?? 0;

                csv.AppendLine($"{date},{visits},{orders},{revenue}");
            }

            return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", $"dashboard-shop-{shopId}.csv");
        }

        [HttpGet("shop/{shopId}/realtime")]
        public async Task<IActionResult> GetRealtimeStats(int shopId)
        {
            var today = DateTime.UtcNow.Date;
            var now = DateTime.UtcNow;
            var hourAgo = now.AddHours(-1);

            // 1. Visites aujourd'hui
            var visitsToday = await _context.ShopVisits
                .CountAsync(v => v.ShopId == shopId && v.VisitedAt >= today);

            // 2. Visites de la dernière heure
            var visitsLastHour = await _context.ShopVisits
                .CountAsync(v => v.ShopId == shopId && v.VisitedAt >= hourAgo);

            // 3. Récupérer les IDs des produits du shop
            var productIds = await _context.Products
                .Where(p => p.ShopId == shopId)
                .Select(p => p.Id)
                .ToListAsync();

            // 4. Récupérer les commandes d'aujourd'hui
            var orderItemsToday = await _context.OrderItems
                .Include(oi => oi.Order)
                .Where(oi => productIds.Contains(oi.ProductId) && oi.Order.CreatedAt >= today)
                .ToListAsync();

            // 5. Calculer les métriques
            var ordersCount = orderItemsToday.Select(oi => oi.OrderId).Distinct().Count();
            var revenueToday = orderItemsToday
                .GroupBy(oi => oi.OrderId)
                .Select(g => new
                {
                    OrderId = g.Key,
                    Total = g.First().Order.TotalAmount +
                            g.First().Order.TaxAmount +
                            g.First().Order.ShippingCost -
                            g.First().Order.DiscountAmount
                })
                .Sum(x => x.Total);

            return Ok(new
            {
                timestamp = now,
                visitsToday,
                visitsLastHour,
                ordersToday = ordersCount,
                revenueToday,
                averageOrderValue = ordersCount > 0 ? revenueToday / ordersCount : 0
            });
        }
    }
}