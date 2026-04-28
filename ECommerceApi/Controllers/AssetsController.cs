using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ECommerceApi.Services;
using ECommerceApi.DTO;
using System.Security.Claims;

namespace ECommerceApi.Controllers
{
    [ApiController]
    [Route("api/assets")]
    public class AssetsController : ControllerBase
    {
        private readonly IShopCustomizationService _customizationService;
        private readonly ILogger<AssetsController> _logger;

        public AssetsController(IShopCustomizationService customizationService, ILogger<AssetsController> logger)
        {
            _customizationService = customizationService;
            _logger = logger;
        }

        [HttpGet("templates")]
        public async Task<IActionResult> GetTemplates([FromQuery] string? category = null)
        {
            var templates = await _customizationService.GetTemplatesAsync(category);
            return Ok(templates);
        }

        [HttpGet("backgrounds")]
        public async Task<IActionResult> GetBackgrounds([FromQuery] string? category = null)
        {
            var assets = await _customizationService.GetAvailableAssetsAsync("background", category);
            return Ok(assets);
        }

        [HttpGet("stickers")]
        public async Task<IActionResult> GetStickers([FromQuery] string? category = null)
        {
            var assets = await _customizationService.GetAvailableAssetsAsync("sticker", category);
            return Ok(assets);
        }

        [HttpGet("shapes")]
        public async Task<IActionResult> GetShapes()
        {
            var assets = await _customizationService.GetAvailableAssetsAsync("shape", null);
            return Ok(assets);
        }

        [HttpGet("fonts")]
        public async Task<IActionResult> GetFonts()
        {
            var assets = await _customizationService.GetAvailableAssetsAsync("font", null);
            return Ok(assets);
        }

        [HttpGet("animations")]
        public async Task<IActionResult> GetAnimations()
        {
            var assets = await _customizationService.GetAvailableAssetsAsync("animation", null);
            return Ok(assets);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddAsset([FromBody] AddAssetDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var asset = await _customizationService.AddAssetToMarketplaceAsync(userId, dto);
            return Ok(asset);
        }
    }
}