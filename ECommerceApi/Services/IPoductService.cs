using ECommerceApi.Models;
using ECommerceApi.DTO;

namespace ECommerceApi.Services
{
    public interface IProductService
    {
        Task<List<ProductResponseDto>> GetAllProductsAsync();
        Task<ProductResponseDto?> GetProductByIdAsync(int id);
        Task<Product> CreateAsync(Product product);
        Task<Product> CreateForShopAsync(int shopId, CreateProductDto productDto, int userId);
        Task<bool> UpdateAsync(int id, Product product);
        Task<bool> DeleteAsync(int id);
        Task<List<ProductResponseDto>> GetProductsInStockAsync();

        Task<PagedResultDto<ProductResponseDto>> GetPagedAsync(
            int page,
            int pageSize,
            decimal? minPrice,
            decimal? maxPrice,
            string? sortBy,
            string? category = null
        );

        Task<List<ProductResponseDto>> GetProductsByShopIdAsync(int shopId);
        Task<PagedResultDto<ProductResponseDto>> GetProductsByShopPagedAsync(
            int shopId,
            int page,
            int pageSize,
            decimal? minPrice,
            decimal? maxPrice,
            string? sortBy);
        Task<int> GetProductCountByShopAsync(int shopId);

        Task<bool> UploadProductImagesAsync(int productId, int userId, ProductImageUploadDto images);

        // Nouvelles méthodes pour la gestion des variantes de couleur
        Task<ProductColorVariantDto> UpsertColorVariantAsync(int productId, int userId, UpsertColorVariantDto dto);
        Task<bool> DeleteColorVariantAsync(int productId, int userId, string color);
        Task<bool> UploadVariantImagesAsync(int productId, string color, int userId, ProductImageUploadDto images);
        Task<ProductColorVariantDto?> DeleteVariantImageAsync(int productId, string color, int imageNumber, int userId);
    }
}