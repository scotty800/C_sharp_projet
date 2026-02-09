using ECommerceApi.Data;
using ECommerceApi.DTO;
using ECommerceApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ECommerceApi.Services
{
    public class ProductService : IProductService
    {
        private readonly AppDbContext _context;
        private readonly IShopService _shopService;
        
        public ProductService(AppDbContext context, IShopService shopService)
        {
            _context = context;
            _shopService = shopService;
        }
        
        public async Task<List<ProductResponseDto>> GetAllProductsAsync()
        {
            return await _context.Products
                .Select(p => new ProductResponseDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    Price = p.Price,
                    Stock = p.Stock,
                    Size = p.Size,
                    Color = p.Color,
                    Category = p.Category,
                    ShopId = p.ShopId,
                    ShopName = p.Shop != null ? p.Shop.Name : null,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();
        }
        
        public async Task<ProductResponseDto?> GetProductByIdAsync(int id)
        {
            return await _context.Products
                .Where(p => p.Id == id)
                .Select(p => new ProductResponseDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    Price = p.Price,
                    Stock = p.Stock,
                    Size = p.Size,
                    Color = p.Color,
                    Category = p.Category,
                    ShopId = p.ShopId,
                    ShopName = p.Shop != null ? p.Shop.Name : null,
                    CreatedAt = p.CreatedAt
                })
                .FirstOrDefaultAsync();
        }
        
        public async Task<Product> CreateAsync(Product product)
        {
            product.CreatedAt = DateTime.UtcNow;
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            
            if (product.ShopId.HasValue)
            {
                await UpdateShopProductCount(product.ShopId.Value);
            }
            
            return product;
        }
        
        public async Task<Product> CreateForShopAsync(int shopId, CreateProductDto productDto, int userId)
        {
            var shop = await _shopService.GetShopByIdAsync(shopId);
            if (shop == null)
                throw new Exception("Shop non trouvé");
            
            if (shop.OwnerId != userId)
                throw new Exception("Vous n'êtes pas le propriétaire de ce shop");
            
            var product = new Product
            {
                Name = productDto.Name,
                Price = productDto.Price,
                Stock = productDto.Stock,
                Description = productDto.Description,
                Size = productDto.Size,
                Color = productDto.Color,
                Category = productDto.Category,
                ShopId = shopId,
                CreatedAt = DateTime.UtcNow
            };
            
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            
            await UpdateShopProductCount(shopId);
            
            return product;
        }
        
        public async Task<bool> UpdateAsync(int id, Product product)
        {
            var existing = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
            if (existing == null) return false;
            
            var oldShopId = existing.ShopId;
            
            existing.Name = product.Name;
            existing.Price = product.Price;
            existing.Stock = product.Stock;
            existing.Size = product.Size;
            existing.Color = product.Color;
            existing.Category = product.Category;
            existing.Description = product.Description;
            existing.ShopId = product.ShopId;
            existing.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            if (oldShopId != product.ShopId)
            {
                if (oldShopId.HasValue)
                    await UpdateShopProductCount(oldShopId.Value);
                if (product.ShopId.HasValue)
                    await UpdateShopProductCount(product.ShopId.Value);
            }
            
            return true;
        }
        
        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
            if (existing == null) return false;
            
            var shopId = existing.ShopId;
            
            _context.Products.Remove(existing);
            await _context.SaveChangesAsync();
            
            if (shopId.HasValue)
            {
                await UpdateShopProductCount(shopId.Value);
            }
            
            return true;
        }
        
        public async Task<List<ProductResponseDto>> GetProductsInStockAsync()
        {
            return await _context.Products
                .Where(p => p.Stock > 0)
                .Select(p => new ProductResponseDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    Price = p.Price,
                    Stock = p.Stock,
                    Size = p.Size,
                    Color = p.Color,
                    Category = p.Category,
                    ShopId = p.ShopId,
                    ShopName = p.Shop != null ? p.Shop.Name : null,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<PagedResultDto<ProductResponseDto>> GetPagedAsync(
            int page,
            int pageSize,
            decimal? minPrice,
            decimal? maxPrice,
            string? sortBy)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize > 50 ? 50 : pageSize;
            
            var query = _context.Products.AsQueryable();
            
            if (minPrice.HasValue)
                query = query.Where(p => p.Price >= minPrice.Value);
                
            if (maxPrice.HasValue)
                query = query.Where(p => p.Price <= maxPrice.Value);
                
            query = sortBy switch
            {
                "name" => query.OrderBy(p => p.Name),
                "price" => query.OrderBy(p => p.Price),
                "price_desc" => query.OrderByDescending(p => p.Price),
                "newest" => query.OrderByDescending(p => p.CreatedAt),
                _ => query.OrderBy(p => p.Id)
            };
            
            var totalItems = await query.CountAsync();
            
            var products = await query
                .Select(p => new ProductResponseDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    Price = p.Price,
                    Stock = p.Stock,
                    Size = p.Size,
                    Color = p.Color,
                    Category = p.Category,
                    ShopId = p.ShopId,
                    ShopName = p.Shop != null ? p.Shop.Name : null,
                    CreatedAt = p.CreatedAt
                })
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
                
            return new PagedResultDto<ProductResponseDto>
            {
                Page = page,
                PageSize = pageSize,
                TotalItems = totalItems,
                TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize),
                Items = products
            };
        }
        
        public async Task<List<ProductResponseDto>> GetProductsByShopIdAsync(int shopId)
        {
            return await _context.Products
                .Where(p => p.ShopId == shopId)
                .Select(p => new ProductResponseDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    Price = p.Price,
                    Stock = p.Stock,
                    Size = p.Size,
                    Color = p.Color,
                    Category = p.Category,
                    ShopId = p.ShopId,
                    ShopName = p.Shop != null ? p.Shop.Name : null,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();
        }
        
        public async Task<PagedResultDto<ProductResponseDto>> GetProductsByShopPagedAsync(
            int shopId, 
            int page, 
            int pageSize, 
            decimal? minPrice, 
            decimal? maxPrice, 
            string? sortBy)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize > 50 ? 50 : pageSize;
            
            var query = _context.Products
                .Where(p => p.ShopId == shopId)
                .AsQueryable();
            
            if (minPrice.HasValue)
                query = query.Where(p => p.Price >= minPrice.Value);
                
            if (maxPrice.HasValue)
                query = query.Where(p => p.Price <= maxPrice.Value);
                
            query = sortBy switch
            {
                "name" => query.OrderBy(p => p.Name),
                "price" => query.OrderBy(p => p.Price),
                "price_desc" => query.OrderByDescending(p => p.Price),
                "newest" => query.OrderByDescending(p => p.CreatedAt),
                _ => query.OrderByDescending(p => p.CreatedAt)
            };
            
            var totalItems = await query.CountAsync();
            
            var products = await query
                .Select(p => new ProductResponseDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    Price = p.Price,
                    Stock = p.Stock,
                    Size = p.Size,
                    Color = p.Color,
                    Category = p.Category,
                    ShopId = p.ShopId,
                    ShopName = p.Shop != null ? p.Shop.Name : null,
                    CreatedAt = p.CreatedAt
                })
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
                
            return new PagedResultDto<ProductResponseDto>
            {
                Page = page,
                PageSize = pageSize,
                TotalItems = totalItems,
                TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize),
                Items = products
            };
        }
        
        public async Task<int> GetProductCountByShopAsync(int shopId)
        {
            return await _context.Products
                .Where(p => p.ShopId == shopId)
                .CountAsync();
        }
        
        private async Task UpdateShopProductCount(int shopId)
        {
            var shop = await _context.Shops.FindAsync(shopId);
            if (shop != null)
            {
                shop.ProductCount = await GetProductCountByShopAsync(shopId);
                shop.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }
    }
}