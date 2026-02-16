using System.ComponentModel.DataAnnotations;

namespace ECommerceApi.Models
{
    public class ProductView
    {
        public int Id { get; set; }

        [Required]
        public int ProductId { get; set; }
        public Product Product { get; set; }

        public int? UserId { get; set; }
        public User? User { get; set; }

        public DateTime ViewedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(45)]
        public string? IpAddress { get; set; }

        [MaxLength(500)]
        public string? UserArgent { get; set; }
    }
}