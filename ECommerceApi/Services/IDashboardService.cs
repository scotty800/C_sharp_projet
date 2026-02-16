using ECommerceApi.DTO;
using ECommerceApi.Models;

namespace ECommerceApi.Services
{
    public interface IDashboardService
    {
        Task<ShopDashboardDto> GetShopDashboardAsync(int shopId, DateTime? startDate, DateTime? endDate);
        Task<List<ProductStatsDto>> GetTopProductsByViewsAsync(int shopId, int limit = 10);
        Task<List<ProductStatsDto>> GetTopProductsBySalesAsync(int shopId, int limit = 10);
        Task<DashboardSummaryDto> GetDashboardSummaryAsync(int shopId);
    }
}