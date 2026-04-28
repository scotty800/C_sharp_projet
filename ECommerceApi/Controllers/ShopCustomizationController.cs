using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ECommerceApi.Services;
using ECommerceApi.DTO;
using System.Security.Claims;

namespace ECommerceApi.Controllers
{
    [ApiController]
    [Route("api/shops/{shopId}/customization")]
    [Authorize]
    public class ShopCustomizationController : ControllerBase
    {
        private readonly IShopCustomizationService _customizationService;
        private readonly IShopService _shopService;
        private readonly ILogger<ShopCustomizationController> _logger;

        public ShopCustomizationController(
            IShopCustomizationService customizationService,
            IShopService shopService,
            ILogger<ShopCustomizationController> logger)
        {
            _customizationService = customizationService;
            _shopService = shopService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetCustomization(int shopId)
        {
            var userId = GetUserId();
            if (!await IsOwner(shopId, userId))
                return Unauthorized();
            
            var customization = await _customizationService.GetByShopIdAsync(shopId);
            if (customization == null)
            {
                return Ok(new ShopCustomizationDto());
            }
            return Ok(customization);
        }

        [HttpPut]
        public async Task<IActionResult> SaveCustomization(int shopId, [FromBody] ShopCustomizationDto dto)
        {
            var userId = GetUserId();
            if (!await IsOwner(shopId, userId))
                return Unauthorized();

            var result = await _customizationService.CreateOrUpdateAsync(shopId, userId, dto);
            return Ok(result);
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteCustomization(int shopId)
        {
            var userId = GetUserId();
            if (!await IsOwner(shopId, userId))
                return Unauthorized();

            var result = await _customizationService.DeleteCustomizationAsync(shopId, userId);
            return Ok(new { deleted = result });
        }

        [HttpGet("sections")]
        public async Task<IActionResult> GetSections(int shopId)
        {
            var customization = await _customizationService.GetByShopIdAsync(shopId);
            if (customization == null || customization.CustomSections == null)
                return Ok(new List<CustomSectionDto>());
            
            return Ok(customization.CustomSections);
        }

        [HttpPost("sections")]
        public async Task<IActionResult> AddSection(int shopId, [FromBody] CustomSectionDto dto)
        {
            var userId = GetUserId();
            if (!await IsOwner(shopId, userId))
                return Unauthorized();

            var section = await _customizationService.AddSectionAsync(shopId, userId, dto);
            return CreatedAtAction(nameof(GetSections), new { shopId }, section);
        }

        [HttpPut("sections/{sectionId}")]
        public async Task<IActionResult> UpdateSection(int shopId, int sectionId, [FromBody] CustomSectionDto dto)
        {
            var userId = GetUserId();
            if (!await IsOwner(shopId, userId))
                return Unauthorized();

            var section = await _customizationService.UpdateSectionAsync(shopId, userId, sectionId, dto);
            if (section == null)
                return NotFound();

            return Ok(section);
        }

        [HttpDelete("sections/{sectionId}")]
        public async Task<IActionResult> DeleteSection(int shopId, int sectionId)
        {
            var userId = GetUserId();
            if (!await IsOwner(shopId, userId))
                return Unauthorized();

            var deleted = await _customizationService.DeleteSectionAsync(shopId, userId, sectionId);

            if (!deleted)
                return NotFound();
            
            return Ok(new { message = "Section supprimée" });
        }

        [HttpPost("sections/reorder")]
        public async Task<IActionResult> ReorderSections(int shopId, [FromBody] List<int> sectionIds)
        {
            var userId = GetUserId();
            if (!await IsOwner(shopId, userId))
                return Unauthorized();

            // CORRECTION 1: Appel correct de la méthode ReorderSectionsAsync
            var result = await _customizationService.ReorderSectionsAsync(shopId, userId, sectionIds);
            return Ok(result);
        }

        [HttpGet("assets")]
        public async Task<IActionResult> GetAssets(int shopId)
        {
            var customization = await _customizationService.GetByShopIdAsync(shopId);
            if (customization == null || customization.CustomAssets == null)
                return Ok(new List<CustomAssetDto>());
            
            return Ok(customization.CustomAssets);
        }

        [HttpPost("assets")]
        public async Task<IActionResult> AddAsset(int shopId, [FromBody] CustomAssetDto dto)
        {
            var userId = GetUserId();
            if (!await IsOwner(shopId, userId))
                return Unauthorized();

            var asset = await _customizationService.AddAssetAsync(shopId, userId, dto);
            return CreatedAtAction(nameof(GetAssets), new { shopId }, asset);
        }

        [HttpPut("assets/{assetId}")]
        public async Task<IActionResult> UpdateAsset(int shopId, int assetId, [FromBody] CustomAssetDto dto)
        {
            var userId = GetUserId();
            if (!await IsOwner(shopId, userId))
                return Unauthorized();

            var asset = await _customizationService.UpdateAssetAsync(shopId, userId, assetId, dto);

            if (asset == null)
                return NotFound();

            return Ok(asset);
        }

        [HttpDelete("assets/{assetId}")]
        public async Task<IActionResult> DeleteAsset(int shopId, int assetId)
        {
            var userId = GetUserId();
            if (!await IsOwner(shopId, userId))
                return Unauthorized();

            var deleted = await _customizationService.DeleteAssetAsync(shopId, userId, assetId);

            if (!deleted)
                return NotFound();
            
            return Ok(new { message = "Asset supprimé" });
        }

        [HttpPut("products/{productId}")]
        public async Task<IActionResult> UpdateProductCustomization(int shopId, int productId, [FromBody] ShopProductCustomizationDto dto)
        {
            var userId = GetUserId();
            if (!await IsOwner(shopId, userId))
                return Unauthorized();
            
            dto.ProductId = productId;
            var result = await _customizationService.UpdateProductCustomizationAsync(shopId, userId, dto);
            return Ok(result);
        }

        [HttpGet("products/{productId}")]
        public async Task<IActionResult> GetProductCustomization(int shopId, int productId)
        {
            var result = await _customizationService.GetProductCustomizationAsync(shopId, productId);
            if (result == null)
            {
                return Ok(new ShopProductCustomizationDto { ProductId = productId });
            }
            return Ok(result);
        }

        [HttpGet("products/featured")]
        public async Task<IActionResult> GetFeaturedProducts(int shopId, [FromQuery] int limit = 10)
        {
            var products = await _customizationService.GetFeaturedProductsAsync(shopId, limit);
            return Ok(products);
        }

        [HttpPost("templates/apply/{templateId}")]
        public async Task<IActionResult> ApplyTemplate(int shopId, int templateId, [FromQuery] bool overrideExisting = false)
        {
            var userId = GetUserId();
            if (!await IsOwner(shopId, userId))
                return Unauthorized();

            var result = await _customizationService.ApplyTemplateAsync(shopId, userId, templateId, overrideExisting);
            return Ok(result);
        }

        [HttpPost("snapshots/{name}")]
        public async Task<IActionResult> SaveSnapshot(int shopId, string name)
        {
            var userId = GetUserId();
            if (!await IsOwner(shopId, userId))
                return Unauthorized();

            var result = await _customizationService.SaveSnapshotAsync(shopId, userId, name);
            return Ok(new { name, saved = true });
        }

        [HttpPost("snapshots/{name}/restore")]
        public async Task<IActionResult> RestoreSnapshot(int shopId, string name)
        {
            var userId = GetUserId();
            if (!await IsOwner(shopId, userId))
                return Unauthorized();

            var result = await _customizationService.RestoreSnapshotAsync(shopId, userId, name);
            return Ok(result);
        }

        [HttpGet("snapshots")]
        public async Task<IActionResult> GetSnapshots(int shopId)
        {
            var snapshots = await _customizationService.GetSnapshotsAsync(shopId);
            return Ok(snapshots);
        }

        [HttpPost("publish")]
        public async Task<IActionResult> Publish(int shopId)
        {
            var userId = GetUserId();
            if (!await IsOwner(shopId, userId))
                return Unauthorized();

            var published = await _customizationService.PublishAsync(shopId, userId);
            return Ok(new { published });
        }

        [HttpPost("unpublish")]
        public async Task<IActionResult> Unpublish(int shopId)
        {
            var userId = GetUserId();
            if (!await IsOwner(shopId, userId))
                return Unauthorized();

            var unpublished = await _customizationService.UnpublishAsync(shopId, userId);
            return Ok(new { published = !unpublished });
        }

        [HttpGet("preview/html")]
        public async Task<IActionResult> GetPreviewHtml(int shopId)
        {
            var html = await _customizationService.GeneratePreviewHtmlAsync(shopId);
            return Content(html, "text/html");
        }

        [HttpGet("preview/screenshot")]
        public async Task<IActionResult> GetPreviewScreenshot(int shopId)
        {
            var screenshotUrl = await _customizationService.GeneratePreviewScreenshotAsync(shopId);
            return Ok(new { screenshotUrl });
        }

        // ==================== MÉTHODES PRIVÉES ====================

        private int GetUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        }

        private async Task<bool> IsOwner(int shopId, int userId)
        {
            var shop = await _shopService.GetShopByIdAsync(shopId);
            return shop != null && shop.OwnerId == userId;
        }
    }
}