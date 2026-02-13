using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ECommerceApi.Services;
using ECommerceApi.DTO;
using System.Security.Claims;

[ApiController]
[Route("api/cart")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var cart = await _cartService.GetCartDetailsAsync(userId);
        return Ok(cart);
    }

    [HttpGet("count")]
    public async Task<IActionResult> GetCartCount()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var count = await _cartService.GetCartItemCountAsync(userId);
        return Ok(new { count });
    }
    
    [HttpPost("add")]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartDto cartDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var item = await _cartService.AddToCartAsync(userId, cartDto);

            return Ok(new 
            {
                message = "Produit ajouté au panier",
                itemId = item.Id
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [HttpPut("item/{itemId}")]
    public async Task<IActionResult> UpdateCarItem(int itemId, [FromBody] UpdateCartItemDto cartDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var updated =  await _cartService.UpdateCartItemAsync(userId, itemId, cartDto);

        if (!updated)
            return NotFound("Article non trouvé dans votre panier");
        
        return Ok(new { message = "Quantité mise à jour" });
    }

    [HttpDelete("item/{itemId}")]
    public async Task<IActionResult> RemoveFromCart(int itemId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var removed = await _cartService.RemoveFromCartAsync(userId, itemId);

        if (!removed)
            return NotFound("Article non trouvé dans votre panier");
        
        return Ok(new { message = "Article retiré du panier" });
    }

    [HttpDelete("clear")]
    public async Task<IActionResult> ClearCart()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        await _cartService.ClearCartAsync(userId);

        return Ok(new { message = "Panier vidé avec succès" });
    }
}