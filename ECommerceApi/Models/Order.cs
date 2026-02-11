namespace ECommerceApi.Models
{
    public enum OrderStatus
    {
        Pending,
        Processing,
        Shipped,
        Delivered,
        Cancelled,
        Refunded
    }

    public enum PaymentStatus
    {
        Pending,
        Paid,
        Failed,
        Refunded
    }

    public enum PaymentMethod
    {
        CreditCard,
        PayPal,
        Stripe,
        BankTransfer,
        CashOnDelivery
    }

    public class Order
    {
        public int Id { get; set; }

        [Required]
        public string OrderNumber { get; set; } = string.Empty;

        [Required]
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.CreditCard;

        public string? PaymentIntenId { get; set; }

        [Required]
        public decimal TotalAmount { get; set; }
        public decimal TaxAmount { get; set; } = 0;
        public decimal ShippingCost { get; set; } = 0;
        public decimal DiscountAmount { get; set; } = 0;
        public decimal FinalAmount => TotalAmount + TaxAmount + ShippingCost - DiscountAmount;

        // Informations de livraison
        public string ShippingAddress { get; set; } = string.Empty;
        public string ShippingCity { get; set; } = string.Empty;
        public string ShippingPostalCode { get; set; } = string.Empty;
        public string ShippingCountry { get; set; } = string.Empty;
        public string? TrackingNumber { get; set; }

        // Informations de facturation
        public string BillingAddress { get; set; } = string.Empty;
        public string BillingCity { get; set; } = string.Empty;
        public string BillingPostalCode { get; set; } = string.Empty;
        public string BillingCountry { get; set; } = string.Empty;

        public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? PaidAt { get; set; }
        public DateTime? ShippedAt { get; set; }
        public DateTime? DeliveredAt { get; set; }
    }
    
    public class OrderItem
    {
        public int Id { get; set; }
        
        [Required]
        public int OrderId { get; set; }
        public Order Order { get; set; } = null!;
        
        [Required]
        public int ProductId { get; set; }
        public Product Product { get; set; } = null!;
        
        [Required]
        public int Quantity { get; set; }
        
        [Required]
        public decimal UnitPrice { get; set; } // Prix au moment de l'achat
        
        public decimal TotalPrice => Quantity * UnitPrice;
        
        // Pour les reviews
        public bool IsReviewed { get; set; } = false;
    }

}