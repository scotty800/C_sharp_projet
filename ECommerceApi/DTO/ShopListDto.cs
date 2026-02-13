using System.ComponentModel.DataAnnotations;

namespace ECommerceApi.DTO
{
    public class ShopListDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        
        public int OwnerId { get; set; }
        public string OwnerUsername { get; set; } = string.Empty; // CORRECT
        
        public string ThemeColor { get; set; } = string.Empty;
        public string BackgroundColor { get; set; } = string.Empty;
        public string TextColor { get; set; } = string.Empty;
        
        public string? LogoUrl { get; set; }
        public string? BannerUrl { get; set; }
        
        public int ProductCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}