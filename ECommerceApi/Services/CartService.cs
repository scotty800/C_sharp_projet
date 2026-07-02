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

        public async Task<Cart> GetOrCreateCartAsync(int userId)
        {
            var cart = await _context.Carts
                .Include(c => c.Items)
                    .ThenInclude(i => i.Product)
                        .ThenInclude(p => p!.Shop)
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

        public async Task<CartItem> AddToCartAsync(int userId, AddToCartDto cartDto)
        {
            var product = await _productService.GetProductByIdAsync(cartDto.ProductId);

            if (product == null)
                throw new Exception("Produit non trouvé");

            if (product.Stock < cartDto.Quantity)
                throw new Exception($"Stock insuffisant. Disponible: {product.Stock}");

            var cart = await GetOrCreateCartAsync(userId);

            var existingItem = cart.Items.FirstOrDefault(i =>
                i.ProductId == cartDto.ProductId &&
                i.SelectedSize == cartDto.Size &&
                i.SelectedColor == cartDto.Color);

            if (existingItem != null)
            {
                existingItem.Quantity += cartDto.Quantity;
                if (existingItem.Quantity > product.Stock)
                    throw new Exception($"Quantité totale ({existingItem.Quantity}) dépasse le stock disponible ({product.Stock})");
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

        public async Task<bool> UpdateCartItemAsync(int userId, int itemId, UpdateCartItemDto cartDto)
        {
            var cart = await GetOrCreateCartAsync(userId);
            var item = cart.Items.FirstOrDefault(i => i.Id == itemId);

            if (item == null)
                return false;

            var product = await _productService.GetProductByIdAsync(item.ProductId);
            if (product == null || cartDto.Quantity > product.Stock)
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
            //    (le serveur est la source de vérité, plus besoin que le front le renvoie)
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

        public async Task<CartResponseDto> GetCartDetailsAsync(int userId)
        {
            var cart = await GetOrCreateCartAsync(userId);

            var items = cart.Items.Select(i => new CartItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.Product.Name,
                ProductPrice = i.Product.Price,
                Quantity = i.Quantity,
                TotalPrice = i.Quantity * i.Product.Price,
                ProductImage = i.Product.ImageUrl1 ?? i.Product.ImageUrl,
                Stock = i.Product.Stock,

                ShopId = i.Product.ShopId,
                ShopName = i.Product.Shop?.Name,
                ShopSlug = i.Product.Shop?.Slug,
                ShopLogoUrl = i.Product.Shop?.LogoUrl,
                
                Size = i.Product.Size,
                Color = i.Product.Color,

                SelectedSize = i.SelectedSize,
                SelectedColor = i.SelectedColor,
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