using ECommerceApi.Models;
using ECommerceApi.Data;
using ECommerceApi.DTO;
using Microsoft.EntityFrameworkCore;

namespace ECommerceApi.Services
{
    public class ShopService : IShopService
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public ShopService(AppDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        public async Task<List<Shop>> GetAllUserShopsAsync(int userId)
        {
            return await _context.Shops
                .Where(s => s.OwnerId == userId && s.IsActive)
                .ToListAsync();
        }

        public async Task<Shop?> GetShopByIdAsync(int id)
        {
            return await _context.Shops
                .Include(s => s.Owner)
                .FirstOrDefaultAsync(s => s.Id == id && s.IsActive);
        }

        public async Task<Shop?> GetShopBySlugAsync(string slug)
        {
            var normalizedSlug = slug.ToLower();

            return await _context.Shops
                .Include(s => s.Owner)
                .FirstOrDefaultAsync(s => s.Slug == normalizedSlug && s.IsActive);
        }

        public async Task<Shop> CreateShopAsync(int ownerId, CreateShopRequestDto shop)
        {
            if (string.IsNullOrWhiteSpace(shop.Slug))
                throw new Exception("Le slug est obligatoire");
            
            var normalizedSlug = shop.Slug.ToLower();

            var existing = await _context.Shops
                .FirstOrDefaultAsync(s => s.Slug == normalizedSlug);
            
            if (existing != null)
                throw new Exception("Ce slug est déjà utilisé");

            var userShopCount = await _context.Shops
                .CountAsync(s => s.OwnerId == ownerId && s.IsActive);
            
            if (userShopCount >= 3)
                throw new Exception("Vous ne pouvez pas créer plus de 3 shops");
            
            var newShop = new Shop
            {
                Name = shop.Name,
                Description = shop.Description,
                Slug = normalizedSlug,
                OwnerId = ownerId,
                ThemeColor = shop.ThemeColor,
                BackgroundColor = shop.BackgroundColor,
                TextColor = shop.TextColor,
                Email = shop.Email,
                Phone = shop.Phone
            };

            _context.Shops.Add(newShop);
            await _context.SaveChangesAsync();
            return newShop;
        }

        public async Task<bool> UpdateShopAsync(int shopId, int userId, UpdateShopRequestDto shopDto)
        {
            var shop = await _context.Shops.FindAsync(shopId);

            if (shop == null || shop.OwnerId != userId || !shop.IsActive)
                return false;

            shop.Name = shopDto.Name;
            shop.Description = shopDto.Description;
            shop.ThemeColor = shopDto.ThemeColor;
            shop.BackgroundColor = shopDto.BackgroundColor;
            shop.TextColor = shopDto.TextColor;
            shop.Email = shopDto.Email;
            shop.Phone = shopDto.Phone;
            shop.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteShopAsync(int shopId, int userId)
        {
            var shop = await _context.Shops.FindAsync(shopId);

            if (shop == null || shop.OwnerId != userId)
                return false;
            
            shop.IsActive = false;
            shop.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return true;
        }

        private void ValidateImage(IFormFile file)
        {
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLower();

            if (!allowedExtensions.Contains(extension))
                throw new Exception("Format de fichier non autorisé");

            if (file.Length > 2_000_000)
                throw new Exception("Fichier trop volumineux (2MB max)");
        }

        public async Task<bool> UploadLogoAsync(int shopId, int userId, IFormFile file)
        {
            ValidateImage(file);
            
            var shop = await _context.Shops.FindAsync(shopId);
            if (shop == null || shop.OwnerId != userId)
                return false;

            var uploadsPath = Path.Combine(_environment.WebRootPath, "uploads", "shops", shopId.ToString());
            Directory.CreateDirectory(uploadsPath);

            var fileName = $"logo_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsPath, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);
            

            shop.LogoUrl = $"/uploads/shops/{shopId}/{fileName}";
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UploadBannerAsync(int shopId, int userId, IFormFile file)
        {
            ValidateImage(file);

            var shop = await _context.Shops.FindAsync(shopId);
            if (shop == null || shop.OwnerId != userId)
                return false;

            var uploadsPath = Path.Combine(_environment.WebRootPath, "uploads", "shops", shopId.ToString());
            Directory.CreateDirectory(uploadsPath);

            var fileName = $"banner_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsPath, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            shop.BannerUrl = $"/uploads/shops/{shopId}/{fileName}";
            await _context.SaveChangesAsync();

            return true;
        }
    }
}