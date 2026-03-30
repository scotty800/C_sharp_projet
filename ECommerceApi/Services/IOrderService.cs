using ECommerceApi.DTO;
using ECommerceApi.Models;

namespace ECommerceApi.Services
{
    public interface IOrderService
    {
        Task<Order> CreateOrderFromCartAsync(int userId, CreateOrderDto orderDto);
        Task<Order?> GetOrderByIdAsync(int orderId);
        Task<OrderResponseDto?> GetOrderByNumberAsync(string orderNumber);
        Task<List<Order>> GetUserOrdersAsync(int userId);
        Task<List<OrderResponseDto>> GetShopOrdersAsync(int shopId);
        Task<bool> UpdateOrderStatusAsync(int orderId, OrderStatus status);
        Task<bool> UpdatePaymentStatusAsync(int orderId, PaymentStatus status, string? paymentIntentId = null);
        Task<bool> CancelOrderAsync(int orderId, int userId);
        Task<List<OrderResponseDto>> GetOrdersByStatusAsync(OrderStatus status);
        Task<bool> HasUserPurchasedProductAsync(int userId, int productId);
        Task<OrderStatsDto> GetOrderStatsAsync(int? shopId = null);

        // ✅ NOUVELLES MÉTHODES POUR LES WEBHOOKS
        Task<bool> UpdatePaymentStatusAsync(string orderNumber, PaymentStatus status);
        Task<bool> UpdateOrderStatusAsync(string orderNumber, OrderStatus status);
        Task<OrderResponseDto?> GetOrderByPaymentIntentId(string paymentIntentId);
        Task<bool> IsUserShopOwnerAsync(int userId, int orderId);
    }
}