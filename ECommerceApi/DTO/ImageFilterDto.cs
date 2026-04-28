namespace ECommerceApi.DTO
{
    public class ImageFilterDto
    {
        public int Id { get; set; }
        public string FilterType { get; set; } = "none";
        public string? CssFilter { get; set; }
        public float Brightness { get; set; } = 1.0f;
        public float Contrast { get; set; } = 1.0f;
        public float Saturation { get; set; } = 1.0f;
        public float HueRotate { get; set; } = 0f;
        public float Blur { get; set; } = 0f;
        public float Grayscale { get; set; } = 0f;
        public float Sepia { get; set; } = 0f;
        public float Opacity { get; set; } = 1f;
        public float Invert { get; set; } = 0f;
        public string? PresetName { get; set; }
        public string Target { get; set; } = "global";
        public int Order { get; set; }
    }
    
    public class ProductImageFilterDto
    {
        public int ProductId { get; set; }
        public int ImageIndex { get; set; } = 1;
        public string FilterType { get; set; } = "none";
        public string? CssFilter { get; set; }
        public float Brightness { get; set; } = 1.0f;
        public float Contrast { get; set; } = 1.0f;
        public float Saturation { get; set; } = 1.0f;
        public float HueRotate { get; set; } = 0f;
        public float Blur { get; set; } = 0f;
        public float Grayscale { get; set; } = 0f;
        public float Sepia { get; set; } = 0f;
        public float Opacity { get; set; } = 1f;
        public string? OverlayType { get; set; }
        public string? OverlayColor { get; set; }
        public float OverlayOpacity { get; set; } = 0f;
        public bool EnableGlow { get; set; } = false;
        public string? GlowColor { get; set; }
        public bool EnableShadow { get; set; } = false;
        public string? ShadowColor { get; set; }
    }
    
    public class ShopFilterDto
    {
        public string GlobalFilter { get; set; } = "none";
        public string? GlobalCssFilter { get; set; }
        public float GlobalBrightness { get; set; } = 1.0f;
        public float GlobalContrast { get; set; } = 1.0f;
        public float GlobalSaturation { get; set; } = 1.0f;
        public string BackgroundFilter { get; set; } = "none";
        public float BackgroundBlur { get; set; } = 0f;
        public float BackgroundDarken { get; set; } = 0f;
        public string? SeasonalEffect { get; set; }
        public DateTime? SeasonalEffectStart { get; set; }
        public DateTime? SeasonalEffectEnd { get; set; }
        public bool EnableFilterAnimation { get; set; } = false;
        public string FilterAnimation { get; set; } = "none";
        public int AnimationDuration { get; set; } = 3000;
    }
    
    // Filtres prédéfinis comme sur Instagram/Canva
    public class FilterPresetDto
    {
        public string Id { get; set; } = "";
        public string Name { get; set; } = "";
        public string Description { get; set; } = "";
        public string CssFilter { get; set; } = "";
        public string? ThumbnailUrl { get; set; }
        public string? Category { get; set; }
    }
}