using ECommerceApi.Data;
using ECommerceApi.DTO;
using ECommerceApi.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace ECommerceApi.Services
{
    public class ShopCustomizationService : IShopCustomizationService
    {
        private readonly AppDbContext _context;
        private readonly IShopService _shopService;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<ShopCustomizationService> _logger;

        public ShopCustomizationService(
            AppDbContext context,
            IShopService shopService,
            IWebHostEnvironment environment,
            ILogger<ShopCustomizationService> logger)
        {
            _context = context;
            _shopService = shopService;
            _environment = environment;
            _logger = logger;
        }

        public async Task<ShopCustomization?> GetByShopIdAsync(int shopId)
        {
            return await _context.ShopCustomizations
                .FirstOrDefaultAsync(c => c.ShopId == shopId);
        }

        public async Task<ShopCustomization> CreateOrUpdateAsync(int shopId, int userId, ShopCustomizationDto dto)
        {
            var shop = await _shopService.GetShopByIdAsync(shopId);
            if (shop == null || shop.OwnerId != userId)
                throw new UnauthorizedAccessException("Vous n'êtes pas le propriétaire de cette boutique");

            var customization = await GetByShopIdAsync(shopId);

            if (customization == null)
            {
                customization = new ShopCustomization
                {
                    ShopId = shopId,
                    CreatedAt = DateTime.UtcNow,
                    Version = 1
                };
                _context.ShopCustomizations.Add(customization);
            }
            else
            {
                customization.Version++;
            }

            MapDtoToEntity(dto, customization);
            customization.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return customization;
        }

        public async Task<bool> DeleteCustomizationAsync(int shopId, int userId)
        {
            var shop = await _shopService.GetShopByIdAsync(shopId);
            if (shop == null || shop.OwnerId != userId)
                return false;
            
            var customization = await GetByShopIdAsync(shopId);
            if (customization == null)
                return false;
            
            _context.ShopCustomizations.Remove(customization);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<CustomSection> AddSectionAsync(int shopId, int userId, CustomSectionDto dto)
        {
            await VerifyOwnershipAsync(shopId, userId);

            var customization = await GetOrCreateCustomizationAsync(shopId);

            var section = new CustomSection
            {
                ShopCustomizationId = customization.Id,
                Type = dto.Type,
                Title = dto.Title,
                Subtitle = dto.Subtitle,
                Content = dto.Content,
                ImageUrl = dto.ImageUrl,
                BackgroundColor = dto.BackgroundColor,
                Order = customization.CustomSections.Count + 1,
                IsVisible = dto.IsVisible,
                SettingsJson = JsonSerializer.Serialize(dto.Settings)
            };

            _context.CustomSections.Add(section);
            await _context.SaveChangesAsync();

            return section;
        }

        public async Task<CustomSection?> UpdateSectionAsync(int shopId, int userId, int sectionId, CustomSectionDto dto)
        {
            await VerifyOwnershipAsync(shopId, userId);

            var section = await _context.CustomSections
                .Include(s => s.ShopCustomization)
                .FirstOrDefaultAsync(s => s.Id == sectionId && s.ShopCustomization.ShopId == shopId);

            if (section == null) return null;
            
            section.Type = dto.Type;
            section.Title = dto.Title;
            section.Subtitle = dto.Subtitle;
            section.Content = dto.Content;
            section.ImageUrl = dto.ImageUrl;
            section.BackgroundColor = dto.BackgroundColor;
            section.IsVisible = dto.IsVisible;
            section.SettingsJson = JsonSerializer.Serialize(dto.Settings);

            await _context.SaveChangesAsync();
            return section;
        }

        public async Task<bool> DeleteSectionAsync(int shopId, int userId, int sectionId)
        {
            await VerifyOwnershipAsync(shopId, userId);

            var section = await _context.CustomSections
                .Include(s => s.ShopCustomization)
                .FirstOrDefaultAsync(s => s.Id == sectionId && s.ShopCustomization.ShopId == shopId);
            
            if (section == null) return false;

            _context.CustomSections.Remove(section);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ReorderSectionsAsync(int shopId, int userId, List<int> sectionIds)
        {
            await VerifyOwnershipAsync(shopId, userId);

            var customization = await GetOrCreateCustomizationAsync(shopId);
            var sections = customization.CustomSections.ToList();

            for (int i = 0; i < sectionIds.Count; i++)
            {
                var section = sections.FirstOrDefault(s => s.Id == sectionIds[i]);
                if (section != null)
                {
                    section.Order = i + 1;
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<CustomAsset> AddAssetAsync(int shopId, int userId, CustomAssetDto dto)
        {
            await VerifyOwnershipAsync(shopId, userId);

            var customization = await GetOrCreateCustomizationAsync(shopId);

            var asset = new CustomAsset
            {
                ShopCustomizationId = customization.Id,
                Type = dto.Type,
                Name = dto.Name,
                Url = dto.Url,
                Content = dto.Content,
                PosX = dto.PosX,
                PosY = dto.PosY,
                Width = dto.Width,
                Height = dto.Height,
                Rotation = dto.Rotation,
                ZIndex = dto.ZIndex,
                Animation = dto.Animation,
                Duration = dto.Duration,
                Delay = dto.Delay,
                IsDraggable = dto.IsDraggable,
                IsResizable = dto.IsResizable,
                IsVisible = dto.IsVisible,
                LinkUrl = dto.LinkUrl,
                FontFamily = dto.FontFamily,
                FontSize = dto.FontSize,
                FontWeight = dto.FontWeight,
                TextAlign = dto.TextAlign,
                TextColor = dto.TextColor,
                TextShadow = dto.TextShadow,
                TextGradient = dto.TextGradient,
                TextStroke = dto.TextStroke,
                TextGlow = dto.TextGlow,
                LetterSpacing = dto.LetterSpacing,
                LineHeight = dto.LineHeight
            };
            
            _context.CustomAssets.Add(asset);
            await _context.SaveChangesAsync();

            return asset;
        }

        public async Task<CustomAsset?> UpdateAssetAsync(int shopId, int userId, int assetId, CustomAssetDto dto)
        {
            await VerifyOwnershipAsync(shopId, userId);

            var asset = await _context.CustomAssets
                .Include(a => a.ShopCustomization)
                .FirstOrDefaultAsync(a => a.Id == assetId && a.ShopCustomization.ShopId == shopId);
            
            if (asset == null) return null;

            asset.Type = dto.Type;
            asset.Name = dto.Name;
            asset.Url = dto.Url;
            asset.Content = dto.Content;
            asset.PosX = dto.PosX;
            asset.PosY = dto.PosY;
            asset.Width = dto.Width;
            asset.Height = dto.Height;
            asset.Rotation = dto.Rotation;
            asset.ZIndex = dto.ZIndex;
            asset.Animation = dto.Animation;
            asset.Duration = dto.Duration;
            asset.Delay = dto.Delay;
            asset.IsDraggable = dto.IsDraggable;
            asset.IsResizable = dto.IsResizable;
            asset.IsVisible = dto.IsVisible;
            asset.LinkUrl = dto.LinkUrl;
            asset.FontFamily = dto.FontFamily;
            asset.FontSize = dto.FontSize;
            asset.FontWeight = dto.FontWeight;
            asset.TextAlign = dto.TextAlign;
            asset.TextColor = dto.TextColor;
            asset.TextShadow = dto.TextShadow;
            asset.TextGradient = dto.TextGradient;
            asset.TextStroke = dto.TextStroke;
            asset.TextGlow = dto.TextGlow;
            asset.LetterSpacing = dto.LetterSpacing;
            asset.LineHeight = dto.LineHeight;

            await _context.SaveChangesAsync();
            return asset;
        }

        public async Task<bool> DeleteAssetAsync(int shopId, int userId, int assetId)
        {
            await VerifyOwnershipAsync(shopId, userId);

            var asset = await _context.CustomAssets
                .Include(a => a.ShopCustomization)
                .FirstOrDefaultAsync(a => a.Id == assetId && a.ShopCustomization.ShopId == shopId);

            if (asset == null) return false;

            _context.CustomAssets.Remove(asset);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<TemplateDto>> GetTemplatesAsync(string? category = null)
        {
            var query = _context.Templates.Where(t => t.IsActive);

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(t => t.Category == category);
            }

            return await query
                .OrderByDescending(t => t.UsageCount)
                .Select(t => new TemplateDto
                {
                    Id = t.Id,
                    Name = t.Name,
                    Description = t.Description,
                    Category = t.Category,
                    ThumbnailUrl = t.ThumbnailUrl,
                    PreviewUrl = t.PreviewUrl,
                    IsPremium = t.IsPremium,
                    Price = t.Price,
                    UsageCount = t.UsageCount
                })
                .ToListAsync();
        }

        public async Task<Template?> GetTemplateByIdAsync(int templateId)
        {
            return await _context.Templates.FindAsync(templateId);
        }

        public async Task<ShopCustomization> ApplyTemplateAsync(int shopId, int userId, int templateId, bool overrideExisting)
        {
            await VerifyOwnershipAsync(shopId, userId);

            var template = await GetTemplateByIdAsync(templateId);
            if (template == null)
                throw new ArgumentException("Template non trouvé");
            
            template.UsageCount++;

            var config = JsonSerializer.Deserialize<ShopCustomizationDto>(template.ConfigurationJson);

            if (config == null)
                throw new InvalidOperationException("Configuration du template invalide");
            
            var customization = await CreateOrUpdateAsync(shopId, userId, config);

            await _context.SaveChangesAsync();
            return customization;
        }
        
        public async Task<Template> CreateTemplateAsync(int userId, CreateTemplateDto dto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null || user.Role != "Admin")
                throw new UnauthorizedAccessException("Seuls les administrateurs peuvent créer des templates");

            var customization = await GetByShopIdAsync(dto.SourceShopId);
            if (customization == null)
                throw new ArgumentException("Aucune configuration trouvée pour cette boutique");

            var configDto = await GetCustomizationDtoFromEntityAsync(customization);
            var configJson = JsonSerializer.Serialize(configDto);

            var template = new Template
            {
                Name = dto.Name,
                Description = dto.Description,
                Category = dto.Category,
                ThumbnailUrl = dto.ThumbnailUrl,
                PreviewUrl = dto.PreviewUrl,
                ConfigurationJson = configJson,
                IsPremium = dto.IsPremium,
                Price = dto.Price,
                CreatedBy = user.Username,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _context.Templates.Add(template);
            await _context.SaveChangesAsync();

            return template;
        }

        public async Task<ShopProductCustomization> UpdateProductCustomizationAsync(int shopId, int userId, ShopProductCustomizationDto dto)
        {
            await VerifyOwnershipAsync(shopId, userId);

            var customization = await _context.ShopProductCustomizations
                .FirstOrDefaultAsync(p => p.ShopId == shopId && p.ProductId == dto.ProductId);
            
            if (customization == null)
            {
                customization = new ShopProductCustomization
                {
                    ShopId = shopId,
                    ProductId = dto.ProductId
                };
                _context.ShopProductCustomizations.Add(customization);
            }

            customization.ProductBackgroundType = dto.ProductBackgroundType;
            customization.ProductBackgroundValue = dto.ProductBackgroundValue;
            customization.ProductFrameStyle = dto.ProductFrameStyle;
            customization.ProductShadow = dto.ProductShadow;
            customization.ProductHoverEffect = dto.ProductHoverEffect;
            customization.IsFeatured = dto.IsFeatured;
            customization.FeaturedOrder = dto.FeaturedOrder;
            customization.CustomBadge = dto.CustomBadge;
            customization.CustomBadgeColor = dto.CustomBadgeColor;
            customization.ProductAnimation = dto.ProductAnimation;
            customization.AnimationDelay = dto.AnimationDelay;
            customization.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return customization;
        }

        public async Task<ShopProductCustomization?> GetProductCustomizationAsync(int shopId, int productId)
        {
            return await _context.ShopProductCustomizations
                .FirstOrDefaultAsync(p => p.ShopId == shopId && p.ProductId == productId);
        }

        public async Task<List<ShopProductCustomization>> GetFeaturedProductsAsync(int shopId, int limit = 10)
        {
            return await _context.ShopProductCustomizations
                .Where(p => p.ShopId == shopId && p.IsFeatured)
                .OrderBy(p => p.FeaturedOrder)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<ShopCustomization> SaveSnapshotAsync(int shopId, int userId, string snapshotName)
        {
            await VerifyOwnershipAsync(shopId, userId);

            var customization = await GetByShopIdAsync(shopId);
            if (customization == null)
                throw new ArgumentException("Aucune configuration trouvée pour cette boutique");

            var snapshot = new CustomizationSnapshot
            {
                ShopId = shopId,
                Name = snapshotName,
                ConfigurationJson = JsonSerializer.Serialize(await GetCustomizationDtoFromEntityAsync(customization)),
                CreatedAt = DateTime.UtcNow
            };

            _context.CustomizationSnapshots.Add(snapshot);
            await _context.SaveChangesAsync();

            return customization;
        }

        public async Task<ShopCustomization> RestoreSnapshotAsync(int shopId, int userId, string snapshotName)
        {
            await VerifyOwnershipAsync(shopId, userId);

            var snapshot = await _context.CustomizationSnapshots
                .FirstOrDefaultAsync(s => s.ShopId == shopId && s.Name == snapshotName);
            
            if (snapshot == null)
                throw new Exception("Snapshot non trouvé");

            var configDto = JsonSerializer.Deserialize<ShopCustomizationDto>(snapshot.ConfigurationJson);
            if (configDto == null)
                throw new Exception("Configuration invalide");

            var customization = await CreateOrUpdateAsync(shopId, userId, configDto);
            return customization;
        }

        public async Task<List<CustomizationSnapshot>> GetSnapshotsAsync(int shopId)
        {
            return await _context.CustomizationSnapshots
                .Where(s => s.ShopId == shopId)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
        }

        // ⭐⭐⭐ PUBLISH / UNPUBLISH MODIFIÉS ⭐⭐⭐

        public async Task<bool> PublishAsync(int shopId, int userId)
        {
            await VerifyOwnershipAsync(shopId, userId);

            var customization = await GetByShopIdAsync(shopId);
            if (customization == null)
                return false;

            // ⭐ Copie intégrale du brouillon vers le snapshot publié
            customization.PublishedBlocksJson = customization.BlocksJson;

            customization.PublishedBackgroundJson = JsonSerializer.Serialize(new
            {
                backgroundColor = customization.BackgroundColor ?? "#FFFFFF",
                backgroundType = customization.BackgroundType ?? "solid",
                backgroundValue = customization.BackgroundValue,
                backgroundOpacity = customization.BackgroundOpacity ?? 100
            });

            customization.PublishedCanvasFiltersJson = JsonSerializer.Serialize(new
            {
                globalBrightness = customization.CanvasBrightness,
                globalContrast = customization.CanvasContrast,
                globalSaturation = customization.CanvasSaturation,
                globalBlur = customization.CanvasBlur,
                globalCssFilter = customization.CanvasCssFilter ?? "none"
            });

            // Réutilise la méthode privée existante qui construit déjà le DTO complet
            var fullDto = await GetCustomizationDtoFromEntityAsync(customization);
            customization.PublishedCustomizationJson = JsonSerializer.Serialize(fullDto);

            customization.IsPublished = true;
            customization.PublishedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UnpublishAsync(int shopId, int userId)
        {
            await VerifyOwnershipAsync(shopId, userId);

            var customization = await GetByShopIdAsync(shopId);
            if (customization == null)
                return false;

            // ⭐ On ne touche PAS au snapshot publié : les visiteurs continuent
            // de voir la dernière version publiée. IsPublished sert uniquement
            // d'indicateur dans le Studio (ex: badge "modifications non publiées").
            customization.IsPublished = false;
            customization.UnpublishedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<AssetDto>> GetAvailableAssetsAsync(string type, string? category = null)
        {
            var query = _context.Assets.Where(a => a.Type == type && a.IsActive);

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(a => a.Category == category);
            }

            return await query
                .OrderByDescending(a => a.UsageCount)
                .Select(a => new AssetDto
                {
                    Id = a.Id,
                    Name = a.Name,
                    Type = a.Type,
                    Category = a.Category,
                    Url = a.Url,
                    ThumbnailUrl = a.ThumbnailUrl,
                    PreviewUrl = a.PreviewUrl,
                    IsPremium = a.IsPremium,
                    Price = a.Price,
                    UsageCount = a.UsageCount
                })
                .ToListAsync();
        }

        public async Task<Asset> AddAssetToMarketplaceAsync(int userId, AddAssetDto dto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null || user.Role != "Admin")
                throw new UnauthorizedAccessException("Seuls les administrateurs peuvent ajouter des assets au marketplace");
            
            string? fileUrl = null;

            if (dto.File != null)
            {
                var uploadsPath = Path.Combine(_environment.WebRootPath, "uploads", "assets", dto.Type);
                Directory.CreateDirectory(uploadsPath);

                var fileName = $"{dto.Type}_{Guid.NewGuid()}{Path.GetExtension(dto.File.FileName)}";
                var filePath = Path.Combine(uploadsPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.File.CopyToAsync(stream);
                }

                fileUrl = $"/uploads/assets/{dto.Type}/{fileName}";
            }

            var asset = new Asset
            {
                Name = dto.Name,
                Type = dto.Type,
                Category = dto.Category,
                Url = dto.Url ?? fileUrl ?? "",
                ThumbnailUrl = fileUrl,
                IsPremium = dto.IsPremium,
                Price = dto.Price,
                License = dto.License,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };
            
            _context.Assets.Add(asset);
            await _context.SaveChangesAsync();
            
            return asset;
        }

        public async Task<string> GeneratePreviewHtmlAsync(int shopId)
        {
            var customization = await GetByShopIdAsync(shopId);
            if (customization == null)
                return "<html><body>Aucune configuration trouvée</body></html>";
            
            var html = $@"
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{
                        font-family: '{customization.PrimaryFont ?? "Inter"}', sans-serif;
                        background-color: {customization.BackgroundValue ?? "#ffffff"};
                        color: {customization.TextColor ?? "#1F2937"};
                        margin: 0;
                        padding: 20px;
                        }}
                        .preview-container {{
                            max-width: 1200px;
                            margin: 0 auto;
                        }}
                        .shop-name {{
                            color: {customization.PrimaryColor ?? "#2563EB"};
                            font-size: 2rem;
                        }}
                </style>
            </head>
            <body>
                <div class='preview-container'>
                    <h1 class='shop-name'>Aperçu de votre boutique</h1>
                    <p>Configuration: {customization.LayoutType ?? "full-width"} | Filtres: {(customization.FiltersEnabled ? "Activés" : "Désactivés")}</p>
                </div>
            </body>
            </html>";

            return await Task.FromResult(html);
        }

        public async Task<string> GeneratePreviewScreenshotAsync(int shopId)
        {
            return await Task.FromResult($"/api/shops/{shopId}/customization/preview/html");
        }

        public async Task<ShopCustomizationStatsDto> GetCustomizationStatsAsync(int shopId)
        {
            var customization = await GetByShopIdAsync(shopId);

            return new ShopCustomizationStatsDto
            {
                SectionsCount = customization?.CustomSections?.Count ?? 0,
                AssetsCount = customization?.CustomAssets?.Count ?? 0,
                FiltersCount = customization?.ImageFilters?.Count ?? 0,
                IsPublished = customization?.IsPublished ?? false,
                LastModified = customization?.UpdatedAt ?? DateTime.UtcNow,
                Version = customization?.Version ?? 1,
                TotalViews = 0,
                TotalEdits = customization?.Version ?? 1
            };
        }

        // ==================== MÉTHODES PRIVÉES ====================

        private async Task VerifyOwnershipAsync(int shopId, int userId)
        {
            var shop = await _shopService.GetShopByIdAsync(shopId);
            if (shop == null || shop.OwnerId != userId)
                throw new UnauthorizedAccessException("Vous n'êtes pas le propriétaire de cette boutique");
        }

        private async Task<ShopCustomization> GetOrCreateCustomizationAsync(int shopId)
        {
            var customization = await GetByShopIdAsync(shopId);
            if (customization == null)
            {
                customization = new ShopCustomization
                {
                    ShopId = shopId,
                    CreatedAt = DateTime.UtcNow,
                    Version = 1
                };
                _context.ShopCustomizations.Add(customization);
                await _context.SaveChangesAsync();
            }

            return customization;
        }

        private void MapDtoToEntity(ShopCustomizationDto dto, ShopCustomization entity)
        {
            entity.LayoutType = dto.LayoutType;
            entity.HeaderStyle = dto.HeaderStyle;
            entity.ProductDisplayStyle = dto.ProductDisplayStyle;
            entity.BackgroundType = dto.BackgroundType;
            entity.BackgroundValue = dto.BackgroundValue;
            entity.BackgroundPosition = dto.BackgroundPosition;
            entity.BackgroundRepeat = dto.BackgroundRepeat;
            entity.BackgroundSize = dto.BackgroundSize;
            entity.BackgroundFixed = dto.BackgroundFixed;
            entity.PrimaryColor = dto.PrimaryColor;
            entity.SecondaryColor = dto.SecondaryColor;
            entity.AccentColor = dto.AccentColor;
            entity.TextColor = dto.TextColor;
            entity.Enable3DEffect = dto.Enable3DEffect;
            entity.AnimationEffect = dto.AnimationEffect;
            entity.HoverEffect = dto.HoverEffect;
            entity.PageTransition = dto.PageTransition;
            entity.PrimaryFont = dto.PrimaryFont;
            entity.SecondaryFont = dto.SecondaryFont;
            entity.HeadingFont = dto.HeadingFont;
            entity.BodyFont = dto.BodyFont;
            entity.AccentFont = dto.AccentFont;
            entity.HeadingSizeH1 = dto.HeadingSizeH1;
            entity.HeadingSizeH2 = dto.HeadingSizeH2;
            entity.HeadingSizeH3 = dto.HeadingSizeH3;
            entity.BodySize = dto.BodySize;
            entity.HeadingWeight = dto.HeadingWeight;
            entity.BodyWeight = dto.BodyWeight;
            entity.TextShadow = dto.TextShadow;
            entity.TextGradient = dto.TextGradient;
            entity.TextStroke = dto.TextStroke;
            entity.TextGlow = dto.TextGlow;
            entity.TextAnimation = dto.TextAnimation;
            entity.CustomCss = dto.CustomCss;
            entity.CustomJs = dto.CustomJs;
            entity.FiltersEnabled = dto.FiltersEnabled;
            entity.ActiveShopFilterId = dto.ActiveShopFilterId;
            entity.ShowFilterPanel = dto.ShowFilterPanel;
            entity.DefaultImageFilter = dto.DefaultImageFilter;
        }

        private async Task<string> SerializeCustomizationAsync(ShopCustomization customization)
        {
            var dto = await GetCustomizationDtoFromEntityAsync(customization);
            return JsonSerializer.Serialize(dto);
        }

        private async Task<ShopCustomizationDto> GetCustomizationDtoFromEntityAsync(ShopCustomization entity)
        {
            return new ShopCustomizationDto
            {
                LayoutType = entity.LayoutType,
                HeaderStyle = entity.HeaderStyle,
                ProductDisplayStyle = entity.ProductDisplayStyle,
                BackgroundType = entity.BackgroundType,
                BackgroundValue = entity.BackgroundValue,
                BackgroundPosition = entity.BackgroundPosition,
                BackgroundRepeat = entity.BackgroundRepeat,
                BackgroundSize = entity.BackgroundSize,
                BackgroundFixed = entity.BackgroundFixed,
                PrimaryColor = entity.PrimaryColor,
                SecondaryColor = entity.SecondaryColor,
                AccentColor = entity.AccentColor,
                TextColor = entity.TextColor,
                Enable3DEffect = entity.Enable3DEffect,
                AnimationEffect = entity.AnimationEffect,
                HoverEffect = entity.HoverEffect,
                PageTransition = entity.PageTransition,
                PrimaryFont = entity.PrimaryFont,
                SecondaryFont = entity.SecondaryFont,
                HeadingFont = entity.HeadingFont,
                BodyFont = entity.BodyFont,
                AccentFont = entity.AccentFont,
                HeadingSizeH1 = entity.HeadingSizeH1,
                HeadingSizeH2 = entity.HeadingSizeH2,
                HeadingSizeH3 = entity.HeadingSizeH3,
                BodySize = entity.BodySize,
                HeadingWeight = entity.HeadingWeight,
                BodyWeight = entity.BodyWeight,
                TextShadow = entity.TextShadow,
                TextGradient = entity.TextGradient,
                TextStroke = entity.TextStroke,
                TextGlow = entity.TextGlow,
                TextAnimation = entity.TextAnimation,
                CustomCss = entity.CustomCss,
                CustomJs = entity.CustomJs,
                FiltersEnabled = entity.FiltersEnabled,
                ActiveShopFilterId = entity.ActiveShopFilterId,
                ShowFilterPanel = entity.ShowFilterPanel,
                DefaultImageFilter = entity.DefaultImageFilter,
                ImageFilterIds = entity.ImageFilters?.Select(f => f.Id).ToList() ?? new(),
                CustomSections = entity.CustomSections?.Select(s => new CustomSectionDto
                {
                    Id = s.Id,
                    Type = s.Type,
                    Title = s.Title,
                    Subtitle = s.Subtitle,
                    Content = s.Content,
                    ImageUrl = s.ImageUrl,
                    BackgroundColor = s.BackgroundColor,
                    Order = s.Order,
                    IsVisible = s.IsVisible,
                    Settings = JsonSerializer.Deserialize<Dictionary<string, object>>(s.SettingsJson ?? "{}") ?? new()
                }).ToList() ?? new(),
                CustomAssets = entity.CustomAssets?.Select(a => new CustomAssetDto
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
                }).ToList() ?? new()
            };
        }
    }
}