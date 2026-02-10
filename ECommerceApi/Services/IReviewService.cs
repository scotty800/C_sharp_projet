using ECommerceApi.Models;
using ECommerceApi.DTO;

namespace ECommerceApi.Services
{
    public interface IReviewService
    {
        Task<Review> CreateReviewAsync(int userId, CreateReviewDto reviewDto);
        Task<Review?> GetReviewByIdAsync(int id);
        Task<List<ReviewResponseDto>> GetReviewsByProductAsync(int productId);
        Task<List<ReviewResponseDto>> GetReviewsByUserAsync(int userId);
        Task<bool> UpdateReviewAsync(int reviewId, int userId, CreateReviewDto reviewDto);
        Task<bool> DeleteReviewAsync(int reviewId, int userId);
        Task<bool> HasUserReviewdProductAsync(int userId, int productId);
        Task<ProductRatingDto> GetProductRatingAsync(int productId);
        Task<double> GetAverageRatingByShopAsync(int shopId);
    }
}