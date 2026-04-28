namespace ECommerceApi.DTO
{
    public class TemplateDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = string.Empty;
        public string? ThumbnailUrl { get; set; }
        public string? PreviewUrl { get; set; }
        public bool IsPremium { get; set; }
        public int Price { get; set; }
        public int UsageCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}