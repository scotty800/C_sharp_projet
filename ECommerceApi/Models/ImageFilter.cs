using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ECommerceApi.Models
{
    public class ImageFilter
    {
        public int Id { get; set; }

        [Required]
        public int ShopCustomizationId { get; set; }
        [ForeignKey(nameof(ShopCustomizationId))]
        public ShopCustomization ShopCustomization { get; set; } = null!;

        public string FilterType { get; set; } = "none";

        public string? CssFilter { get; set; }

        // Paramètres du filtre
        public float Brightness { get; set; } = 1.0f;
        public float Contrast { get; set; } = 1.0f;
        public float Saturation { get; set; } = 1.0f;
        public float HueRotate { get; set; } = 0f;
        public float Blur { get; set; } = 0f;
        public float Grayscale { get; set; } = 0f;
        public float Sepia { get; set; } = 0f;
        public float Opacity { get; set; } = 1.0f;
        public float Invert { get; set; } = 0f;

        // Preset
        public string? PresetName { get; set; }

        // Cible du filtre
        public string Target { get; set; } = "global";

        public int Order { get; set; }
        
        // Statut
        public bool IsActive { get; set; } = true;
        
        // Dates
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}