using ECommerceApi.Data;
using ECommerceApi.DTO;
using ECommerceApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ECommerceApi.Services
{
    public class FilterService : IFilterService
    {
        private readonly AppDbContext _context;
        private readonly IShopService _shopService;
        private readonly ILogger<FilterService> _logger;

        public FilterService(
            AppDbContext context,
            IShopService shopService,
            ILogger<FilterService> logger)
        {
            _context = context;
            _shopService = shopService;
            _logger = logger;
        }

        public async Task<ShopFilter?> GetShopFilterAsync(int shopId)
        {
            return await _context.ShopFilters
                .FirstOrDefaultAsync(f => f.ShopId == shopId && f.IsActive);
        }

        public async Task<ShopFilter> UpdateShopFilterAsync(int shopId, int userId, ShopFilterDto dto)
        {
            var shop = await _shopService.GetShopByIdAsync(shopId);
            if (shop == null || shop.OwnerId != userId)
                throw new UnauthorizedAccessException("You do not have permission to update this shop's filters.");

            var filter = await GetShopFilterAsync(shopId);

            if (filter == null)
            {
                filter = new ShopFilter { ShopId = shopId };
                _context.ShopFilters.Add(filter);
            }

            filter.GlobalFilter = dto.GlobalFilter;
            filter.GlobalCssFilter = dto.GlobalCssFilter;
            filter.GlobalBrightness = dto.GlobalBrightness;
            filter.GlobalContrast = dto.GlobalContrast;
            filter.GlobalSaturation = dto.GlobalSaturation;
            filter.BackgroundFilter = dto.BackgroundFilter;
            filter.BackgroundBlur = dto.BackgroundBlur;
            filter.BackgroundDarken = dto.BackgroundDarken;
            filter.SeasonalEffect = dto.SeasonalEffect;
            filter.SeasonalEffectStart = dto.SeasonalEffectStart;
            filter.SeasonalEffectEnd = dto.SeasonalEffectEnd;
            filter.EnableFilterAnimation = dto.EnableFilterAnimation;
            filter.FilterAnimation = dto.FilterAnimation;
            filter.AnimationDuration = dto.AnimationDuration;
            filter.UpdatedAt = DateTime.UtcNow;
            filter.IsActive = true;

            await _context.SaveChangesAsync();
            return filter;
        }

        public async Task<List<ImageFilter>> GetImageFiltersAsync(int shopId)
        {
            var customization = await _context.ShopCustomizations
                .Include(c => c.ImageFilters)
                .FirstOrDefaultAsync(c => c.ShopId == shopId);

            return customization?.ImageFilters ?? new List<ImageFilter>();
        }

        public async Task<ImageFilter> AddImageFilterAsync(int shopId, int userId, ImageFilterDto dto)
        {
            var shop = await _shopService.GetShopByIdAsync(shopId);
            if (shop == null || shop.OwnerId != userId)
                throw new UnauthorizedAccessException();
            
            var customization = await _context.ShopCustomizations
                .FirstOrDefaultAsync(c => c.ShopId == shopId);
            
            if (customization == null)
            {
                customization = new ShopCustomization { ShopId = shopId, CreatedAt = DateTime.UtcNow };
                _context.ShopCustomizations.Add(customization);
                await _context.SaveChangesAsync();
            };

            var filter = new ImageFilter
            {
                ShopCustomizationId = customization.Id,
                FilterType = dto.FilterType,
                CssFilter = dto.CssFilter,
                Brightness = dto.Brightness,
                Contrast = dto.Contrast,
                Saturation = dto.Saturation,
                HueRotate = dto.HueRotate,
                Blur = dto.Blur,
                Grayscale = dto.Grayscale,
                Sepia = dto.Sepia,
                Opacity = dto.Opacity,
                Invert = dto.Invert,
                PresetName = dto.PresetName,
                Target = dto.Target,
                Order = dto.Order,
                CreatedAt = DateTime.UtcNow
            };

            _context.ImageFilters.Add(filter);
            await _context.SaveChangesAsync();

            return filter;
        }

        public async Task<ImageFilter?> UpdateImageFilterAsync(int shopId, int userId, int filterId, ImageFilterDto dto)
        {
            var shop = await _shopService.GetShopByIdAsync(shopId);
            if (shop == null || shop.OwnerId != userId)
                throw new UnauthorizedAccessException();
            
            var filter = await _context.ImageFilters
                .Include(f => f.ShopCustomization)
                .FirstOrDefaultAsync(f => f.Id == filterId && f.ShopCustomization.ShopId == shopId);

            if (filter == null)
                return null;

            filter.FilterType = dto.FilterType;
            filter.CssFilter = dto.CssFilter;
            filter.Brightness = dto.Brightness;
            filter.Contrast = dto.Contrast;
            filter.Saturation = dto.Saturation;
            filter.HueRotate = dto.HueRotate;
            filter.Blur = dto.Blur;
            filter.Grayscale = dto.Grayscale;
            filter.Sepia = dto.Sepia;
            filter.Opacity = dto.Opacity;
            filter.Invert = dto.Invert;
            filter.PresetName = dto.PresetName;
            filter.Target = dto.Target;
            filter.Order = dto.Order;

            await _context.SaveChangesAsync();
            return filter;
        }

        public async Task<bool> DeleteImageFilterAsync(int shopId, int userId, int filterId)
        {
            var shop = await _shopService.GetShopByIdAsync(shopId);
            if (shop == null || shop.OwnerId != userId)
                return false;
            
            var filter = await _context.ImageFilters
                .Include(f => f.ShopCustomization)
                .FirstOrDefaultAsync(f => f.Id == filterId && f.ShopCustomization.ShopId == shopId);

            if (filter == null)
                return false;

            _context.ImageFilters.Remove(filter);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<ProductImageFilter?> GetProductImageFilterAsync(int shopId, int productId, int imageIndex = 1)
        {
            return await _context.ProductImageFilters
                .FirstOrDefaultAsync(f => f.ShopId == shopId && f.ProductId == productId && f.ImageIndex == imageIndex);
        }

        public async Task<ProductImageFilter> UpdateProductImageFilterAsync(int shopId, int userId, ProductImageFilterDto dto)
        {
            var shop = await _shopService.GetShopByIdAsync(shopId);
            if (shop == null || shop.OwnerId != userId)
                throw new UnauthorizedAccessException();

            var filter = await GetProductImageFilterAsync(shopId, dto.ProductId, dto.ImageIndex);

            if (filter == null)
            {
                filter = new ProductImageFilter
                {
                    ShopId = shopId,
                    ProductId = dto.ProductId,
                    ImageIndex = dto.ImageIndex
                };
                _context.ProductImageFilters.Add(filter);
            }

            filter.FilterType = dto.FilterType;
            filter.CssFilter = dto.CssFilter;
            filter.Brightness = dto.Brightness;
            filter.Contrast = dto.Contrast;
            filter.Saturation = dto.Saturation;
            filter.HueRotate = dto.HueRotate;
            filter.Blur = dto.Blur;
            filter.Grayscale = dto.Grayscale;
            filter.Sepia = dto.Sepia;
            filter.Opacity = dto.Opacity;
            filter.OverlayType = dto.OverlayType;
            filter.OverlayColor = dto.OverlayColor;
            filter.OverlayOpacity = dto.OverlayOpacity;
            filter.EnableGlow = dto.EnableGlow;
            filter.GlowColor = dto.GlowColor;
            filter.EnableShadow = dto.EnableShadow;
            filter.ShadowColor = dto.ShadowColor;
            filter.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return filter;
        }

        public async Task<bool> RemoveProductImageFilterAsync(int shopId, int userId, int productId)
        {
            var shop = await _shopService.GetShopByIdAsync(shopId);
            if (shop == null || shop.OwnerId != userId)
                return false;

            var filters = await _context.ProductImageFilters
                .Where(f => f.ShopId == shopId && f.ProductId == productId)
                .ToListAsync();

            _context.ProductImageFilters.RemoveRange(filters);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<FilterPresetDto>> GetFilterPresetsAsync(string? category = null)
        {
            var presets = new List<FilterPresetDto>
            {
                new() {
                    Id = "none",
                    Name = "Normal",
                    Description = "Aucun filtre",
                    CssFilter = "none",
                    ThumbnailUrl = "/images/filters/normal.jpg"
                },

                new() {
                    Id = "vintage",
                    Name = "Vintage",
                    Description = "Style rétro",
                    CssFilter = "sepia(0.5) contrast(1.2) brightness(0.9)",
                    ThumbnailUrl = "/images/filters/vintage.jpg"
                },

                new() {
                    Id = "black-white",
                    Name = "Noir & Blanc",
                    Description = "Grayscale",
                    CssFilter = "grayscale(1)",
                    ThumbnailUrl = "/images/filters/black-white.jpg"
                },

                new() {
                    Id = "sepia",
                    Name = "Sépia",
                    Description = "Teint chaude",
                    CssFilter = "sepia(1)",
                    ThumbnailUrl = "/images/filters/sepia.jpg"
                },

                new() {
                    Id = "clarendon",
                    Name = "Clarendon",
                    Description = "Luminosité et contrasté",
                    CssFilter = "brightness(1.1) contrast(1.2) saturate(1.3)",
                    ThumbnailUrl = "/images/filters/clarendon.jpg"
                },

                new() {
                    Id = "gingham",
                    Name = "Gingham",
                    Description = "Doux et romantique",
                    CssFilter = "brightness(1.05) contrast(0.9) saturate(0.1) sepia(0.1)",
                    ThumbnailUrl = "/images/filters/gingham.jpg"
                },

                new() {
                    Id = "moon",
                    Name = "Moon",
                    Description = "Atmosphèrique",
                    CssFilter = "brightness(0.9) contrast(1.1) grayscale(0.3)",
                    ThumbnailUrl = "/images/filters/moon.jpg"
                },

                new() {
                    Id = "lark",
                    Name = "Lark",
                    Description = "vert et lumineux",
                    CssFilter = "brightness(1.1) contrast(0.9) saturate(1.1) hue-rotate(-10deg)",
                    ThumbnailUrl = "/images/filters/lark.jpg"
                },

                new() {
                    Id = "reyes",
                    Name = "Reyes",
                    Description = "Pastel chaud",
                    CssFilter = "brightness(0.95) contrast(0.85) saturate(0.9) sepia(0.1)",
                    ThumbnailUrl = "/images/filters/reyes.jpg"
                },

                new() {
                    Id = "juno",
                    Name = "Juno",
                    Description = "Froid et doux",
                    CssFilter = "brightness(1.05) contrast(1.1) saturate(0.9) hue-rotate(-15deg)",
                    ThumbnailUrl = "/images/filters/juno.jpg"
                },

                new() {
                    Id = "vivid",
                    Name = "Vif",
                    Description = "Couleurs intenses",
                    CssFilter = "brightness(0.95) contrast(1.05) saturate(1.5)",
                    ThumbnailUrl = "/images/filters/vivid.jpg"
                },

                new() {
                    Id = "cool",
                    Name = "Frais",
                    Description = "Teintes bleutées",
                    CssFilter = "brightness(0.95) contrast(1.05) saturate(0.9) hue-rotate(10deg)",
                    ThumbnailUrl = "/images/filters/cool.jpg"
                },

                new() { 
                    Id = "warm",
                    Name = "Chaud",
                    Description = "Teintes dorées",
                    CssFilter = "brightness(1.05) contrast(0.95) saturate(1.1) hue-rotate(-10deg)",
                    ThumbnailUrl = "/images/filters/warm.jpg"
                },

                new() {
                    Id = "dramatic",
                    Name = "Dramatique",
                    Description = "Contraste fort",
                    CssFilter = "brightness(0.9) contrast(1.3) saturate(1.2)",
                    ThumbnailUrl = "/images/filters/dramatic.jpg"
                },

                new() {
                    Id = "glow",
                    Name = "Glow",
                    Description = "Lueur néon",
                    CssFilter = "brightness(1.1) contrast(0.9) saturate(1.4) blur(0.5px)",
                    ThumbnailUrl = "/images/filters/glow.jpg"
                },

                new() {
                    Id = "soft",
                    Name = "Doux",
                    Description = "Flou artistique",
                    CssFilter = "brightness(1.02) contrast(0.95) blur(1px)",
                    ThumbnailUrl = "/images/filters/soft.jpg"
                },

                new() {
                    Id = "retro",
                    Name = "Rétro",
                    Description = "Style années 70",
                    CssFilter = "sepia(0.4) saturate(0.8) hue-rotate(-20deg)",
                    ThumbnailUrl = "/images/filters/retro.jpg"
                },

                new() {
                    Id = "dreamy",
                    Name = "Rêveur",
                    Description = "Atmosphère onirique",
                    CssFilter = "brightness(1.05) contrast(0.85) saturate(0.7) blur(0.5px)",
                    ThumbnailUrl = "/images/filters/dreamy.jpg"
                }
            };

            if (!string.IsNullOrEmpty(category))
            {
                // Filtrer les presets par catégorie si nécessaire
                // (ex: "vintage", "bright", "dark", etc.)
                presets = presets.Where(p => p.Category == category).ToList();
            }

            return await Task.FromResult(presets);
        }

        public async Task<FilterPresetDto?> GetFilterPresetByIdAsync(string presetId)
        {
            var presets = await GetFilterPresetsAsync();
            return presets.FirstOrDefault(p => p.Id == presetId);
        }

        public async Task<FilterPresetDto?> GetFilterPresetAsync(string presetId)
        {
            var presets = await GetFilterPresetsAsync();
            return presets.FirstOrDefault(p => p.Id == presetId);
        }

        public async Task<ShopFilter> ApplySeasonalEffectAsync(int shopId, int userId, string effect)
        {
            var shop = await _shopService.GetShopByIdAsync(shopId);
            if (shop == null || shop.OwnerId != userId)
                throw new UnauthorizedAccessException();
            
            var filter = await GetShopFilterAsync(shopId) ?? new ShopFilter { ShopId = shopId };

            var seasonalConfig = effect.ToLower() switch
            {
                "christmas" => new { 
                    Filter = "brightness(1.05) saturate(1.1) hue-rotate(-5deg)", 
                    Start = new DateTime(DateTime.UtcNow.Year, 12, 1), 
                    End = new DateTime(DateTime.UtcNow.Year, 12, 31) 
                },

                "halloween" => new { 
                    Filter = "sepia(0.3) saturate(0.8) brightness(0.85)", 
                    Start = new DateTime(DateTime.UtcNow.Year, 10, 1), 
                    End = new DateTime(DateTime.UtcNow.Year, 10, 31)
                },

                "spring" => new {
                    Filter = "brightness(1.05) saturate(1.15) hue-rotate(5deg)",
                    Start = new DateTime(DateTime.UtcNow.Year, 3, 1),
                    End = new DateTime(DateTime.UtcNow.Year, 5, 31)
                },

                "summer" => new {
                    Filter = "brightness(1.1) saturate(1.2) hue-rotate(-5deg)",
                    Start = new DateTime(DateTime.UtcNow.Year, 6, 1),
                    End = new DateTime(DateTime.UtcNow.Year, 8, 31)
                },

                "autumn" => new {
                    Filter = "sepia(0.2) saturate(1.1) hue-rotate(-15deg)",
                    Start = new DateTime(DateTime.UtcNow.Year, 9, 1),
                    End = new DateTime(DateTime.UtcNow.Year, 11, 30)
                },

                "winter" => new {
                    Filter = "grayscale(0.15) brightness(0.95) hue-rotate(10deg)",
                    Start = new DateTime(DateTime.UtcNow.Year, 12, 1),
                    End = new DateTime(DateTime.UtcNow.Year + 1, 2, 28)
                },

                _ => throw new ArgumentException($"Unknown seasonal effect: {effect}")
            };

            filter.SeasonalEffect = effect;
            filter.SeasonalEffectStart = seasonalConfig.Start;
            filter.SeasonalEffectEnd = seasonalConfig.End;
            filter.GlobalCssFilter = seasonalConfig.Filter;
            filter.UpdatedAt = DateTime.UtcNow;
            filter.IsActive = true;

            if (filter.Id == 0)
                _context.ShopFilters.Add(filter);
            
            await _context.SaveChangesAsync();
            return filter;
        }

        public async Task<bool> RemoveSeasonalEffectAsync(int shopId, int userId)
        {
            var shop = await _shopService.GetShopByIdAsync(shopId);
            if (shop == null || shop.OwnerId != userId)
                return false;
            
            var filter = await GetShopFilterAsync(shopId);
            if (filter == null)
                return false;

            filter.SeasonalEffect = null;
            filter.SeasonalEffectStart = null;
            filter.SeasonalEffectEnd = null;
            filter.GlobalCssFilter = "none";
            filter.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}