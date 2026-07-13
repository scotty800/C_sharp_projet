using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace ECommerceApi.Models
{
    public class ShopCustomization
    {
        public int Id { get; set; }

        [Required]
        public int ShopId { get; set; }
        [ForeignKey(nameof(ShopId))]
        public Shop Shop { get; set; } = null!;

        // Layout
        public string? LayoutType { get; set; } = "full_width";
        public string HeaderStyle { get; set; } = "full_banner";
        public string ProductDisplayStyle { get; set; } = "grid_4";

        // Background
        public string BackgroundType { get; set; } = "color";
        public string? BackgroundValue { get; set; }
        public string BackgroundPosition { get; set; } = "center";
        public string BackgroundRepeat { get; set; } = "no-repeat";
        public string BackgroundSize { get; set; } = "cover";
        public bool BackgroundFixed { get; set; } = false;
        public string? BackgroundColor { get; set; } = "#FFFFFF";
        public int? BackgroundOpacity { get; set; } = 100;

        // Couleurs
        public string PrimaryColor { get; set; } = "#2563EB";
        public string SecondaryColor { get; set; } = "#7C3AED";
        public string AccentColor { get; set; } = "#F59E0B";
        public string TextColor { get; set; } = "#1F2937";

        // Effets et animations
        public bool Enable3DEffect { get; set; } = false;
        public string? AnimationEffect { get; set; }
        public string HoverEffect { get; set; } = "scale";
        public string PageTransition { get; set; } = "fade";

        // Typographie - Polices
        public string PrimaryFont { get; set; } = "Inter";
        public string SecondaryFont { get; set; } = "Inter";
        public string HeadingFont { get; set; } = "Poppins";
        public string BodyFont { get; set; } = "Inter";
        public string AccentFont { get; set; } = "Playfair Display";
        
        // Typographie - Tailles
        public int HeadingSizeH1 { get; set; } = 48;
        public int HeadingSizeH2 { get; set; } = 36;
        public int HeadingSizeH3 { get; set; } = 28;
        public int HeadingSizeH4 { get; set; } = 24;
        public int BodySize { get; set; } = 16;
        public int BaseFontSize { get; set; } = 16;
        public int SmallSize { get; set; } = 14;
        
        // Typographie - Poids
        public string HeadingWeight { get; set; } = "700";
        public string BodyWeight { get; set; } = "400";
        
        // Typographie - Interlignage
        public float HeadingLineHeight { get; set; } = 1.2f;
        public float BodyLineHeight { get; set; } = 1.6f;
        
        // Typographie - Espacement
        public float LetterSpacingHeading { get; set; } = -0.02f;
        public float LetterSpacingBody { get; set; } = 0;
        
        // Typographie - Transformation
        public string TextTransformHeading { get; set; } = "none";
        public string TextTransformBody { get; set; } = "none";
        
        // Typographie - Effets texte
        public string? TextShadow { get; set; }
        public string? TextGradient { get; set; }
        public string? TextStroke { get; set; }
        public string? TextGlow { get; set; }
        public string? TextAnimation { get; set; }
        public string TextBackground { get; set; } = "none";
        public int TextBackgroundPadding { get; set; } = 8;
        public int TextBackgroundRadius { get; set; } = 8;
        public int TextAnimationDuration { get; set; } = 1000;
        public string TextAnimationDelay { get; set; } = "0s";
        
        // Custom CSS/JS
        public string? CustomCss { get; set; }
        public string? CustomJs { get; set; }

        // Template
        public int? TemplateId { get; set; }
        [ForeignKey(nameof(TemplateId))]
        public Template? Template { get; set; }

        // Sections et assets personnalisés
        public List<CustomSection> CustomSections { get; set; } = new();
        public List<CustomAsset> CustomAssets { get; set; } = new();

        // Publication et versioning
        public bool IsPublished { get; set; } = false;
        public DateTime? PublishedAt { get; set; }  // ⭐ MODIFICATION — nullable
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public int Version { get; set; } = 1;

        // Filtres
        public bool FiltersEnabled { get; set; } = true;
        public int? ActiveShopFilterId { get; set; }
        public bool ShowFilterPanel { get; set; } = true;
        public string DefaultImageFilter { get; set; } = "none";
        public bool EnableFiltersPanel { get; set; } = true;
        public List<ImageFilter> ImageFilters { get; set; } = new();
        public float CanvasBrightness { get; set; } = 1;
        public float CanvasContrast { get; set; } = 1;
        public float CanvasSaturation { get; set; } = 1;
        public float CanvasBlur { get; set; } = 0;
        public string? CanvasCssFilter { get; set; } = "none";

        public string? BlocksJson { get; set; }  // Stocke tous les blocs de l'éditeur
        // Pour un accès facile, tu peux aussi ajouter une propriété non mappée
        [NotMapped]
        public List<Block>? Blocks 
        { 
            get => string.IsNullOrEmpty(BlocksJson) ? null : JsonSerializer.Deserialize<List<Block>>(BlocksJson);
            set => BlocksJson = JsonSerializer.Serialize(value);
        }

        [ForeignKey(nameof(ActiveShopFilterId))]
        public ImageFilter? ActiveShopFilter { get; set; }

        public string? ImageSelectionsJson { get; set; }

        // ⭐ NOUVEAU — Snapshot publié (lu par la boutique publique, jamais par le Studio)
        public string? PublishedBlocksJson { get; set; }
        public string? PublishedBackgroundJson { get; set; }
        public string? PublishedCanvasFiltersJson { get; set; }
        public string? PublishedCustomizationJson { get; set; }

        // Dates
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UnpublishedAt { get; set; }
    }
}