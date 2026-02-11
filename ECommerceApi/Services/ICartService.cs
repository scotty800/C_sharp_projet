using ECommerceApi.DTO;
using ECommerceApi.Models;

namespace ECommerceApi.Services
{
    public interface ICartService
    {
        Task<Cart> GetOrCreateCartAsync(int userId);
        Task<CartItem> AddToCartAsync(int userId, AddToCartDto cartDto);
        Task<bool> UpdateCartItemAsync(int userId, int itemId, UpdateCartItemDto cartDto);
        Task<bool> RemoveFromCartAsync(int userId, int itemId);
        Task<bool> ClearCartAsync(int userId);
        Task<CartResponseDto> GetCartDetailsAsync(int userId);
        Task<int> GetCartItemCountAsync(int userId);
    }
}