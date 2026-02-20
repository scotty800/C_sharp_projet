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
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var shops = await _shopService.GetUserShopsAsync(userId);

            var shopDtos = shops.Select(s => new
            {
                s.Id,
                s.Name,
                s.Slug,
                s.Description,
                s.LogoUrl,
                s.BannerUrl,
                s.ProductCount,
                s.ThemeColor,
                s.BackgroundColor,
                s.TextColor,
                s.CreatedAt
            });

            return Ok(shopDtos);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetShopById(int id)
    {
        var shop = await _shopService.GetShopByIdAsync(id);
        if (shop == null)
            return NotFound(new { message = "Shop non trouvé" });

        var dto = new
        {
            shop.Id,
            shop.Name,
            shop.Description,
            shop.Slug,
            shop.OwnerId,
            Username = shop.Owner?.Username,
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
                p.ImageUrl,
                p.Category
            }).ToList()
        };
        return Ok(dto);
    }

    [HttpGet("slug/{slug}")]
    public async Task<IActionResult> GetShopBySlug(string slug)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(slug))
                return BadRequest(new { message = "Slug is required" });

            var shop = await _shopService.GetShopBySlugAsync(slug);

            if (shop == null)
                return NotFound(new { message = $"Shop with slug '{slug}' not found" });

            var dto = new
            {
                shop.Id,
                shop.Name,
                shop.Description,
                shop.Slug,
                shop.OwnerId,
                Username = shop.Owner?.Username,
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
                    p.ImageUrl,
                    p.Category
                }).ToList()
            };

            return Ok(dto);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

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
            return NotFound(new { message = "Shop non trouvé" });

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

            return Ok(new
            {
                message = "Boutique créée avec succès",
                shop = new
                {
                    shop.Id,
                    shop.Name,
                    shop.Slug,
                    shop.Description,
                    shop.LogoUrl,
                    shop.BannerUrl,
                    shop.ProductCount
                }
            });
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

        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var updated = await _shopService.UpdateShopAsync(id, userId, shopDto);

            if (!updated)
                return NotFound(new { message = "Shop non trouvé" });

            return Ok(new { message = "Boutique mise à jour avec succès" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteShop(int id)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var deleted = await _shopService.DeleteShopAsync(id, userId);

            if (!deleted)
                return NotFound(new { message = "Shop non trouvé" });

            return Ok(new { message = "Boutique supprimée avec succès" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/logo")]
    [Authorize]
    public async Task<IActionResult> UploadLogo(int id, [FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Fichier invalide" });

        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var uploaded = await _shopService.UploadLogoAsync(id, userId, file);

            if (!uploaded)
                return NotFound(new { message = "Shop non trouvé" });

            return Ok(new
            {
                message = "Logo uploadé avec succès"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/banner")]
    [Authorize]
    public async Task<IActionResult> UploadBanner(int id, [FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Fichier invalide" });

        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var uploaded = await _shopService.UploadBannerAsync(id, userId, file);

            if (!uploaded)
                return NotFound(new { message = "Shop non trouvé" });

            return Ok(new
            {
                message = "Bannière uploadée avec succès"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}