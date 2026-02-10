using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotation.Schema;

namespace ECommerceApi.Models
{
    public class Review
    {
        public int Id { get; set; }

        [Required]
        public int ProductId { get; set; }
        public Product Product { get; set; } = null!;

        [Required]
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        [required]
        [Range(1, 5)]
        public int Rating { get; set; }

        [maxLength(1000)]
        public string? Comment { get; set; }

        public bool IsVerifiedPurchase { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}