using System.ComponentModel.DataAnnotations;

namespace ECommerceApi.DTO
{
    public class CreateReviewDto
    {
        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        [MaxLength(1000)]
        public string? Comment { get; set; }

        [Required]
        public int ProductId { get; set; }
    }

    public class ReviewResponseDto
    {
        public int Id { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsVerifiedPurchase { get; set; }
        
        // Utilisateur
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string? UserAvatar { get; set; }
        
        // Produit
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? ProductImage { get; set; }
        
        // Shop
        public int? ShopId { get; set; }
        public string? ShopName { get; set; }
    }
}