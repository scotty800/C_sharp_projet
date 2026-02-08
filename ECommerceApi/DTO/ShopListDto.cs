using System.ComponentModel.DataAnnotations;

namespace ECommerceApi.DTO
{
    public class ShopListDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Slug { get; set; } = string.Empty;

        public string? LogoUrl { get; set; }
        public string? BannerUrl { get; set; }

        public string ThemeColor { get; set; } = "#2563EB";
        public string BackgroundColor { get; set; } = "#000000";
        public string TextColor { get; set; } = "#FFFFFF";

        public int OwnerId { get; set; }
        public string OwnerName { get; set; } = string.Empty;
    }
}