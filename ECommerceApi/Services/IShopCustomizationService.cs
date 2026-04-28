using ECommerceApi.DTO;
using ECommerceApi.Models;

namespace ECommerceApi.Services
{
    public interface IShopCustomizationService
    {
        Task<ShopCustomization?> GetByShopIdAsync(int shopId);
        Task<ShopCustomization> CreateOrUpdateAsync(int shopId, int userId, ShopCustomizationDto dto);
        Task<bool> DeleteCustomizationAsync(int shopId, int userId);

        Task<CustomSection> AddSectionAsync(int shopId, int userId, CustomSectionDto dto);
        Task<CustomSection?> UpdateSectionAsync(int shopId, int userId, int sectionId, CustomSectionDto dto);
        Task<bool> DeleteSectionAsync(int shopId, int userId, int sectionId);
        Task<bool> ReorderSectionsAsync(int shopId, int userId, List<int> sectionIds);

        Task<CustomAsset> AddAssetAsync(int shopId, int userId, CustomAssetDto dto);
        Task<CustomAsset?> UpdateAssetAsync(int shopId, int userId, int assetId, CustomAssetDto dto);
        Task<bool> DeleteAssetAsync(int shopId, int userId, int assetId);

        Task<List<TemplateDto>> GetTemplatesAsync(string? category = null);
        Task<Template?> GetTemplateByIdAsync(int templateId);
        Task<ShopCustomization> ApplyTemplateAsync(int shopId, int userId, int templateId, bool overrideExisting);
        Task<Template> CreateTemplateAsync(int userId, CreateTemplateDto dto);

        Task<ShopProductCustomization> UpdateProductCustomizationAsync(int shopId, int userId, ShopProductCustomizationDto dto);
        Task<ShopProductCustomization?> GetProductCustomizationAsync(int shopId, int productId);
        Task<List<ShopProductCustomization>> GetFeaturedProductsAsync(int shopId, int limit = 10);
        Task<ShopCustomization> SaveSnapshotAsync(int shopId, int userId, string snapshotName);
        Task<ShopCustomization> RestoreSnapshotAsync(int shopId, int userId, string snapshotName);
        Task<List<CustomizationSnapshot>> GetSnapshotsAsync(int shopId);

        Task<bool> PublishAsync(int shopId, int userId);
        Task<bool> UnpublishAsync(int shopId, int userId);

        Task<List<AssetDto>> GetAvailableAssetsAsync(string type, string? category = null);
        Task<Asset> AddAssetToMarketplaceAsync(int userId, AddAssetDto dto);

        Task<string> GeneratePreviewHtmlAsync(int shopId);
        Task<string> GeneratePreviewScreenshotAsync(int shopId);

        Task<ShopCustomizationStatsDto> GetCustomizationStatsAsync(int shopId);


    }
}