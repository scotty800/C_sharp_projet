using ECommerceApi.Models;
using ECommerceApi.Data;
using Microsoft.EntityFrameworkCore;

namespace ECommerceApi.Services
{
    public class UserService : IUserServices  // <-- même nom que l'interface
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<User>> GetAllUsersAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task<User?> GetUserByIdAsync(int id)
        {
            return await _context.Users.FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<User> CreateUserAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<bool> UpdateAsync(int id, User user)
        {
            var existing = await _context.Users.FirstOrDefaultAsync(p => p.Id == id);
            if (existing == null) return false;

            existing.Username = user.Username;
            existing.Email = user.Email;
            existing.Password = user.Password;
            existing.Role = user.Role;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _context.Users.FirstOrDefaultAsync(p => p.Id == id);
            if (existing == null) return false;

            _context.Users.Remove(existing);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
