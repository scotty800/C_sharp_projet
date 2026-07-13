using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ECommerceApi.Services;
using ECommerceApi.DTO;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ECommerceApi.Data;
using ECommerceApi.Models;

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
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public ShopCustomizationController(
            IShopCustomizationService customizationService,
            IShopService shopService,
            ILogger<ShopCustomizationController> logger,
            AppDbContext context,
            IWebHostEnvironment environment)
        {
            _customizationService = customizationService;
            _shopService = shopService;
            _logger = logger;
            _context = context;
            _environment = environment;
        }

        [HttpGet]
        public async Task<IActionResult> GetCustomization(int shopId)
        {
            var userId = GetUserId();
            if (!await IsOwner(shopId, userId))
                return Forbid();  // ⭐ Unauthorized() → Forbid()

            var customization = await _customizationService.GetByShopIdAsync(shopId);
            
            if (customization == null)
            {
                return Ok(new ShopCustomizationDto());
            }
            
            var result = new ShopCustomizationDto
            {
                LayoutType = customization.LayoutType,
                HeaderStyle = customization.HeaderStyle,
                ProductDisplayStyle = customization.ProductDisplayStyle,
                BackgroundType = customization.BackgroundType,
                BackgroundValue = customization.BackgroundValue,
                BackgroundPosition = customization.BackgroundPosition,
                BackgroundRepeat = customization.BackgroundRepeat,
                BackgroundSize = customization.BackgroundSize,
                BackgroundFixed = customization.BackgroundFixed,
                PrimaryColor = customization.PrimaryColor,
                SecondaryColor = customization.SecondaryColor,
                AccentColor = customization.AccentColor,
                TextColor = customization.TextColor,
                Enable3DEffect = customization.Enable3DEffect,
                AnimationEffect = customization.AnimationEffect,
                HoverEffect = customization.HoverEffect,
                PageTransition = customization.PageTransition,
                PrimaryFont = customization.PrimaryFont,
                SecondaryFont = customization.SecondaryFont,
                HeadingFont = customization.HeadingFont,
                BodyFont = customization.BodyFont,
                AccentFont = customization.AccentFont,
                HeadingSizeH1 = customization.HeadingSizeH1,
                HeadingSizeH2 = customization.HeadingSizeH2,
                HeadingSizeH3 = customization.HeadingSizeH3,
                BodySize = customization.BodySize,
                HeadingWeight = customization.HeadingWeight,
                BodyWeight = customization.BodyWeight,
                TextShadow = customization.TextShadow,
                TextGradient = customization.TextGradient,
                TextStroke = customization.TextStroke,
                TextGlow = customization.TextGlow,
                TextAnimation = customization.TextAnimation,
                CustomCss = customization.CustomCss,
                CustomJs = customization.CustomJs,
                FiltersEnabled = customization.FiltersEnabled,
                ActiveShopFilterId = customization.ActiveShopFilterId,
                ShowFilterPanel = customization.ShowFilterPanel,
                DefaultImageFilter = customization.DefaultImageFilter,
                CustomSections = customization.CustomSections?.Select(s => new CustomSectionDto
                {
                    Id = s.Id,
                    Type = s.Type,
                    Title = s.Title,
                    Subtitle = s.Subtitle,
                    Content = s.Content,
                    ImageUrl = s.ImageUrl,
                    BackgroundColor = s.BackgroundColor,
                    Order = s.Order,
                    IsVisible = s.IsVisible
                }).ToList() ?? new List<CustomSectionDto>(),
                CustomAssets = customization.CustomAssets?.Select(a => new CustomAssetDto
                {
                    Id = a.Id,
                    Type = a.Type,
                    Name = a.Name,
                    Url = a.Url,
                    Content = a.Content,
                    PosX = a.PosX,
                    PosY = a.PosY,
                    Width = a.Width,
                    Height = a.Height,
                    Rotation = a.Rotation,
                    ZIndex = a.ZIndex,
                    Animation = a.Animation,
                    Duration = a.Duration,
                    Delay = a.Delay,
                    IsDraggable = a.IsDraggable,
                    IsResizable = a.IsResizable,
                    IsVisible = a.IsVisible,
                    LinkUrl = a.LinkUrl,
                    FontFamily = a.FontFamily,
                    FontSize = a.FontSize,
                    FontWeight = a.FontWeight,
                    TextAlign = a.TextAlign,
                    TextColor = a.TextColor,
                    TextShadow = a.TextShadow,
                    TextGradient = a.TextGradient,
                    TextStroke = a.TextStroke,
                    TextGlow = a.TextGlow,
                    LetterSpacing = a.LetterSpacing,
                    LineHeight = a.LineHeight
                }).ToList() ?? new List<CustomAssetDto>()
            };
            
            return Ok(result);
        }

        [HttpPut]
        public async Task<IActionResult> SaveCustomization(int shopId, [FromBody] ShopCustomizationDto dto)
        {
            var userId = GetUserId();
            if (!await IsOwner(shopId, userId))
                return Forbid();  // ⭐ Unauthorized() → Forbid()

            var result = await _customizationService.CreateOrUpdateAsync(shopId, userId, dto);
            return Ok(result);
        }

        [HttpPut("background")]
        public async Task<IActionResult> UpdateBackground(int shopId, [FromBody] UpdateBackgroundDto dto)
        {
            var userId = GetUserId();
            if (!await IsOwner(shopId, userId))
                return Forbid();  // ⭐ Unauthorized() → Forbid()

            var customization = await _context.ShopCustomizations
                .FirstOrDefaultAsync(c => c.ShopId == shopId);
            if (customization == null)
            {
                customization = new ShopCustomization { ShopId = shopId, CreatedAt = DateTime.UtcNow };
                _context.ShopCustomizations.Add(customization);
            }
            customization.BackgroundColor = dto.BackgroundColor;
            customization.BackgroundType = dto.BackgroundType;
            customization.BackgroundValue = dto.BackgroundValue;
            customization.BackgroundOpacity = dto.BackgroundOpacity;
            customization.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return Ok(new { message = "Background mis à jour" });
        }

        [HttpGet("background")]
        public async Task<IActionResult> GetBackground(int shopId)
        {
            var userId = GetUserId();
            if (!await IsOwner(shopId, userId))
                return Forbid();  // ⭐ Unauthorized() → Forbid()

            var customization = await _context.ShopCustomizations
                .FirstOrDefaultAsync(c => c.ShopId == shopId);

            if (customization == null)
            {
                return Ok(new { backgroundColor = "#FFFFFF", backgroundType = "solid", backgroundOpacity = 100 });
            }

            return Ok(new 
            { 
                backgroundColor = customization.BackgroundColor ?? "#FFFFFF",
                backgroundType = customization.BackgroundType ?? "solid",
                backgroundValue = customization.BackgroundValue,
                backgroundOpacity = customization.BackgroundOpacity ?? 100
            });
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteCustomization(int shopId)
        {
            var userId = GetUserId();
            if (!await IsOwner(shopId, userId))
                return Forbid();  // ⭐ Unauthorized() → Forbid()

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
                return Forbid();  // ⭐ Unauthorized() → Forbid()

            var section = await _customizationService.AddSectionAsync(shopId, userId, dto);
            return CreatedAtAction(nameof(GetSections), new { shopId }, section);
        }

        [HttpPut("sections/{sectionId}")]
        public async Task<IActionResult> UpdateSection(int shopId, int sectionId, [FromBody] CustomSectionDto dto)
        {
            var userId = GetUserId();
            if (!await IsOwner(shopId, userId))
                return Forbid();  // ⭐ Unauthorized() → Forbid()

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
                return Forbid();  // ⭐ Unauthorized() → Forbid()

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
                return Forbid();  // ⭐ Unauthorized() → Forbid()

            var result = await _customizationService.ReorderSectionsAsync(shopId, userId, sectionIds);
            return Ok(result);
        }

        // ==================== ASSETS ENDPOINTS ====================

        [HttpGet("assets")]
        public async Task<IActionResult> GetAssets(int shopId)
        {
            var userId = GetUserId();
            if (!await IsOwner(shopId, userId))
                return Forbid();  // ⭐ Unauthorized() → Forbid()

            var assets = await _context.Assets
                .Where(a => a.ShopId == shopId && a.IsActive)
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new {
                    a.Id,
                    a.Name,
                    a.Type,
                    a.Category,
                    a.Url,
                    a.ThumbnailUrl,
                    a.CreatedAt
                })
                .ToListAsync();
            
            return Ok(assets);
        }

        [HttpGet("assets/global")]
        public async Task<IActionResult> GetGlobalAssets([FromQuery] string? type = null, [FromQuery] string? category = null)
        {
            var query = _context.Assets
                .Where(a => a.IsGlobal && a.IsActive);

            if (!string.IsNullOrEmpty(type))
                query = query.Where(a => a.Type == type);

            if (!string.IsNullOrEmpty(category))
                query = query.Where(a => a.Category == category);

            var assets = await query
                .OrderByDescending(a => a.UsageCount)
                .Select(a => new {
                    a.Id,
                    a.Name,
                    a.Type,
                    a.Category,
                    a.Url,
                    a.ThumbnailUrl,
                    a.PreviewUrl,
                    a.IsPremium,
                    a.Price
                })
                .ToListAsync();
            
            return Ok(assets);
        }

        [HttpPost("assets/upload")]
        public async Task<IActionResult> UploadAsset(int shopId, IFormFile file, [FromQuery] string? type = null, [FromQuery] string? category = null)
        {
            try
            {
                var userId = GetUserId();
                if (!await IsOwner(shopId, userId))
                    return Forbid();  // ⭐ Unauthorized() → Forbid()

                if (file == null || file.Length == 0)
                    return BadRequest("Fichier requis");

                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".mp4", ".webm" };
                var extension = Path.GetExtension(file.FileName).ToLower();
                
                if (!allowedExtensions.Contains(extension))
                    return BadRequest($"Format de fichier non autorisé. Formats acceptés: {string.Join(", ", allowedExtensions)}");

                if (file.Length > 10 * 1024 * 1024)
                    return BadRequest("Fichier trop volumineux (max 10MB)");

                var uploadsPath = Path.Combine(_environment.WebRootPath, "uploads", "shops", shopId.ToString(), "assets");
                Directory.CreateDirectory(uploadsPath);

                var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
                var filePath = Path.Combine(uploadsPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var asset = new Asset
                {
                    Name = Path.GetFileNameWithoutExtension(file.FileName),
                    Type = type ?? (extension == ".mp4" || extension == ".webm" ? "video" : "image"),
                    Category = category ?? "uploaded",
                    Url = $"/uploads/shops/{shopId}/assets/{fileName}",
                    ThumbnailUrl = extension == ".mp4" ? null : $"/uploads/shops/{shopId}/assets/{fileName}",
                    ShopId = shopId,
                    IsGlobal = false,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = userId
                };

                _context.Assets.Add(asset);
                await _context.SaveChangesAsync();

                return Ok(new {
                    asset.Id,
                    asset.Name,
                    asset.Type,
                    asset.Category,
                    asset.Url,
                    asset.ThumbnailUrl,
                    asset.CreatedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'upload de l'asset");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("assets")]
        public async Task<IActionResult> AddAsset(int shopId, [FromBody] CustomAssetDto dto)
        {
            var userId = GetUserId();
            if (!await IsOwner(shopId, userId))
                return Forbid();  // ⭐ Unauthorized() → Forbid()

            var asset = await _customizationService.AddAssetAsync(shopId, userId, dto);
            return CreatedAtAction(nameof(GetAssets), new { shopId }, asset);
        }

        [HttpPut("assets/{assetId}")]
        public async Task<IActionResult> UpdateAsset(int shopId, int assetId, [FromBody] CustomAssetDto dto)
        {
            var userId = GetUserId();
            if (!await IsOwner(shopId, userId))
                return Forbid();  // ⭐ Unauthorized() → Forbid()

            var asset = await _customizationService.UpdateAssetAsync(shopId, userId, assetId, dto);

            if (asset == null)
                return NotFound();

            return Ok(asset);
        }

        [HttpDelete("assets/{assetId}")]
        public async Task<IActionResult> DeleteAsset(int shopId, int assetId)
        {
            try
            {
                var userId = GetUserId();
                if (!await IsOwner(shopId, userId))
                    return Forbid();  // ⭐ Unauthorized() → Forbid()

                var asset = await _context.Assets
                    .FirstOrDefaultAsync(a => a.Id == assetId && a.ShopId == shopId);

                if (asset == null)
                    return NotFound(new { message = "Asset non trouvé" });

                var physicalPath = Path.Combine(_environment.WebRootPath, asset.Url.TrimStart('/'));
                if (System.IO.File.Exists(physicalPath))
                {
                    System.IO.File.Delete(physicalPath);
                }

                if (!string.IsNullOrEmpty(asset.ThumbnailUrl) && asset.ThumbnailUrl != asset.Url)
                {
                    var thumbnailPath = Path.Combine(_environment.WebRootPath, asset.ThumbnailUrl.TrimStart('/'));
                    if (System.IO.File.Exists(thumbnailPath))
                        System.IO.File.Delete(thumbnailPath);
                }

                _context.Assets.Remove(asset);
                await _context.SaveChangesAsync();

                return Ok(new { deleted = true, message = "Asset supprimé avec succès" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de l'asset");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPut("assets/{assetId}/rename")]
        public async Task<IActionResult> RenameAsset(int shopId, int assetId, [FromBody] RenameAssetDto dto)
        {
            try
            {
                var userId = GetUserId();
                if (!await IsOwner(shopId, userId))
                    return Forbid();  // ⭐ Unauthorized() → Forbid()

                var asset = await _context.Assets
                    .FirstOrDefaultAsync(a => a.Id == assetId && a.ShopId == shopId);

                if (asset == null)
                    return NotFound(new { message = "Asset non trouvé" });

                asset.Name = dto.Name;
                await _context.SaveChangesAsync();

                return Ok(new { asset.Id, asset.Name });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors du renommage de l'asset");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPut("products/{productId}")]
        public async Task<IActionResult> UpdateProductCustomization(int shopId, int productId, [FromBody] ShopProductCustomizationDto dto)
        {
            var userId = GetUserId();
            if (!await IsOwner(shopId, userId))
                return Forbid();  // ⭐ Unauthorized() → Forbid()
            
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
                return Forbid();  // ⭐ Unauthorized() → Forbid()

            var result = await _customizationService.ApplyTemplateAsync(shopId, userId, templateId, overrideExisting);
            return Ok(result);
        }

        [HttpPost("snapshots/{name}")]
        public async Task<IActionResult> SaveSnapshot(int shopId, string name)
        {
            var userId = GetUserId();
            if (!await IsOwner(shopId, userId))
                return Forbid();  // ⭐ Unauthorized() → Forbid()

            var result = await _customizationService.SaveSnapshotAsync(shopId, userId, name);
            return Ok(new { name, saved = true });
        }

        [HttpPost("snapshots/{name}/restore")]
        public async Task<IActionResult> RestoreSnapshot(int shopId, string name)
        {
            var userId = GetUserId();
            if (!await IsOwner(shopId, userId))
                return Forbid();  // ⭐ Unauthorized() → Forbid()

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
                return Forbid();  // ⭐ Unauthorized() → Forbid()

            var published = await _customizationService.PublishAsync(shopId, userId);
            return Ok(new { published });
        }

        [HttpPost("unpublish")]
        public async Task<IActionResult> Unpublish(int shopId)
        {
            var userId = GetUserId();
            if (!await IsOwner(shopId, userId))
                return Forbid();  // ⭐ Unauthorized() → Forbid()

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

        // ==================== BLOCKS ENDPOINTS ====================

        [HttpPost("blocks/init")]
        public async Task<IActionResult> InitDefaultBlocks(int shopId)
        {
            try
            {
                var userId = GetUserId();
                if (!await IsOwner(shopId, userId))
                    return Forbid();  // ⭐ Unauthorized() → Forbid()

                var customization = await _context.ShopCustomizations
                    .FirstOrDefaultAsync(c => c.ShopId == shopId);

                if (customization == null)
                {
                    customization = new ShopCustomization 
                    { 
                        ShopId = shopId,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.ShopCustomizations.Add(customization);
                }

                var blocks = GetDefaultBlocksWithFullPosition();
                customization.BlocksJson = JsonSerializer.Serialize(blocks);
                customization.UpdatedAt = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();
                
                return Ok(new { message = "Blocs initialisés avec succès", count = blocks.Count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'initialisation des blocs");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPut("blocks")]
        public async Task<IActionResult> UpdateBlocks(int shopId, [FromBody] List<BlockDto> blocks)
        {
            try
            {
                var userId = GetUserId();
                if (!await IsOwner(shopId, userId))
                    return Forbid();  // ⭐ Unauthorized() → Forbid()

                var customization = await _context.ShopCustomizations
                    .FirstOrDefaultAsync(c => c.ShopId == shopId);

                if (customization == null)
                {
                    customization = new ShopCustomization 
                    { 
                        ShopId = shopId,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.ShopCustomizations.Add(customization);
                }

                customization.BlocksJson = JsonSerializer.Serialize(blocks);
                customization.UpdatedAt = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();
                
                return Ok(new { message = "Blocs sauvegardés avec succès", count = blocks.Count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la sauvegarde des blocs");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("blocks")]
        public async Task<IActionResult> GetBlocks(int shopId)
        {
            var customization = await _context.ShopCustomizations
                .FirstOrDefaultAsync(c => c.ShopId == shopId);

            if (customization == null || string.IsNullOrEmpty(customization.BlocksJson))
            {
                var defaultBlocks = GetDefaultBlocksWithFullPosition();
                return Ok(defaultBlocks);
            }

            var blocks = JsonSerializer.Deserialize<List<BlockDto>>(customization.BlocksJson);
            return Ok(blocks ?? new List<BlockDto>());
        }

        // ==================== CANVAS FILTERS ENDPOINTS ====================

        [HttpGet("canvas-filters")]
        public async Task<IActionResult> GetCanvasFilters(int shopId)
        {
            var userId = GetUserId();
            if (!await IsOwner(shopId, userId))
                return Forbid();  // ⭐ Unauthorized() → Forbid()

            var customization = await _context.ShopCustomizations
                .FirstOrDefaultAsync(c => c.ShopId == shopId);

            if (customization == null)
            {
                return Ok(new { 
                    globalBrightness = 1, 
                    globalContrast = 1, 
                    globalSaturation = 1, 
                    globalBlur = 0, 
                    globalCssFilter = "none" 
                });
            }

            return Ok(new
            {
                globalBrightness = customization.CanvasBrightness,
                globalContrast = customization.CanvasContrast,
                globalSaturation = customization.CanvasSaturation,
                globalBlur = customization.CanvasBlur,
                globalCssFilter = customization.CanvasCssFilter ?? "none"
            });
        }

        [HttpPut("canvas-filters")]
        public async Task<IActionResult> UpdateCanvasFilters(int shopId, [FromBody] UpdateCanvasFiltersDto dto)
        {
            var userId = GetUserId();
            if (!await IsOwner(shopId, userId))
                return Forbid();  // ⭐ Unauthorized() → Forbid()

            var customization = await _context.ShopCustomizations
                .FirstOrDefaultAsync(c => c.ShopId == shopId);

            if (customization == null)
            {
                customization = new ShopCustomization 
                { 
                    ShopId = shopId, 
                    CreatedAt = DateTime.UtcNow 
                };
                _context.ShopCustomizations.Add(customization);
            }

            customization.CanvasBrightness = dto.GlobalBrightness;
            customization.CanvasContrast = dto.GlobalContrast;
            customization.CanvasSaturation = dto.GlobalSaturation;
            customization.CanvasBlur = dto.GlobalBlur;
            customization.CanvasCssFilter = dto.GlobalCssFilter ?? "none";
            customization.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Filtres du canvas mis à jour" });
        }

        // ==================== ENDPOINT PUBLIC (boutique) ====================
        // Aucune authentification : c'est cet endpoint que la boutique publique
        // doit appeler, jamais les endpoints /blocks, /background, /canvas-filters
        // ou /customization ci-dessus qui sont réservés au Studio (brouillon).

        [HttpGet("published")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublishedData(int shopId)
        {
            var customization = await _context.ShopCustomizations
                .FirstOrDefaultAsync(c => c.ShopId == shopId);

            var hasSnapshot = !string.IsNullOrEmpty(customization?.PublishedBlocksJson);

            if (!hasSnapshot)
            {
                // Jamais publiée : la boutique publique doit afficher un état "en préparation"
                return Ok(new
                {
                    isPublished = false,
                    publishedAt = (DateTime?)null,
                    blocks = new List<BlockDto>(),
                    background = new { backgroundColor = "#FFFFFF", backgroundType = "solid", backgroundValue = (string?)null, backgroundOpacity = 100 },
                    canvasFilters = new { globalBrightness = 1f, globalContrast = 1f, globalSaturation = 1f, globalBlur = 0f, globalCssFilter = "none" },
                    customization = (object?)null
                });
            }

            var blocks = JsonSerializer.Deserialize<List<BlockDto>>(customization!.PublishedBlocksJson!) ?? new List<BlockDto>();

            // ⭐ CORRECTION DE L'ERREUR CS0173
            object background;
            if (string.IsNullOrEmpty(customization.PublishedBackgroundJson))
            {
                background = new { backgroundColor = "#FFFFFF", backgroundType = "solid", backgroundValue = (string?)null, backgroundOpacity = 100 };
            }
            else
            {
                background = JsonSerializer.Deserialize<JsonElement>(customization.PublishedBackgroundJson);
            }

            // ⭐ CORRECTION DE L'ERREUR CS0173
            object canvasFilters;
            if (string.IsNullOrEmpty(customization.PublishedCanvasFiltersJson))
            {
                canvasFilters = new { globalBrightness = 1f, globalContrast = 1f, globalSaturation = 1f, globalBlur = 0f, globalCssFilter = "none" };
            }
            else
            {
                canvasFilters = JsonSerializer.Deserialize<JsonElement>(customization.PublishedCanvasFiltersJson);
            }

            object? customizationDto = null;
            if (!string.IsNullOrEmpty(customization.PublishedCustomizationJson))
            {
                customizationDto = JsonSerializer.Deserialize<JsonElement>(customization.PublishedCustomizationJson);
            }

            return Ok(new
            {
                isPublished = customization.IsPublished,
                publishedAt = customization.PublishedAt,
                blocks,
                background,
                canvasFilters,
                customization = customizationDto
            });
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

        private List<BlockDto> GetDefaultBlocksWithFullPosition()
        {
            var blocks = new List<BlockDto>();
            
            blocks.Add(new BlockDto
            {
                Id = Guid.NewGuid().ToString(),
                Type = "banner",
                Name = "Bannière principale",
                Order = 0,
                IsVisible = true,
                Position = new BlockPositionDto
                {
                    X = 0,
                    Y = 0,
                    Width = 1200,
                    Height = 400,
                    PositionType = "relative",
                    Alignment = "center"
                },
                Settings = new Dictionary<string, object>
                {
                    { "title", "Bienvenue dans ma boutique" },
                    { "subtitle", "Découvrez nos produits" },
                    { "buttonText", "Acheter maintenant" },
                    { "height", 400 },
                    { "overlayOpacity", 30 },
                    { "textPosition", "center" }
                }
            });
            
            blocks.Add(new BlockDto
            {
                Id = Guid.NewGuid().ToString(),
                Type = "logo",
                Name = "Logo",
                Order = 1,
                IsVisible = true,
                Position = new BlockPositionDto
                {
                    X = 20,
                    Y = 20,
                    Width = 80,
                    Height = 80,
                    PositionType = "absolute",
                    Alignment = "top-left",
                    ZIndex = 10
                },
                Settings = new Dictionary<string, object>
                {
                    { "imageUrl", "/uploads/default-logo.png" },
                    { "size", 80 },
                    { "shape", "rounded" }
                }
            });
            
            blocks.Add(new BlockDto
            {
                Id = Guid.NewGuid().ToString(),
                Type = "products",
                Name = "Nos produits",
                Order = 2,
                IsVisible = true,
                Position = new BlockPositionDto
                {
                    X = 0,
                    Y = 400,
                    Width = 1200,
                    Height = 500,
                    PositionType = "relative"
                },
                Settings = new Dictionary<string, object>
                {
                    { "title", "Nos produits vedettes" },
                    { "columns", 4 },
                    { "limit", 8 }
                }
            });
            
            blocks.Add(new BlockDto
            {
                Id = Guid.NewGuid().ToString(),
                Type = "text",
                Name = "Promotion",
                Order = 3,
                IsVisible = true,
                Position = new BlockPositionDto
                {
                    X = 50,
                    Y = 250,
                    Width = 400,
                    Height = 50,
                    PositionType = "absolute",
                    ZIndex = 5
                },
                Settings = new Dictionary<string, object>
                {
                    { "content", "🔥 PROMO -20% sur toute la boutique !" },
                    { "fontSize", 20 },
                    { "fontWeight", "bold" },
                    { "textColor", "#ffffff" },
                    { "backgroundColor", "#ff0000" },
                    { "borderRadius", 25 }
                }
            });
            
            blocks.Add(new BlockDto
            {
                Id = Guid.NewGuid().ToString(),
                Type = "button",
                Name = "Bouton CTA",
                Order = 4,
                IsVisible = true,
                Position = new BlockPositionDto
                {
                    X = 300,
                    Y = 320,
                    Width = 200,
                    Height = 45,
                    PositionType = "absolute",
                    ZIndex = 5
                },
                Settings = new Dictionary<string, object>
                {
                    { "text", "Voir les offres" },
                    { "backgroundColor", "#2563EB" },
                    { "textColor", "#FFFFFF" },
                    { "borderRadius", 25 },
                    { "linkUrl", "/promotions" }
                }
            });
            
            return blocks;
        }
    }
}