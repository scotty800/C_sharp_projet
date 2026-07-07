using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ECommerceApi.Services;
using ECommerceApi.DTO;
using System.Security.Claims;

[ApiController]
[Route("api/shipping")]
public class ShippingController : ControllerBase
{
    private readonly IShippingService _shippingService;

    public ShippingController(IShippingService shippingService)
    {
        _shippingService = shippingService;
    }

    [HttpGet("shop/{shopId}")]
    public async Task<IActionResult> GetShopMethods(int shopId)
    {
        var methods = await _shippingService.GetShopMethodsAsync(shopId);
        return Ok(methods);
    }

    [HttpPost("shop/{shopId}")]
    [Authorize]
    public async Task<IActionResult> UpsertMethod(int shopId, [FromBody] UpsertShippingMethodDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var result = await _shippingService.UpsertMethodAsync(shopId, userId, dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("shop/{shopId}/{methodId}")]
    [Authorize]
    public async Task<IActionResult> DeleteMethod(int shopId, int methodId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var deleted = await _shippingService.DeleteMethodAsync(shopId, userId, methodId);
        if (!deleted) return NotFound(new { message = "Méthode non trouvée" });
        return NoContent();
    }

    [HttpGet("cart-summary")]
    [Authorize]
    public async Task<IActionResult> GetCartShippingSummary()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var summary = await _shippingService.CalculateCartShippingAsync(userId);
        return Ok(summary);
    }
}