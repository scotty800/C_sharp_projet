namespace ECommerceApi.DTO
{
    public class CreateTemplateDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = "general";
        public string? ThumbnailUrl { get; set; }
        public string? PreviewUrl { get; set; }
        public int SourceShopId { get; set; }
        public bool IsPremium { get; set; } = false;
        public int Price { get; set; } = 0;
    }
}