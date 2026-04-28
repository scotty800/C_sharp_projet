using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ECommerceApi.Models
{
    public class ShopProductCustomization
    {
        public int Id { get; set; }

        [Required]
        public int ShopId { get; set; }
        [ForeignKey(nameof(ShopId))]
        public Shop Shop { get; set; } = null!;

        [Required]
        public int ProductId { get; set; }
        [ForeignKey(nameof(ProductId))]
        public Product Product { get; set; } = null!;

        public string ProductBackgroundType { get; set; } = "white";
        public string? ProductBackgroundValue { get; set; }

        public string ProductFrameStyle { get; set; } = "rounded";
        public bool ProductShadow { get; set; } = true;
        public string ProductHoverEffect { get; set; } = "zoom";

        public bool IsFeatured { get; set; } = false;
        public int FeaturedOrder { get; set; } = 0;
        public string? CustomBadge { get; set; }
        public string? CustomBadgeColor { get; set; }

        public string? ProductAnimation { get; set; }
        public int AnimationDelay { get; set; } = 0;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}