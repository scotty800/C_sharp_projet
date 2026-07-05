using ECommerceApi.DTO;
using ECommerceApi.Models;
using ECommerceApi.Data;
using ECommerceApi.Services;
using Microsoft.EntityFrameworkCore;

namespace ECommerceApi.Services
{
    public class CartService : ICartService
    {
        private readonly AppDbContext _context;
        private readonly IProductService _productService;

        public CartService(AppDbContext context, IProductService productService)
        {
            _context = context;
            _productService = productService;
        }

        // ⭐ 1. GetOrCreateCartAsync — inclut ColorVariants
        public async Task<Cart> GetOrCreateCartAsync(int userId)
        {
            var cart = await _context.Carts
                .Include(c => c.Items)
                    .ThenInclude(i => i.Product)
                        .ThenInclude(p => p!.Shop)
                .Include(c => c.Items)
                    .ThenInclude(i => i.Product)
                        .ThenInclude(p => p!.ColorVariants) // ⭐ AJOUT
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                cart = new Cart
                {
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            return cart;
        }

        // ⭐ 2. Méthode privée de résolution de variante
        private ProductColorVariant? ResolveVariant(Product product, string? selectedColor)
        {
            if (string.IsNullOrEmpty(selectedColor))
                return null;

            return product.ColorVariants?.FirstOrDefault(
                v => v.Color.Equals(selectedColor, StringComparison.OrdinalIgnoreCase)
            );
        }

        // ⭐ 3. AddToCartAsync — avec vérification du stock de la variante
        public async Task<CartItem> AddToCartAsync(int userId, AddToCartDto cartDto)
        {
            // ⭐ On doit charger le produit AVEC ses variantes pour vérifier le bon stock
            var fullProduct = await _context.Products
                .Include(p => p.ColorVariants)
                .FirstOrDefaultAsync(p => p.Id == cartDto.ProductId);

            if (fullProduct == null)
                throw new Exception("Produit non trouvé");

            var variant = ResolveVariant(fullProduct, cartDto.Color);
            var availableStock = variant?.Stock ?? fullProduct.Stock;

            if (availableStock < cartDto.Quantity)
                throw new Exception($"Stock insuffisant. Disponible: {availableStock}");

            var cart = await GetOrCreateCartAsync(userId);

            var existingItem = cart.Items.FirstOrDefault(i =>
                i.ProductId == cartDto.ProductId &&
                i.SelectedSize == cartDto.Size &&
                i.SelectedColor == cartDto.Color);

            if (existingItem != null)
            {
                existingItem.Quantity += cartDto.Quantity;
                if (existingItem.Quantity > availableStock)
                    throw new Exception($"Quantité totale ({existingItem.Quantity}) dépasse le stock disponible ({availableStock})");
            }
            else
            {
                existingItem = new CartItem
                {
                    CartId = cart.Id,
                    ProductId = cartDto.ProductId,
                    Quantity = cartDto.Quantity,
                    SelectedSize = cartDto.Size,
                    SelectedColor = cartDto.Color,
                    AddedAt = DateTime.UtcNow
                };
                cart.Items.Add(existingItem);
            }

            cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return existingItem;
        }

        // ⭐ 4. UpdateCartItemAsync — avec vérification du stock de la variante
        public async Task<bool> UpdateCartItemAsync(int userId, int itemId, UpdateCartItemDto cartDto)
        {
            var cart = await GetOrCreateCartAsync(userId);
            var item = cart.Items.FirstOrDefault(i => i.Id == itemId);

            if (item == null)
                return false;

            var fullProduct = await _context.Products
                .Include(p => p.ColorVariants)
                .FirstOrDefaultAsync(p => p.Id == item.ProductId);

            if (fullProduct == null)
                return false;

            var variant = ResolveVariant(fullProduct, item.SelectedColor);
            var availableStock = variant?.Stock ?? fullProduct.Stock;

            if (cartDto.Quantity > availableStock)
                return false;

            item.Quantity = cartDto.Quantity;
            cart.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateCartItemVariantAsync(int userId, int itemId, UpdateCartItemVariantDto dto)
        {
            var cart = await GetOrCreateCartAsync(userId);
            var item = cart.Items.FirstOrDefault(i => i.Id == itemId);
            if (item == null) return false;

            // ⭐ On ne touche QUE le champ transmis ; l'autre reste celui déjà en base
            var newSize = dto.Size ?? item.SelectedSize;
            var newColor = dto.Color ?? item.SelectedColor;

            // Vérifier si un autre article avec la même variante existe déjà
            var duplicate = cart.Items.FirstOrDefault(i =>
                i.Id != itemId &&
                i.ProductId == item.ProductId &&
                i.SelectedSize == newSize &&
                i.SelectedColor == newColor);

            if (duplicate != null)
            {
                // Fusionner les quantités
                duplicate.Quantity += item.Quantity;
                cart.Items.Remove(item);
            }
            else
            {
                // Mettre à jour la variante
                item.SelectedSize = newSize;
                item.SelectedColor = newColor;
            }

            cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveFromCartAsync(int userId, int itemId)
        {
            var cart = await GetOrCreateCartAsync(userId);
            var item = cart.Items.FirstOrDefault(i => i.Id == itemId);

            if (item == null)
                return false;

            cart.Items.Remove(item);
            cart.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ClearCartAsync(int userId)
        {
            var cart = await GetOrCreateCartAsync(userId);

            cart.Items.Clear();
            cart.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        // ⭐ 5. GetCartDetailsAsync — avec résolution des variantes
        public async Task<CartResponseDto> GetCartDetailsAsync(int userId)
        {
            var cart = await GetOrCreateCartAsync(userId);

            var items = cart.Items.Select(i =>
            {
                var variant = ResolveVariant(i.Product, i.SelectedColor);

                var resolvedName = variant?.CustomName ?? i.Product.Name;
                var resolvedImage = variant?.ImageUrl1 ?? i.Product.ImageUrl1 ?? i.Product.ImageUrl;
                var resolvedStock = variant?.Stock ?? i.Product.Stock;
                var resolvedSizes = (variant?.Size != null && variant.Size.Count > 0)
                    ? variant.Size
                    : i.Product.Size;

                return new CartItemDto
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductName = resolvedName,
                    ProductPrice = i.Product.Price,
                    Quantity = i.Quantity,
                    TotalPrice = i.Quantity * i.Product.Price,
                    ProductImage = resolvedImage,
                    Stock = resolvedStock,

                    ShopId = i.Product.ShopId,
                    ShopName = i.Product.Shop?.Name,
                    ShopSlug = i.Product.Shop?.Slug,
                    ShopLogoUrl = i.Product.Shop?.LogoUrl,

                    Size = resolvedSizes,
                    Color = i.Product.Color,

                    SelectedSize = i.SelectedSize,
                    SelectedColor = i.SelectedColor,
                };
            }).ToList();

            return new CartResponseDto
            {
                Id = cart.Id,
                UserId = cart.UserId,
                Items = items,
                TotalItems = cart.TotalItems,
                TotalAmount = cart.TotalAmount,
                CreatedAt = cart.CreatedAt,
                UpdatedAt = cart.UpdatedAt
            };
        }

        public async Task<int> GetCartItemCountAsync(int userId)
        {
            var cart = await GetOrCreateCartAsync(userId);
            return cart.TotalItems;
        }
    }
}