namespace ECommerceApi.DTO
{
    public class AssetDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string? ThumbnailUrl { get; set; }
        public string? PreviewUrl { get; set; }
        public bool IsPremium { get; set; }
        public int Price { get; set; }
        public int UsageCount { get; set; }
    }
}