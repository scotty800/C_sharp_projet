using ECommerceApi.Data;
using ECommerceApi.DTO;
using ECommerceApi.Models;
using ECommerceApi.Services;
using Microsoft.EntityFrameworkCore;

public class ReviewService : IReviewService
{
    private readonly AppDbContext _context;
    private readonly IOrderService _orderService;

    public ReviewService(AppDbContext context, IOrderService orderService)
    {
        _context = context;
        _orderService = orderService;
    }

    public async Task<Review> CreateReviewAsync(int userId, CreateReviewDto reviewDto)
    {
        var existingReview = await _context.Reviews.FirstOrDefaultAsync(
            r => r.UserId == userId && r.ProductId == reviewDto.ProductId);
        
        if (existingReview != null)
            throw new Exception("Vous avez déjà noté ce produit");
        
        var hasPurchased = await _orderService.HasUserPurchasedProductAsync(userId, reviewDto.ProductId);

        var review = new Review
        {
            ProductId = reviewDto.ProductId,
            UserId = userId,
            Rating = reviewDto.Rating,
            Comment = reviewDto.Comment,
            IsVerifiedPurchase  = hasPurchased,
            CreatedAt = DateTime.UtcNow
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        await UpdateProductAverageRating(reviewDto.ProductId);

        return review;
    }

    public async Task<Review?> GetReviewByIdAsync(int id)
    {
        return await _context.Reviews
            .Include(r => r.User)
            .Include(r => r.Product)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<List<ReviewResponseDto>> GetReviewsByProductAsync(int productId)
    {
        return await _context.Reviews
            .Where(r => r.ProductId == productId)
            .Include(r => r.User)
            .Include(r => r.Product)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewResponseDto 
            {
                Id = r.Id,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                IsVerifiedPurchase = r.IsVerifiedPurchase,
                UserId = r.UserId,
                Username = r.User.Username,
                ProductId = r.ProductId,
                ProductName = r.Product.Name
            })
            .ToListAsync();
    }

    public async Task<List<ReviewResponseDto>> GetReviewsByUserAsync(int userId)
{
    return await _context.Reviews
        .Where(r => r.UserId == userId)
        .Include(r => r.Product)
        .OrderByDescending(r => r.CreatedAt)
        .Select(r => new ReviewResponseDto
        {
            Id = r.Id,
            Rating = r.Rating,
            Comment = r.Comment,
            CreatedAt = r.CreatedAt,
            IsVerifiedPurchase = r.IsVerifiedPurchase,
            UserId = r.UserId,
            Username = r.User.Username,
            ProductId = r.ProductId,
            ProductName = r.Product.Name
        })
        .ToListAsync();
}

    public async Task<bool> UpdateReviewAsync(int reviewId, int userId, CreateReviewDto reviewDto)
    {
        var review = await _context.Reviews.FindAsync(reviewId);
        if (review == null || review.UserId != userId)
            return false;
        
        review.Rating = reviewDto.Rating;
        review.Comment = reviewDto.Comment;
        review.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await UpdateProductAverageRating(review.ProductId);

        return true;
    }

    public async Task<bool> DeleteReviewAsync(int reviewId, int userId)
    {
        var review = await _context.Reviews.FindAsync(reviewId);
        if (review == null || review.UserId != userId)
            return false;
        
        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();

        await UpdateProductAverageRating(review.ProductId);

        return true;
    }

    public async Task<bool> HasUserReviewedProductAsync(int userId, int productId)
    {
        return await _context.Reviews
            .AnyAsync(r => r.UserId == userId && r.ProductId == productId);
    }

    public async Task<ProductRatingDto> GetProductRatingAsync(int productId)
    {
        var product = await _context.Products
            .Include(p => p.Reviews)
            .FirstOrDefaultAsync(p => p.Id == productId);

        if (product == null)
            throw new Exception("Produit non trouvé");

        var ratingDistribution  = new Dictionary<int, int>
        {
            {1, 0}, {2, 0}, {3, 0}, {4, 0}, {5, 0}
        };

        foreach (var review in product.Reviews)
        {
            if (ratingDistribution.ContainsKey(review.Rating))
                ratingDistribution[review.Rating]++;
        }

        return new ProductRatingDto
        {
            ProductId = product.Id,
            ProductName = product.Name,
            AverageRating = product.Reviews.Any() ? product.Reviews.Average(r => r.Rating) : 0,
            TotalReviews = product.Reviews.Count,
            RatingDistribution = ratingDistribution
        };
    }

    public async Task<double> GetAverageRatingByShopAsync(int shopId)
    {
        var products = await _context.Products
            .Where(p => p.ShopId == shopId)
            .Include(p => p.Reviews)
            .ToListAsync();

        if (!products.Any())
            return 0;

        var allReviews = products.SelectMany(p => p.Reviews);
        return allReviews.Any() ? allReviews.Average(r => r.Rating) : 0;
    }

    private async Task UpdateProductAverageRating(int productId)
    {
        var product = await _context.Products
            .Include(p => p.Reviews)
            .FirstOrDefaultAsync(p => p.Id == productId);
        
        if (product != null)
        {
            await _context.SaveChangesAsync();
        }
    }
}