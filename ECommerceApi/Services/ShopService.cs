using ECommerceApi.Models;
using ECommerceApi.Data;
using ECommerceApi.DTO;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;

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

        public async Task<List<Shop>> GetUserShopsAsync(int userId)
        {
            return await _context.Shops
                .Where(s => s.OwnerId == userId && s.IsActive)
                .Include(s => s.Products)
                .Include(s => s.Owner)
                .ToListAsync();
        }

        public async Task<Shop?> GetShopByIdAsync(int id)
        {
            return await _context.Shops
                .Include(s => s.Owner)
                .Include(s => s.Products)
                .FirstOrDefaultAsync(s => s.Id == id && s.IsActive);
        }

        public async Task<Shop?> GetShopBySlugAsync(string slug)
        {
            var normalizedSlug = slug.ToLower();

            return await _context.Shops
                .Include(s => s.Owner)
                .Include(s => s.Products)
                .FirstOrDefaultAsync(s => s.Slug == normalizedSlug && s.IsActive);
        }

        public async Task<Shop> CreateShopAsync(int ownerId, CreateShopRequestDto shopDto)
        {
            if (string.IsNullOrWhiteSpace(shopDto.Slug))
                throw new Exception("Le slug est obligatoire");
            
            var normalizedSlug = shopDto.Slug.ToLower();

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
                Name = shopDto.Name,
                Description = shopDto.Description,
                Slug = normalizedSlug,
                OwnerId = ownerId,
                ThemeColor = shopDto.ThemeColor,
                BackgroundColor = shopDto.BackgroundColor,
                TextColor = shopDto.TextColor,
                Email = shopDto.Email,
                Phone = shopDto.Phone,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
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

            if (!string.IsNullOrWhiteSpace(shopDto.Name))
                shop.Name = shopDto.Name;
            
            if (shopDto.Description != null)
                shop.Description = shopDto.Description;
            
            if (!string.IsNullOrWhiteSpace(shopDto.ThemeColor))
                shop.ThemeColor = shopDto.ThemeColor;
            
            if (!string.IsNullOrWhiteSpace(shopDto.BackgroundColor))
                shop.BackgroundColor = shopDto.BackgroundColor;
            
            if (!string.IsNullOrWhiteSpace(shopDto.TextColor))
                shop.TextColor = shopDto.TextColor;
            
            if (shopDto.Email != null)
                shop.Email = shopDto.Email;
            
            if (shopDto.Phone != null)
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

        public async Task<PagedResultDto<ShopListDto>> GetShopsPagedAsync(
            int page,
            int pageSize,
            string? search = null)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize > 50 ? 50 : pageSize;

            var query = _context.Shops
                .Include(s => s.Owner)
                .Include(s => s.Products)
                .Where(s => s.IsActive)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var normalizedSearch = search.ToLower();

                query = query.Where(s =>
                    s.Name.ToLower().Contains(normalizedSearch) ||
                    (s.Description != null && s.Description.ToLower().Contains(normalizedSearch))
                );
            }

            var totalItems = await query.CountAsync();
            
            var shops = await query
                .OrderByDescending(s => s.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(s => new ShopListDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description ?? string.Empty,
                    Slug = s.Slug,
                    OwnerId = s.OwnerId,
                    OwnerUsername = s.Owner != null ? s.Owner.Username : "Unknown", // CORRIGÉ ICI
                    ThemeColor = s.ThemeColor,
                    BackgroundColor = s.BackgroundColor,
                    TextColor = s.TextColor,
                    LogoUrl = s.LogoUrl,
                    BannerUrl = s.BannerUrl,
                    ProductCount = s.Products.Count,
                    CreatedAt = s.CreatedAt
                })
                .ToListAsync();
            
            return new PagedResultDto<ShopListDto>
            {
                Page = page,
                PageSize = pageSize,
                TotalItems = totalItems,
                TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize),
                Items = shops
            };
        }
    }
}