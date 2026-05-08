namespace ECommerceApi.DTO
{
    public class ShopCustomizationDto
    {
        // Layout
        public string LayoutType { get; set; } = "full_width";
        public string HeaderStyle { get; set; } = "full_banner";
        public string ProductDisplayStyle { get; set; } = "grid_4";
        
        // Background
        public string BackgroundType { get; set; } = "color";
        public string? BackgroundValue { get; set; }
        public string BackgroundPosition { get; set; } = "center";
        public string BackgroundRepeat { get; set; } = "no-repeat";
        public string BackgroundSize { get; set; } = "cover";
        public bool BackgroundFixed { get; set; } = false;
        
        // Couleurs
        public string PrimaryColor { get; set; } = "#2563EB";
        public string SecondaryColor { get; set; } = "#7C3AED";
        public string AccentColor { get; set; } = "#F59E0B";
        public string TextColor { get; set; } = "#1F2937";
        
        // Effets
        public bool Enable3DEffect { get; set; } = false;
        public string? AnimationEffect { get; set; }
        public string HoverEffect { get; set; } = "scale";
        public string PageTransition { get; set; } = "fade";
        
        // Typographie
        public string PrimaryFont { get; set; } = "Inter";
        public string SecondaryFont { get; set; } = "Inter";
        public int BaseFontSize { get; set; } = 16;
        public string? CustomCss { get; set; }
        public string? CustomJs { get; set; }
        public string HeadingFont { get; set; } = "Poppins";
        public string BodyFont { get; set; } = "Inter";
        public string AccentFont { get; set; } = "Playfair Display";
        public int HeadingSizeH1 { get; set; } = 48;
        public int HeadingSizeH2 { get; set; } = 36;
        public int HeadingSizeH3 { get; set; } = 28;
        public int BodySize { get; set; } = 16;
        public string HeadingWeight { get; set; } = "700";
        public string BodyWeight { get; set; } = "400";

        // Effets texte
        public string TextShadow { get; set; } = "none";
        public string TextGradient { get; set; } = "none";
        public string TextStroke { get; set; } = "none";
        public string TextGlow { get; set; } = "none";
        public string TextAnimation { get; set; } = "none";

        public bool FiltersEnabled { get; set; } = true;
        public int? ActiveShopFilterId { get; set; }
        public bool ShowFilterPanel { get; set; } = true;
        public string DefaultImageFilter { get; set; } = "none";

        public List<int> ImageFilterIds { get; set; } = new();
        
        // Sections et assets
        public List<CustomSectionDto> CustomSections { get; set; } = new();
        public List<CustomAssetDto> CustomAssets { get; set; } = new();
    }
    
    public class CustomSectionDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = "hero";
        public string? Title { get; set; }
        public string? Subtitle { get; set; }
        public string? Content { get; set; }
        public string? ImageUrl { get; set; }
        public string? BackgroundColor { get; set; }
        public int Order { get; set; }
        public bool IsVisible { get; set; } = true;
        public Dictionary<string, object> Settings { get; set; } = new();
    }
    
    public class CustomAssetDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = "image";
        public string Name { get; set; } = "";
        public string? Url { get; set; }
        public string? Content { get; set; }
        public int PosX { get; set; }
        public int PosY { get; set; }
        public int FontSize { get; set; }
        public string? FontFamily { get; set; }
        public string? FontWeight { get; set; }
        public string? TextAlign { get; set; }
        public string? TextColor { get; set; }
        public int Width { get; set; } = 200;
        public int Height { get; set; } = 100;
        public int Rotation { get; set; }
        public int ZIndex { get; set; }
        public string? Animation { get; set; }
        public int Duration { get; set; } = 300;
        public int Delay { get; set; }
        public bool IsDraggable { get; set; } = true;
        public bool IsResizable { get; set; } = true;
        public bool IsVisible { get; set; } = true;
        public string? LinkUrl { get; set; }

        // Effets texte pour cet élément spécifique
        public string? TextShadow { get; set; }
        public string? TextGradient { get; set; }
        public string? TextStroke { get; set; }
        public string? TextGlow { get; set; }
        public string? TextBackground { get; set; }
        public int TextBackgroundPadding { get; set; } = 8;
        public int TextBackgroundRadius { get; set; } = 8;
        public string? TextDecoration { get; set; }
        public float LetterSpacing { get; set; } = 0;
        public float LineHeight { get; set; } = 1.5f;
        public int MaxWidth { get; set; } = 0;
    }
    
    public class ShopProductCustomizationDto
    {
        public int ProductId { get; set; }
        public string ProductBackgroundType { get; set; } = "white";
        public string? ProductBackgroundValue { get; set; }
        public string ProductFrameStyle { get; set; } = "rounded";
        public bool ProductShadow { get; set; } = true;
        public string ProductHoverEffect { get; set; } = "zoom";
        public bool IsFeatured { get; set; } = false;
        public int FeaturedOrder { get; set; }
        public string? CustomBadge { get; set; }
        public string? CustomBadgeColor { get; set; }
        public string? ProductAnimation { get; set; }
        public int AnimationDelay { get; set; }
    }

    public class BlockDto
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Type { get; set; } = "section";
        public string Name { get; set; } = "";
        public int Order { get; set; }
        public bool IsVisible { get; set; } = true;
        public BlockPositionDto? Position { get; set; }  // ← AJOUTE CETTE LIGNE
        public Dictionary<string, object> Settings { get; set; } = new();
        public List<BlockDto> Children { get; set; } = new();

        public float Brightness { get; set; } = 1f;
        public float Contrast { get; set; } = 1f;
        public float Saturation { get; set; } = 1f;
        public float Blur { get; set; } = 0f;
        public string? CssFilter { get; set; } = "none";
    }

    public class BlockPositionDto
    {
        public int X { get; set; }
        public int Y { get; set; }
        public int Width { get; set; } = 0;
        public int Height { get; set; } = 0;
        public int ZIndex { get; set; } = 0;
        public string? PositionType { get; set; } = "absolute";
        public string? Alignment { get; set; } = "center";

        public int Rotation { get; set; } = 0;
    }

    public class UpdateBackgroundDto
    {
        public string? BackgroundColor { get; set; }
        public string? BackgroundType { get; set; }
        public string? BackgroundValue { get; set; }
        public int? BackgroundOpacity { get; set; }
    }

    public class UpdateCanvasFiltersDto
    {
        public float GlobalBrightness { get; set; } = 1;
        public float GlobalContrast { get; set; } = 1;
        public float GlobalSaturation { get; set; } = 1;
        public float GlobalBlur { get; set; } = 0;
        public string? GlobalCssFilter { get; set; } = "none";
    }
}
