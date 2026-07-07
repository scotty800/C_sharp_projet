using System.ComponentModel.DataAnnotations;

namespace ECommerceApi.DTO
{
    public class ShippingMethodDto
    {
        public int Id { get; set; }
        public int ShopId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal? FreeThreshold { get; set; }
        public int MinDays { get; set; }
        public int MaxDays { get; set; }
        public bool IsDefault { get; set; }
        public bool IsActive { get; set; }
    }

    public class UpsertShippingMethodDto
    {
        public int? Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Range(0, 1000)]
        public decimal Price { get; set; }

        public decimal? FreeThreshold { get; set; }

        [Range(0, 60)]
        public int MinDays { get; set; } = 3;

        [Range(0, 60)]
        public int MaxDays { get; set; } = 5;

        public bool IsDefault { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class ShopShippingBreakdownDto
    {
        public int ShopId { get; set; }
        public string ShopName { get; set; } = string.Empty;
        public decimal Subtotal { get; set; }
        public string ShippingMethodName { get; set; } = string.Empty;
        public decimal ShippingCost { get; set; }
        public decimal? FreeThreshold { get; set; }
        public double? ProgressTowardFree { get; set; }
        public bool HasShippingConfigured { get; set; }
        public int MinDays { get; set; }   // ⭐ AJOUT
        public int MaxDays { get; set; }   // ⭐ AJOUT
    }

    public class CartShippingSummaryDto
    {
        public List<ShopShippingBreakdownDto> Breakdown { get; set; } = new();
        public decimal TotalShipping { get; set; }
        public bool AllShopsConfigured { get; set; }
    }

    public class OrderShopShippingDto
    {
        public int ShopId { get; set; }
        public string? ShopName { get; set; }
        public string ShippingMethodName { get; set; } = string.Empty;
        public decimal ShippingCost { get; set; }
        public decimal Subtotal { get; set; }
        public int MinDays { get; set; }   // ⭐ AJOUT
        public int MaxDays { get; set; }   // ⭐ AJOUT
    }
}