using System.ComponentModel.DataAnnotations;

namespace ECommerceApi.Models
{
    public class ShopVisit
    {
        public int Id { get; set; }

        [Required]
        public int ShopId { get; set; }
        public Shop Shop { get; set; } = null!;

        public int? UserId { get; set; }
        public User? User { get; set; }

        public DateTime VisitedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(45)]
        public string? IpAddress { get; set; }

        [MaxLength(500)]
        public string? UserAgent { get; set; }

        [MaxLength(10)]
        public string? Device { get; set; }
    }
}