using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ECommerceApi.Models
{
    public class OrderShopShipping
    {
        public int Id { get; set; }

        [Required]
        public int OrderId { get; set; }

        [ForeignKey(nameof(OrderId))]
        public Order? Order { get; set; }

        [Required]
        public int ShopId { get; set; }

        [ForeignKey(nameof(ShopId))]
        public Shop? Shop { get; set; }

        [Required]
        [MaxLength(50)]
        public string ShippingMethodName { get; set; } = string.Empty;

        [Required]
        public decimal ShippingCost { get; set; }

        public decimal Subtotal { get; set; }

        public int MinDays { get; set; }   // ⭐ AJOUT
        public int MaxDays { get; set; }   // ⭐ AJOUT
    }
}