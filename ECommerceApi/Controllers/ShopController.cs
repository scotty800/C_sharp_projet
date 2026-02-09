using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ECommerceApi.Services;
using ECommerceApi.DTO;
using System.Security.Claims;
using ECommerceApi.Mappers;
using ECommerceApi.Models;

[ApiController]
[Route("api/shops")]
public class ShopController : ControllerBase
{
    private readonly IShopService _shopService;
    private readonly IProductService _productService;

    public ShopController(IShopService shopService, IProductService productService)
    {
        _shopService = shopService;
        _productService = productService;
    }

    [HttpGet]
    public async Task<IActionResult> GetShops(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null)
    {
        var result = await _shopService.GetShopsPagedAsync(page, pageSize, search);
        return Ok(result);
    }

    [HttpGet("my-shops")]
    [Authorize]
    public async Task<IActionResult> GetMyShops()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    
        var shops = await _shopService.GetUserShopsAsync(userId); // List<Shop>
    
        var shopDtos = ShopMapper.ToDtoList(shops); // List<ShopResponseDto>
        
        return Ok(shopDtos);
    }


    [HttpGet("slug/{slug}")]
public async Task<IActionResult> GetShopBySlug(string slug)
{
    var shop = await _shopService.GetShopBySlugAsync(slug);
    if (shop == null)
        return NotFound("Shop non trouvé");
    
    // Convertir en DTO
    var dto = new 
    {
        shop.Id,
        shop.Name,
        shop.Description,
        shop.Slug,
        shop.OwnerId,
        shop.Owner?.Username,
        shop.ThemeColor,
        shop.BackgroundColor,
        shop.TextColor,
        shop.LogoUrl,
        shop.BannerUrl,
        shop.Email,
        shop.Phone,
        shop.ProductCount,
        shop.CreatedAt,
        Products = shop.Products?.Select(p => new 
        {
            p.Id,
            p.Name,
            p.Price,
            p.Stock,
            p.Category
        }).ToList()
    };
    
    return Ok(dto);
}

    // ✅ NOUVEL ENDPOINT : Récupérer les produits d'un shop
    [HttpGet("{id}/products")]
    public async Task<IActionResult> GetShopProducts(
        int id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] string? sortBy = null)
    {
        var shop = await _shopService.GetShopByIdAsync(id);
        if (shop == null)
            return NotFound("Shop non trouvé");

        var result = await _productService.GetProductsByShopPagedAsync(
            id, page, pageSize, minPrice, maxPrice, sortBy);

        return Ok(new 
        {
            shop = new { shop.Id, shop.Name, shop.Slug, shop.ProductCount },
            products = result
        });
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateShop([FromBody] CreateShopRequestDto shopDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var shop = await _shopService.CreateShopAsync(userId, shopDto);

            return CreatedAtAction(
                nameof(GetShopBySlug),
                new { slug = shop.Slug },
                shop
            );
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateShop(int id, [FromBody] UpdateShopRequestDto shopDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var updated = await _shopService.UpdateShopAsync(id, userId, shopDto);

        if (!updated)
            return NotFound("Shop non trouvé");
        
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteShop(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var deleted = await _shopService.DeleteShopAsync(id, userId);

        if (!deleted)
            return NotFound("Shop non trouvé");
        
        return NoContent();
    }

    [HttpPost("{id}/logo")]
    [Authorize]
    public async Task<IActionResult> UploadLogo(int id, [FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Fichier invalide");
        
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var uploaded = await _shopService.UploadLogoAsync(id, userId, file);

        if (!uploaded)
            return NotFound("Shop non trouvé");
        
        return Ok(new {
            message = "Logo uploadé avec succès"
        });
    }

    [HttpPost("{id}/banner")]
    [Authorize]
    public async Task<IActionResult> UploadBanner(int id, [FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Fichier invalide");
        
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var uploaded = await _shopService.UploadBannerAsync(id, userId, file);

        if (!uploaded)
            return NotFound("Shop non trouvé");
        
        return Ok(new {
            message = "Bannière uploadée avec succès"
        });
    }
}