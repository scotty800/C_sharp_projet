using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ECommerceApi.Models
{
    public class Asset
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Type { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty;

        [Required]
        public string Url { get; set; } = string.Empty;

        public string? ThumbnailUrl { get; set; }
        public string? PreviewUrl { get; set; }

        [ForeignKey(nameof(ShopId))]
        public Shop? Shop { get; set; }

        public int? ShopId { get; set; }

        public bool IsGlobal { get; set; } = false;

        public bool IsPremium { get; set; } = false;
        public int Price { get; set; } = 0;
        public string? License { get; set; }

        public int UsageCount { get; set; } = 0;
        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int? CreatedBy { get; set; }

    }
}