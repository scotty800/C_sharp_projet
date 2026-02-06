using ECommerceApi.Models;

namespace ECommerceApi.Services
{
    public interface IShopService
    {
        Task<List<Shop>> GetAllUserShopsAsync(int userId);
        Task<Shop?> GetShopByIdAsync(int id);
        Task<Shop?> GetShopBySlugAsync(string slug);
        Task<Shop> CreateShopAsync(int ownerId, CreateShopRequestDto shop);
        Task<bool> UpdateShopAsync(int shopId, int userId, Shop shop);
        Task<bool> DeleteShopAsync(int shopId, int userId);
        Task<bool> UploadLogoAsync(int shopId, int userId, IFormFile file);
        Task<bool> UploadBannerAsync(int shopId, int userId, IFormFile file);
    }
}