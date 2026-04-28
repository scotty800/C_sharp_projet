using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ECommerceApi.Models
{
    public class CustomSection
    {
        public int Id { get; set; }

        [Required]
        public int ShopCustomizationId { get; set; }
        [ForeignKey(nameof(ShopCustomizationId))]
        public ShopCustomization ShopCustomization { get; set; } = null!;

        public string Type { get; set; } = "hero";
        public string? Title { get; set; }
        public string? Subtitle { get; set; }
        public string? Content { get; set; }
        public string? ImageUrl { get; set; }
        public string? BackgroundColor { get; set; }
        public int Order { get; set; }
        public bool IsVisible { get; set; } = true;

        public string? TitleFont { get; set; }
        public int TitleFontSize { get; set; } = 0;
        public string? TitleFontWeight { get; set; }
        public string? TitleTextShadow { get; set; }
        public string? TitleTextGradient { get; set; }
        public string? TitleAnimation { get; set; }
        public string? SubtitleFont { get; set; }
        public int SubtitleFontSize { get; set; } = 0;
        public string? SubtitleFontWeight { get; set; }
        public string? SubtitleTextShadow { get; set; }

        public string SettingsJson { get; set; } = "{}";
    }
}