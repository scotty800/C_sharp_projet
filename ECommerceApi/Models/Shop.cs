using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ECommerceApi.Models
{
    public class Shop
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [Required]
        public int OwnerId { get; set; }
        public User? Owner { get; set; }

        [Required]
        [MaxLength(100)]
        public string Slug { get; set; } = string.Empty;

        public string? LogoUrl { get; set; }
        public string? BannerUrl { get; set; }

        public string TextColor { get; set; } = "#FFFFFF";
        public string BackgroundColor { get; set; } = "#000000";
        public string ThemeColor { get; set; } = "#2563EB";

        public string? Email { get; set; }
        public string? Phone { get; set; }

        public int ProductCount { get; set; } = 0;

        public bool IsActive { get; set; } = true;

        [NotMapped]
        public double AverageRating { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}