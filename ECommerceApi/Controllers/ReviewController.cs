using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ECommerceApi.Services;
using ECommerceApi.DTO;
using System.Security.Claims;

[ApiController]
[Route("api/reviews")]
public class ReviewController : ControllerBase
{
    private readonly IReviewService _reviewService;
    private readonly IProductService _productService;

    public ReviewController(IReviewService reviewService, IProductService productService)
    {
        _reviewService = reviewService;
        _productService = productService;
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto reviewDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var review = await _reviewService.CreateReviewAsync(userId, reviewDto);

            return Ok(new 
            {
                message = "Avis ajouté avec succès",
                reviewId = review.Id
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new {
                message = ex.Message
            });
        }
    }

    [HttpGet("product/{productId}")]
    public async Task<IActionResult> GetReviewsByProduct(int productId)
    {
        var reviews = await _reviewService.GetReviewsByProductAsync(productId);
        var rating = await _reviewService.GetProductRatingAsync(productId);

        return Ok(new
        {
            rating,
            reviews
        });
    }

    [HttpGet("user")]
    [Authorize]
    public async Task<IActionResult> GetMyReviews()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var reviews = await _reviewService.GetReviewsByUserAsync(userId);

        return Ok(reviews);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetReviewsByUser(int userId)
    {
        var reviews = await _reviewService.GetReviewsByUserAsync(userId);
        return Ok(reviews);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateReview(int id, [FromBody] UpdateReviewDto reviewDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var updated = await _reviewService.UpdateReviewAsync(id, userId, new CreateReviewDto 
        {
            Rating = reviewDto.Rating,
            Comment = reviewDto.Comment,
            ProductId = 0
        });

        if (!updated)
            return NotFound("Avis non trouvé ou vous n'êtes pas l'auteur");

        return Ok(new {
            message = "Avis mis à jour avec succès"
        });
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteReview(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var deleted = await _reviewService.DeleteReviewAsync(id, userId);

        if (!deleted)
            return NotFound("Avis non trouvé ou vous n'êtes pas l'auteur");
        
        return Ok(new 
        {
            message = "Avis supprimé avec succès"
        });
    }

    [HttpGet("product/{productId}/rating")]
    public async Task<IActionResult> GetProductRating(int productId)
    {
        var rating = await _reviewService.GetProductRatingAsync(productId);
        return Ok(rating);
    }

    [HttpGet("shop/{shopId}/rating")]
    public async Task<IActionResult> GetShopRating(int shopId)
    {
        var average = await _reviewService.GetAverageRatingByShopAsync(shopId);
        return Ok(new {
            shopId,
            averageRating  = average
        });
    }
}