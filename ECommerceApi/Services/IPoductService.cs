using ECommerceApi.Models;
using ECommerceApi.DTO;

namespace ECommerceApi.Services
{
    public interface IProductService
    {
        Task<List<ProductResponseDto>> GetAllProductsAsync(); // Changé
        Task<ProductResponseDto?> GetProductByIdAsync(int id); // Changé
        Task<Product> CreateAsync(Product product);
        Task<Product> CreateForShopAsync(int shopId, CreateProductDto productDto, int userId);
        Task<bool> UpdateAsync(int id, Product product);
        Task<bool> DeleteAsync(int id);
        Task<List<ProductResponseDto>> GetProductsInStockAsync(); // Changé

        Task<PagedResultDto<ProductResponseDto>> GetPagedAsync( // Changé
            int page,
            int pageSize,
            decimal? minPrice,
            decimal? maxPrice,
            string? sortBy
        );

        Task<List<ProductResponseDto>> GetProductsByShopIdAsync(int shopId); // Changé
        Task<PagedResultDto<ProductResponseDto>> GetProductsByShopPagedAsync( // Changé
            int shopId, 
            int page, 
            int pageSize, 
            decimal? minPrice, 
            decimal? maxPrice, 
            string? sortBy);
        Task<int> GetProductCountByShopAsync(int shopId);
    }
}