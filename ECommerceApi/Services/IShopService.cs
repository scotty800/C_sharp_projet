using ECommerceApi.Models;
using ECommerceApi.DTO;

namespace ECommerceApi.Services
{
    public interface IShopService
    {
        Task<List<Shop>> GetUserShopsAsync(int userId);
        Task<Shop?> GetShopByIdAsync(int id);
        Task<Shop?> GetShopBySlugAsync(string slug);  // CORRIGÉ : retourne Shop

        Task<Shop> CreateShopAsync(int ownerId, CreateShopRequestDto shop);
        Task<bool> UpdateShopAsync(int shopId, int userId, UpdateShopRequestDto shop);
        Task<bool> DeleteShopAsync(int shopId, int userId);
        
        Task<bool> UploadLogoAsync(int shopId, int userId, IFormFile file);
        Task<bool> UploadBannerAsync(int shopId, int userId, IFormFile file);

        Task<PagedResultDto<ShopListDto>> GetShopsPagedAsync(
            int page,
            int pageSize,
            string? search = null
        );
    }
}