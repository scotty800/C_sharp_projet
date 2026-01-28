using MyBackendApi.Models;
using MyBackendApi.Data;
using Microsoft.EntityFrameworkCore;

public class UserService : IUserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<User>> GetAllUsersAsync()
    {
        return await Task.FromResult(_context.Users.ToList());
    }

    public async Task<User?> GetUserByIdAsync(int id)
    {
        var user = _context.Users.FirstOrDefault(u => u.Id == id);
        return await Task.FromResult(user);
    }

    public async Task<User> CreateUserAsync(User user)
    {
        var createUser = _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return await Task.FromResult(createUser.Entity);
    }

    public async Task<bool> UpdateUserAsync(int id, User user)
    {
        var existing = _context.Users.FirstOrDefault(u => u.Id == id);
        if (existing == null) return await Task.FromResult(false);

        existing.Name = user.Name;
        existing.Email = user.Email;
        await _context.SaveChangesAsync();
        return await Task.FromResult(true);
    }

    public async Task<bool> DeleteUserAsync(int id)
    {
        var user = _context.Users.FirstOrDefault(u => u.Id == id);
        if (user == null) return await Task.FromResult(false);

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return await Task.FromResult(true);
    }
}