using System.ComponentModel.DataAnnotations;

namespace ECommerceApi.DTO
{
    public class CreateShopRequestDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(100)]
        public string Slug { get; set; } = string.Empty;

        public string ThemeColor { get; set; } = "#2563EB";
        public string BackgroundColor { get; set; } = "#000000";
        public string TextColor { get; set; } = "#FFFFFF";

        public int ProductCount { get; set; } = 0;

        public string? Email { get; set; }
        public string? Phone { get; set; }
    }
}