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
        private readonly IWebHostEnvironment _environment;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ProductService(AppDbContext context, IShopService shopService,
            IWebHostEnvironment environment, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _shopService = shopService;
            _environment = environment;
            _httpContextAccessor = httpContextAccessor;
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
                    ImageUrl = p.ImageUrl,
                    ImageUrl1 = p.ImageUrl1,
                    ImageUrl2 = p.ImageUrl2,
                    ImageUrl3 = p.ImageUrl3,
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
                    ImageUrl = p.ImageUrl,
                    ImageUrl1 = p.ImageUrl1,
                    ImageUrl2 = p.ImageUrl2,
                    ImageUrl3 = p.ImageUrl3,
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

        // ⭐⭐⭐ CreateForShopAsync AVEC VARIANTES ⭐⭐⭐
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

            // ⭐ NOUVEAU : persister les variantes de couleur dès la création
            if (productDto.ColorVariants != null)
            {
                foreach (var v in productDto.ColorVariants)
                {
                    product.ColorVariants.Add(new ProductColorVariant
                    {
                        Color = v.Color,
                        CustomName = v.CustomName,
                        Stock = v.Stock,
                        Size = v.Sizes,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            await UpdateShopProductCount(shopId);

            return product;
        }

        public async Task<bool> UpdateAsync(int id, Product product)
        {
            var existing = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
            if (existing == null) return false;

            existing.Name = product.Name;
            existing.Description = product.Description;
            existing.Price = product.Price;
            existing.Stock = product.Stock;
            existing.Size = product.Size;
            existing.Color = product.Color;
            existing.Category = product.Category;
            existing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

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
                    ImageUrl = p.ImageUrl,
                    ImageUrl1 = p.ImageUrl1,
                    ImageUrl2 = p.ImageUrl2,
                    ImageUrl3 = p.ImageUrl3,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<PagedResultDto<ProductResponseDto>> GetPagedAsync(
            int page,
            int pageSize,
            decimal? minPrice,
            decimal? maxPrice,
            string? sortBy,
            string? category = null)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize > 50 ? 50 : pageSize;

            var query = _context.Products.AsQueryable();

            if (!string.IsNullOrWhiteSpace(category))
            {
                query = query.Where(p => p.Category.ToLower() == category.ToLower());
            }

            if (minPrice.HasValue)
                query = query.Where(p => p.Price >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(p => p.Price <= maxPrice.Value);

            query = sortBy switch
            {
                "name" => query.OrderBy(p => p.Name),
                "price" => query.OrderBy(p => (double)p.Price),
                "price_desc" => query.OrderByDescending(p => (double)p.Price),
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
                    ImageUrl = p.ImageUrl,
                    ImageUrl1 = p.ImageUrl1,
                    ImageUrl2 = p.ImageUrl2,
                    ImageUrl3 = p.ImageUrl3,
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

        // ⭐⭐⭐ GetProductsByShopIdAsync AVEC VARIANTES ⭐⭐⭐
        public async Task<List<ProductResponseDto>> GetProductsByShopIdAsync(int shopId)
        {
            return await _context.Products
                .Include(p => p.ColorVariants)
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
                    ImageUrl = p.ImageUrl,
                    ImageUrl1 = p.ImageUrl1,
                    ImageUrl2 = p.ImageUrl2,
                    ImageUrl3 = p.ImageUrl3,
                    CreatedAt = p.CreatedAt,
                    Variants = p.ColorVariants.Select(v => new ProductColorVariantDto
                    {
                        Id = v.Id,
                        Color = v.Color,
                        CustomName = v.CustomName,
                        Stock = v.Stock,
                        Sizes = v.Size,
                        ImageUrl1 = v.ImageUrl1,
                        ImageUrl2 = v.ImageUrl2,
                        ImageUrl3 = v.ImageUrl3
                    }).ToList()
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
                "price" => query.OrderBy(p => (double)p.Price),
                "price_desc" => query.OrderByDescending(p => (double)p.Price),
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
                    ImageUrl = p.ImageUrl,
                    ImageUrl1 = p.ImageUrl1,
                    ImageUrl2 = p.ImageUrl2,
                    ImageUrl3 = p.ImageUrl3,
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

        public async Task<bool> UploadProductImagesAsync(int productId, int userId, ProductImageUploadDto images)
        {
            var product = await _context.Products
                .Include(p => p.Shop)
                .FirstOrDefaultAsync(p => p.Id == productId);

            if (product == null)
                throw new Exception("Produit non trouvé");

            if (product.ShopId.HasValue)
            {
                if (product.Shop == null || product.Shop.OwnerId != userId)
                    throw new Exception("Vous n'êtes pas autorisé à modifier ce produit");
            }
            else
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null || user.Role != "Admin")
                    throw new Exception("Seul un admin peut modifier les produits généraux");
            }

            if (images.Image1 != null)
                product.ImageUrl1 = await SaveProductImage(productId, images.Image1, 1);

            if (images.Image2 != null)
                product.ImageUrl2 = await SaveProductImage(productId, images.Image2, 2);

            if (images.Image3 != null)
                product.ImageUrl3 = await SaveProductImage(productId, images.Image3, 3);

            product.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return true;
        }

        private async Task<string> SaveProductImage(int productId, IFormFile file, int imageNumber)
        {
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
            var extension = Path.GetExtension(file.FileName).ToLower();

            if (!allowedExtensions.Contains(extension))
                throw new Exception("Format de fichier non autorisé. Utilisez JPG, PNG, WEBP ou GIF");

            if (file.Length > 5 * 1024 * 1024)
                throw new Exception("Fichier trop volumineux (max 5MB)");

            var uploadsPath = Path.Combine(_environment.WebRootPath, "uploads", "products", productId.ToString());
            Directory.CreateDirectory(uploadsPath);

            var fileName = $"image_{imageNumber}_{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var request = _httpContextAccessor.HttpContext?.Request;
            var baseUrl = $"{request?.Scheme}://{request?.Host}";

            return $"/uploads/products/{productId}/{fileName}";
        }

        // ============ NOUVELLES MÉTHODES POUR LES VARIANTES DE COULEUR ============

        // ⭐⭐⭐ UpsertColorVariantAsync AVEC LE BON MAPPING ⭐⭐⭐
        public async Task<ProductColorVariantDto> UpsertColorVariantAsync(int productId, int userId, UpsertColorVariantDto dto)
        {
            var product = await _context.Products
                .Include(p => p.Shop)
                .FirstOrDefaultAsync(p => p.Id == productId);
            
            if (product == null) 
                throw new Exception("Produit non trouvé");
            
            if (product.ShopId.HasValue && (product.Shop == null || product.Shop.OwnerId != userId))
                throw new Exception("Non autorisé");

            var variant = await _context.ProductColorVariants
                .FirstOrDefaultAsync(v => v.ProductId == productId && v.Color == dto.Color);

            if (variant == null)
            {
                variant = new ProductColorVariant 
                { 
                    ProductId = productId, 
                    Color = dto.Color, 
                    CreatedAt = DateTime.UtcNow 
                };
                _context.ProductColorVariants.Add(variant);
            }

            variant.CustomName = dto.CustomName;
            variant.Stock = dto.Stock;
            variant.Size = dto.Sizes;      // ⭐ ÉTAIT dto.Size → maintenant dto.Sizes
            variant.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new ProductColorVariantDto
            {
                Id = variant.Id,
                Color = variant.Color,
                CustomName = variant.CustomName,
                Stock = variant.Stock,
                Sizes = variant.Size,      // ⭐ ÉTAIT Size = variant.Size → maintenant Sizes = variant.Size
                ImageUrl1 = variant.ImageUrl1,
                ImageUrl2 = variant.ImageUrl2,
                ImageUrl3 = variant.ImageUrl3
            };
        }

        public async Task<bool> DeleteColorVariantAsync(int productId, int userId, string color)
        {
            var product = await _context.Products
                .Include(p => p.Shop)
                .FirstOrDefaultAsync(p => p.Id == productId);
            
            if (product == null) 
                throw new Exception("Produit non trouvé");
            
            if (product.ShopId.HasValue && (product.Shop == null || product.Shop.OwnerId != userId))
                throw new Exception("Non autorisé");

            var variant = await _context.ProductColorVariants
                .FirstOrDefaultAsync(v => v.ProductId == productId && v.Color == color);
            
            if (variant == null)
                return false;

            // Supprimer les images physiques
            if (!string.IsNullOrEmpty(variant.ImageUrl1))
                DeleteVariantImage(variant.ImageUrl1);
            if (!string.IsNullOrEmpty(variant.ImageUrl2))
                DeleteVariantImage(variant.ImageUrl2);
            if (!string.IsNullOrEmpty(variant.ImageUrl3))
                DeleteVariantImage(variant.ImageUrl3);

            _context.ProductColorVariants.Remove(variant);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UploadVariantImagesAsync(int productId, string color, int userId, ProductImageUploadDto images)
        {
            var product = await _context.Products
                .Include(p => p.Shop)
                .FirstOrDefaultAsync(p => p.Id == productId);
            
            if (product == null) 
                throw new Exception("Produit non trouvé");
            
            if (product.ShopId.HasValue && (product.Shop == null || product.Shop.OwnerId != userId))
                throw new Exception("Non autorisé");

            var variant = await _context.ProductColorVariants
                .FirstOrDefaultAsync(v => v.ProductId == productId && v.Color == color);
            
            if (variant == null)
            {
                variant = new ProductColorVariant 
                { 
                    ProductId = productId, 
                    Color = color,
                    CreatedAt = DateTime.UtcNow 
                };
                _context.ProductColorVariants.Add(variant);
            }

            // Supprimer les anciennes images si elles existent
            if (!string.IsNullOrEmpty(variant.ImageUrl1))
                DeleteVariantImage(variant.ImageUrl1);
            if (!string.IsNullOrEmpty(variant.ImageUrl2))
                DeleteVariantImage(variant.ImageUrl2);
            if (!string.IsNullOrEmpty(variant.ImageUrl3))
                DeleteVariantImage(variant.ImageUrl3);

            // Sauvegarder les nouvelles images
            if (images.Image1 != null) 
                variant.ImageUrl1 = await SaveVariantImage(productId, color, images.Image1, 1);
            if (images.Image2 != null) 
                variant.ImageUrl2 = await SaveVariantImage(productId, color, images.Image2, 2);
            if (images.Image3 != null) 
                variant.ImageUrl3 = await SaveVariantImage(productId, color, images.Image3, 3);

            variant.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        // ⭐⭐⭐ NOUVELLE MÉTHODE : Supprimer une image spécifique d'une variante ⭐⭐⭐
        public async Task<ProductColorVariantDto?> DeleteVariantImageAsync(int productId, string color, int imageNumber, int userId)
        {
            var product = await _context.Products
                .Include(p => p.Shop)
                .FirstOrDefaultAsync(p => p.Id == productId);

            if (product == null)
                throw new Exception("Produit non trouvé");

            if (product.ShopId.HasValue && (product.Shop == null || product.Shop.OwnerId != userId))
                throw new Exception("Non autorisé");

            var variant = await _context.ProductColorVariants
                .FirstOrDefaultAsync(v => v.ProductId == productId && v.Color == color);

            if (variant == null)
                return null;

            string? currentImage1 = variant.ImageUrl1;
            string? currentImage2 = variant.ImageUrl2;
            string? currentImage3 = variant.ImageUrl3;

            string? imageUrlToDelete = imageNumber switch
            {
                1 => currentImage1,
                2 => currentImage2,
                3 => currentImage3,
                _ => null
            };

            if (!string.IsNullOrEmpty(imageUrlToDelete))
            {
                DeleteVariantImage(imageUrlToDelete);
            }

            // Réorganisation des slots (même logique que pour les images produit)
            string? newImageUrl1 = currentImage1;
            string? newImageUrl2 = currentImage2;
            string? newImageUrl3 = currentImage3;

            if (imageNumber == 1)
            {
                newImageUrl1 = currentImage2;
                newImageUrl2 = currentImage3;
                newImageUrl3 = null;
            }
            else if (imageNumber == 2)
            {
                newImageUrl1 = currentImage1;
                newImageUrl2 = currentImage3;
                newImageUrl3 = null;
            }
            else if (imageNumber == 3)
            {
                newImageUrl1 = currentImage1;
                newImageUrl2 = currentImage2;
                newImageUrl3 = null;
            }

            variant.ImageUrl1 = newImageUrl1;
            variant.ImageUrl2 = newImageUrl2;
            variant.ImageUrl3 = newImageUrl3;
            variant.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new ProductColorVariantDto
            {
                Id = variant.Id,
                Color = variant.Color,
                CustomName = variant.CustomName,
                Stock = variant.Stock,
                Sizes = variant.Size,
                ImageUrl1 = variant.ImageUrl1,
                ImageUrl2 = variant.ImageUrl2,
                ImageUrl3 = variant.ImageUrl3
            };
        }

        private async Task<string> SaveVariantImage(int productId, string color, IFormFile file, int n)
        {
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
            var extension = Path.GetExtension(file.FileName).ToLower();

            if (!allowedExtensions.Contains(extension))
                throw new Exception("Format de fichier non autorisé. Utilisez JPG, PNG, WEBP ou GIF");

            if (file.Length > 5 * 1024 * 1024)
                throw new Exception("Fichier trop volumineux (max 5MB)");

            var safeColor = string.Concat(color.Where(char.IsLetterOrDigit)).ToLower();
            var uploadsPath = Path.Combine(_environment.WebRootPath, "uploads", "products", 
                productId.ToString(), "variants", safeColor);
            
            Directory.CreateDirectory(uploadsPath);
            
            var fileName = $"image_{n}_{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return $"/uploads/products/{productId}/variants/{safeColor}/{fileName}";
        }

        private void DeleteVariantImage(string imageUrl)
        {
            try
            {
                if (string.IsNullOrEmpty(imageUrl)) return;
                
                var filePath = Path.Combine(_environment.WebRootPath, imageUrl.TrimStart('/'));
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }
            }
            catch (Exception ex)
            {
                // Log l'erreur mais continue
                Console.WriteLine($"Erreur lors de la suppression de l'image: {ex.Message}");
            }
        }
    }
}