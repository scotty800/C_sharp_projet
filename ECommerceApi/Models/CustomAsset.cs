using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ECommerceApi.Models
{
    public class CustomAsset
    {
        public int Id { get; set; }

        [Required]
        public int ShopCustomizationId { get; set; }
        [ForeignKey(nameof(ShopCustomizationId))]
        public ShopCustomization ShopCustomization { get; set; } = null!;

        public string Type { get; set; } = "image";
        public string Name { get; set; } = string.Empty;
        public string? Url { get; set; }
        public string? Content { get; set; }
        
        public string PositionType { get; set; } = "absolute";
        public int PosX { get; set; } = 0;
        public int PosY { get; set; } = 0;
        public int Width { get; set; } = 200;
        public int Height { get; set; } = 100;
        public int Rotation { get; set; } = 0;
        public int ZIndex { get; set; } = 0;

        public string? BackgroundColor { get; set; }
        public string? TextColor { get; set; }
        public int FontSize { get; set; } = 16;
        public string? FontFamily { get; set; }
        public string TextAlign { get; set; } = "center";
        public string FontWeight { get; set; } = "400";
        public string FontStyle { get; set; } = "normal";

        public string? TextShadow { get; set; }
        public string? TextGradient { get; set; }
        public string? TextStroke { get; set; }
        public string? TextGlow { get; set; }
        public string? TextBackground { get; set; }
        public int TextBackgroundPadding { get; set; } = 8;
        public int TextBackgroundRadius { get; set; } = 8;
        public string? TextDecoration { get; set; }
        public string? TextTransform { get; set; }
        public float LetterSpacing { get; set; } = 0;
        public float LineHeight { get; set; } = 1.5f;
        public int MaxWidth { get; set; } = 0;
        public int MaxLines { get; set; } = 0; 

        public string? Animation { get; set; }
        public int Duration { get; set; } = 300;
        public int Delay { get; set; } = 0;
        public string? IterationCount { get; set; } = "1";

        public bool IsDraggable { get; set; } = true;
        public bool IsResizable { get; set; } = true;
        public bool IsVisible { get; set; } = true;
        public string? LinkUrl { get; set; }
        public bool OpenInNewTab { get; set; } = false;

        public bool VisibleOnMobile { get; set; } = true;
        public bool VisibleOnTablet { get; set; } = true;
        public bool VisibleOnDesktop { get; set; } = true;
    }
}