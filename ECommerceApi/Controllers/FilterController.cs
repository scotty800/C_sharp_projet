using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ECommerceApi.Services;
using ECommerceApi.DTO;
using System.Security.Claims;

namespace ECommerceApi.Controllers
{
    [ApiController]
    [Route("api/shops/{shopId}/filters")]
    [Authorize]
    public class FilterController : ControllerBase
    {
        private readonly IFilterService _filterService;
        private readonly IShopService _shopService;

        public FilterController(IFilterService filterService, IShopService shopService)
        {
            _filterService = filterService;
            _shopService = shopService;
        }

        [HttpGet("global")]
        public async Task<IActionResult> GetGlobalFilter(int shopId)
        {
            // CORRECTION 1: Vérification explicite du null
            var filter = await _filterService.GetShopFilterAsync(shopId);
            if (filter == null)
            {
                return Ok(new ShopFilterDto());
            }
            return Ok(filter);
        }

        [HttpPut("global")]
        public async Task<IActionResult> UpdateGlobalFilter(int shopId, [FromBody] ShopFilterDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var shop = await _shopService.GetShopByIdAsync(shopId);

            if (shop == null || shop.OwnerId != userId)
            {
                return Unauthorized();
            }

            var result = await _filterService.UpdateShopFilterAsync(shopId, userId, dto);
            return Ok(result);
        }

        [HttpGet("images")]
        public async Task<IActionResult> GetImageFilters(int shopId)
        {
            var filters = await _filterService.GetImageFiltersAsync(shopId);
            return Ok(filters);
        }

        [HttpPost("images")]
        public async Task<IActionResult> AddImageFilter(int shopId, [FromBody] ImageFilterDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var shop = await _shopService.GetShopByIdAsync(shopId);

            if (shop == null || shop.OwnerId != userId)
            {
                return Unauthorized();
            }

            var result = await _filterService.AddImageFilterAsync(shopId, userId, dto);
            return Ok(result);
        }

        [HttpPut("images/{filterId}")]
        public async Task<IActionResult> UpdateImageFilter(int shopId, int filterId, [FromBody] ImageFilterDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var shop = await _shopService.GetShopByIdAsync(shopId);

            if (shop == null || shop.OwnerId != userId)
            {
                return Unauthorized();
            }

            var result = await _filterService.UpdateImageFilterAsync(shopId, filterId, userId, dto);

            if (result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }

        [HttpDelete("images/{filterId}")]
        public async Task<IActionResult> DeleteImageFilter(int shopId, int filterId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var shop = await _shopService.GetShopByIdAsync(shopId);

            if (shop == null || shop.OwnerId != userId)
            {
                return Unauthorized();
            }

            var success = await _filterService.DeleteImageFilterAsync(shopId, filterId, userId);

            if (!success)
            {
                return NotFound();
            }
            return NoContent();
        }

        [HttpGet("products/{productId}/filter")]
        public async Task<IActionResult> GetProductFilter(int shopId, int productId, [FromQuery] int imageIndex = 1)
        {
            // CORRECTION 2: Vérification explicite du null avec le bon DTO
            var filter = await _filterService.GetProductImageFilterAsync(shopId, productId, imageIndex);
            if (filter == null)
            {
                return Ok(new ProductImageFilterDto { ProductId = productId });
            }
            return Ok(filter);
        }

        [HttpPut("products/{productId}/filter")]
        // CORRECTION 3: Correction du type du paramètre (ProductImageFilterDto au lieu de ProductImageFilterDTO)
        public async Task<IActionResult> UpdateProductFilter(int shopId, int productId, [FromBody] ProductImageFilterDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var shop = await _shopService.GetShopByIdAsync(shopId);

            if (shop == null || shop.OwnerId != userId)
            {
                return Unauthorized();
            }

            dto.ProductId = productId;

            var result = await _filterService.UpdateProductImageFilterAsync(shopId, userId, dto);
            return Ok(result);
        }

        [HttpDelete("products/{productId}/filter")]
        public async Task<IActionResult> RemoveProductFilter(int shopId, int productId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var shop = await _shopService.GetShopByIdAsync(shopId);

            if (shop == null || shop.OwnerId != userId)
            {
                return Unauthorized();
            }

            var result = await _filterService.RemoveProductImageFilterAsync(shopId, productId, userId);
            return Ok(new { removed = result });
        }

        [HttpGet("presets")]
        [AllowAnonymous]
        public async Task<IActionResult> GetFilterPresets([FromQuery] string? category = null)
        {
            var presets = await _filterService.GetFilterPresetsAsync(category);
            return Ok(presets);
        }

        [HttpGet("presets/{presetId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetFilterPreset(string presetId)
        {
            var preset = await _filterService.GetFilterPresetByIdAsync(presetId);
            if (preset == null)
            {
                return NotFound();
            }
            return Ok(preset);
        }

        [HttpPost("seasonal/{effect}")]
        public async Task<IActionResult> ApplySeasonalEffect(int shopId, string effect)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var shop = await _shopService.GetShopByIdAsync(shopId);

            if (shop == null || shop.OwnerId != userId)
            {
                return Unauthorized();
            }

            try
            {
                var result = await _filterService.ApplySeasonalEffectAsync(shopId, userId, effect);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("seasonal")]
        public async Task<IActionResult> RemoveSeasonalEffect(int shopId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var shop = await _shopService.GetShopByIdAsync(shopId);

            if (shop == null || shop.OwnerId != userId)
            {
                return Unauthorized();
            }

            var result = await _filterService.RemoveSeasonalEffectAsync(shopId, userId);
            return Ok(new { removed = result });
        }
    }
}