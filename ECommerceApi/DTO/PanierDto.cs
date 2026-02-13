using System.ComponentModel.DataAnnotations;
using ECommerceApi.Models;

namespace ECommerceApi.DTO
{
    // ============================================
    // CART DTOs (Panier)
    // ============================================
    
    public class AddToCartDto
    {
        [Required]
        public int ProductId { get; set; }
        
        [Required]
        [Range(1, 100)]
        public int Quantity { get; set; }
    }
    
    public class UpdateCartItemDto
    {
        [Required]
        [Range(1, 100)]
        public int Quantity { get; set; }
    }
    
    public class CartItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public decimal ProductPrice { get; set; }
        public int Quantity { get; set; }
        public decimal TotalPrice { get; set; }
        public string? ProductImage { get; set; }
        public int Stock { get; set; }
    }
    
    public class CartResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public List<CartItemDto> Items { get; set; } = new();
        public int TotalItems { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
    
    // ============================================
    // ORDER DTOs (Commandes)
    // ============================================
    
    public class CreateOrderDto
    {
        [Required]
        public PaymentMethod PaymentMethod { get; set; }
        
        [Required]
        public string ShippingAddress { get; set; } = string.Empty;
        
        [Required]
        public string ShippingCity { get; set; } = string.Empty;
        
        [Required]
        public string ShippingPostalCode { get; set; } = string.Empty;
        
        [Required]
        public string ShippingCountry { get; set; } = string.Empty;
        
        public string? BillingAddress { get; set; }
        public string? BillingCity { get; set; }
        public string? BillingPostalCode { get; set; }
        public string? BillingCountry { get; set; }
        
        public decimal TaxAmount { get; set; } = 0;
        public decimal ShippingCost { get; set; } = 0;
        public decimal DiscountAmount { get; set; } = 0;
        public string? CouponCode { get; set; }
    }
    
    public class OrderItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? ProductImage { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public int? ShopId { get; set; }
        public string? ShopName { get; set; }
        public bool IsReviewed { get; set; }
    }
    
    public class OrderResponseDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        
        // Statuts
        public OrderStatus Status { get; set; }
        public string StatusName => Status.ToString();
        public PaymentStatus PaymentStatus { get; set; }
        public string PaymentStatusName => PaymentStatus.ToString();
        public PaymentMethod PaymentMethod { get; set; }
        public string PaymentMethodName => PaymentMethod.ToString();
        
        // Montants
        public decimal TotalAmount { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal ShippingCost { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal FinalAmount { get; set; }
        
        // Adresses
        public string ShippingAddress { get; set; } = string.Empty;
        public string ShippingCity { get; set; } = string.Empty;
        public string ShippingPostalCode { get; set; } = string.Empty;
        public string ShippingCountry { get; set; } = string.Empty;
        public string BillingAddress { get; set; } = string.Empty;
        public string BillingCity { get; set; } = string.Empty;
        public string BillingPostalCode { get; set; } = string.Empty;
        public string BillingCountry { get; set; } = string.Empty;
        
        // Paiement
        public string? PaymentIntentId { get; set; }
        public string? TrackingNumber { get; set; }
        
        // Dates
        public DateTime CreatedAt { get; set; }
        public DateTime? PaidAt { get; set; }
        public DateTime? ShippedAt { get; set; }
        public DateTime? DeliveredAt { get; set; }
        
        // Items
        public List<OrderItemDto> Items { get; set; } = new();
    }
    
    public class OrderStatsDto
    {
        public int TotalOrders { get; set; }
        public decimal TotalRevenue { get; set; }
        public int PendingOrders { get; set; }
        public int ProcessingOrders { get; set; }
        public int ShippedOrders { get; set; }
        public int DeliveredOrders { get; set; }
        public int CancelledOrders { get; set; }
        public decimal AverageOrderValue { get; set; }
        public Dictionary<string, decimal> RevenueByDay { get; set; } = new();
        public Dictionary<string, int> OrdersByDay { get; set; } = new();
    }
    
    public class UpdateOrderStatusDto
    {
        [Required]
        public OrderStatus Status { get; set; }
        public string? TrackingNumber { get; set; }
    }
    
    // ============================================
    // REVIEW DTOs (Avis et Notes)
    // ============================================
    
    
    public class UpdateReviewDto
    {
        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }
        
        [MaxLength(1000)]
        public string? Comment { get; set; }
    }
    
    
    public class ProductRatingDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public Dictionary<int, int> RatingDistribution { get; set; } = new(); // 1->5 étoiles
        public List<ReviewResponseDto> RecentReviews { get; set; } = new();
    }
    
    public class ShopRatingDto
    {
        public int ShopId { get; set; }
        public string ShopName { get; set; } = string.Empty;
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public int TotalProducts { get; set; }
        public Dictionary<int, int> RatingDistribution { get; set; } = new();
    }
    
    // ============================================
    // PAYMENT DTOs (Paiement)
    // ============================================
    
    public class PaymentIntentResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string ClientSecret { get; set; } = string.Empty;
        public long Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
    
    public class ConfirmPaymentDto
    {
        [Required]
        public string PaymentIntentId { get; set; } = string.Empty;
        
        [Required]
        public int OrderId { get; set; }
    }
    
    public class RefundRequestDto
    {
        [Required]
        public int OrderId { get; set; }
        public string? Reason { get; set; }
    }
    
    // ============================================
    // SHIPMENT DTOs (Livraison)
    // ============================================
    
    public class ShipmentDto
    {
        public string Carrier { get; set; } = string.Empty;
        public string TrackingNumber { get; set; } = string.Empty;
        public string TrackingUrl { get; set; } = string.Empty;
        public DateTime EstimatedDelivery { get; set; }
    }
    
    // ============================================
    // INVOICE DTOs (Facture)
    // ============================================
    
    public class InvoiceDto
    {
        public string InvoiceNumber { get; set; } = string.Empty;
        public DateTime InvoiceDate { get; set; }
        public OrderResponseDto Order { get; set; } = null!;
        public string? PdfUrl { get; set; }
    }
    
    // ============================================
    // COUPON DTOs (Code promo)
    // ============================================
    
    public class ApplyCouponDto
    {
        [Required]
        public string CouponCode { get; set; } = string.Empty;
    }
    
    public class CouponResponseDto
    {
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal DiscountAmount { get; set; }
        public int DiscountPercent { get; set; }
        public decimal MinimumOrderAmount { get; set; }
        public DateTime ValidUntil { get; set; }
    }

    public class CreatePaymentIntentDto
    {
        [Required]
        public int OrderId { get; set; }
    }
    
    public class CreatePaymentIntentResponseDto
    {
        public string ClientSecret { get; set; } = string.Empty;
        public string PaymentIntentId { get; set; } = string.Empty;
    }
}