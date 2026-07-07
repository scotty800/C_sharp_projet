using ECommerceApi.DTO;

namespace ECommerceApi.Services
{
    public interface IShippingService
    {
        Task<List<ShippingMethodDto>> GetShopMethodsAsync(int shopId);
        Task<ShippingMethodDto> UpsertMethodAsync(int shopId, int userId, UpsertShippingMethodDto dto);
        Task<bool> DeleteMethodAsync(int shopId, int userId, int methodId);
        Task<CartShippingSummaryDto> CalculateCartShippingAsync(int userId);
    }
}