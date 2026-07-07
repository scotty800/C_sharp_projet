using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ECommerceApi.Models
{
    public class ShopShippingMethod
    {
        public int Id { get; set; }

        [Required]
        public int ShopId { get; set; }

        [ForeignKey(nameof(ShopId))]
        public Shop? Shop { get; set; }

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

        public bool IsDefault { get; set; } = false;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}