using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ECommerceApi.Models
{
    public class ProductImageFilter
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

        public int ImageIndex { get; set; } = 1;

        public string FilterType { get; set; } = "none";
        
        public string? CssFilter { get; set; }

        // Paramètres du filtre image
        public float Brightness { get; set; } = 1.0f;
        public float Contrast { get; set; } = 1.0f;
        public float Saturation { get; set; } = 1.0f;
        public float HueRotate { get; set; } = 0f;
        public float Blur { get; set; } = 0f;
        public float Grayscale { get; set; } = 0f;
        public float Sepia { get; set; } = 0f;
        public float Opacity { get; set; } = 1.0f;

        // Overlay (surcouche)
        public string? OverlayType { get; set; }
        public string? OverlayColor { get; set; }
        public float OverlayOpacity { get; set; } = 0f;

        // Effet Glow (lumière)
        public bool EnableGlow { get; set; } = false;
        public string? GlowColor { get; set; }

        // Effet Shadow (ombre)
        public bool EnableShadow { get; set; } = false;
        public string? ShadowColor { get; set; }

        // Date de mise à jour
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}