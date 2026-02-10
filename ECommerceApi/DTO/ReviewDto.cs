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
        public bool IsVerifiedPurchase { get; set; }

        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;

        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
    }

    public class ProductRatingDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public Dictionary<int, int> RatingDistribution { get; set; } = new();
    }
}