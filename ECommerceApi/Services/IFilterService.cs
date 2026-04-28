using ECommerceApi.DTO;
using ECommerceApi.Models;

namespace ECommerceApi.Services
{
    public interface IFilterService
    {
        Task<ShopFilter?> GetShopFilterAsync(int shopId);
        Task<ShopFilter> UpdateShopFilterAsync(int shopId, int userId, ShopFilterDto dto);

        Task<List<ImageFilter>> GetImageFiltersAsync(int shopId);
        Task<ImageFilter> AddImageFilterAsync(int shopId, int userId, ImageFilterDto dto);
        Task<ImageFilter?> UpdateImageFilterAsync(int shopId, int userId, int filterId, ImageFilterDto dto);
        Task<bool> DeleteImageFilterAsync(int shopId, int userId, int filterId);
        
        Task<ProductImageFilter?> GetProductImageFilterAsync(int shopId, int productId, int imageIndex = 1);
        Task<ProductImageFilter> UpdateProductImageFilterAsync(int shopId, int userId, ProductImageFilterDto dto);
        Task<bool> RemoveProductImageFilterAsync(int shopId, int userId, int productId);

        Task<List<FilterPresetDto>> GetFilterPresetsAsync(string? category = null);
        Task<FilterPresetDto?> GetFilterPresetAsync(string presetId);
        Task<FilterPresetDto?> GetFilterPresetByIdAsync(string presetId);

        Task<ShopFilter> ApplySeasonalEffectAsync(int shopId, int userId, string effect);
        Task<bool> RemoveSeasonalEffectAsync(int shopId, int userId);
    }
}