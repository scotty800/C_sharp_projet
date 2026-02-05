using ECommerceApi.Models;
using ECommerceApi.DTO;

namespace ECommerceApi.Services
{
    public interface IProductService
    {
        Task<List<Product>> GetAllProductsAsync();
        Task<Product?> GetProductByIdAsync(int id);
        Task<Product> CreateAsync(Product product);
        Task<bool> UpdateAsync(int id, Product product);
        Task<bool> DeleteAsync(int id);
        Task<List<Product>> GetProductsInStockAsync();

        Task<PagedResultDto<Product>> GetPagedAsync(
            int page,
            int pageSize,
            decimal? minPrice,
            decimal? maxPrice,
            string? sortBy
        );
    }
}