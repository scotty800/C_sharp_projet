using ECommerceApi.Models;

namespace ECommerceApi.Services
{
    public interface IUserServices
    {
        Task<List<User>> GetAllUsersAsync();
        Task<User?> GetUserByIdAsync(int id);
        Task<User?> GetByEmailAsync(string email);
        Task<User> CreateUserAsync(User user);
        Task<bool> UpdateAsync(int id, User user);
        Task<bool> DeleteAsync(int id);
    }
}