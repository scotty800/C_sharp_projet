using ECommerceApi.DTO;
using ECommerceApi.Models;

namespace ECommerceApi.Services
{
    public interface IOrderService
    {
        Task<Order> CreateOrderFromCartAsync(int userId, CreateOrderDto  orderDto);
        Task<Order?> GetOrderByIdAsync(int orderId);
        Task<Order?> GetOrderByNumberAsync(string orderNumber);
        Task<List<Order>> GetUserOrdersAsync(int userId);
        Task<List<Order>> GetShopOrdersAsync(int shopId);
        Task<bool> UpdateOrderStatusAsync(int orderId, OrderStatus status);
        Task<bool> UpdatePaymentStatusAsync(int orderId, PaymentStatus status, string? paymentIntentId = null);
        Task<bool> CancelOrderAsync(int orderId, int userId);
        Task<List<Order>> GetOrdersByStatusAsync(OrderStatus status);
        Task<bool> HasUserPurchasedProductAsync(int userId, int productId);
        Task<OrderStatsDto> GetOrderStatsAsync(int? shopId = null);
    }
}