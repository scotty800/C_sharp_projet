using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ECommerceApi.Services;
using ECommerceApi.DTO;
using System.Security.Claims;

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

        public DashboardController(
            IDashboardService dashboardService,
            IShopService shopService,
            ILogger<DashboardController> logger)
        {
            _dashboardService = dashboardService;
            _shopService = shopService;
            _logger = logger;
        }

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

            return Ok(new
            {
                shop = new { shop.Id, shop.Name, shop.Slug },
                dashboard
            });
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
            var houtAgo = now.AddHours(-1);

            var visitsToday = await _context.ShopVisits
                .CountAsync(v => v.ShopId == shopId && v.VisitedAt >= today);

            var visitsLastHour = await _context.ShopVisits
                .CountAsync(v => v.ShopId == shopId && v.VisitedAt >= hourAgo);
            
            var ordersToday  = await _context.Orders
                .Include(o => o.Items)
                .Where(o => o.Items.Any(i => i.Product.ShopId == shopId) && o.CreatedAt >= today)
                .CountAsync();

            var revenueToday = await _context.Orders
                .Include(o => o.Items)
                .Where(o => o.Items.Any(i => i.Product.ShopId == shopId) && o.CreatedAt >= today)
                .SumAsync(o => o.FinalAmount);
            
            return Ok(new
            {
                timestamp = now,
                visitsToday,
                visitsLastHour,
                ordersToday,
                revenueToday,
                averageOrderValue = ordersToday > 0 ? revenueToday / ordersToday : 0
            });
    }
}