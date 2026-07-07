using ECommerceApi.Data;
using ECommerceApi.DTO;
using ECommerceApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ECommerceApi.Services
{
    public class ShippingService : IShippingService
    {
        private readonly AppDbContext _context;

        public ShippingService(AppDbContext context)
        {
            _context = context;
        }

        // ⭐ MODIFICATION — Correction du tri sur Price (cast en double pour SQLite)
        public async Task<List<ShippingMethodDto>> GetShopMethodsAsync(int shopId)
        {
            return await _context.ShopShippingMethods
                .Where(m => m.ShopId == shopId && m.IsActive)
                .OrderByDescending(m => m.IsDefault)
                .ThenBy(m => (double)m.Price) // ⭐ cast en double : SQLite ne trie pas les decimal nativement
                .Select(m => new ShippingMethodDto
                {
                    Id = m.Id,
                    ShopId = m.ShopId,
                    Name = m.Name,
                    Price = m.Price,
                    FreeThreshold = m.FreeThreshold,
                    MinDays = m.MinDays,
                    MaxDays = m.MaxDays,
                    IsDefault = m.IsDefault,
                    IsActive = m.IsActive,
                })
                .ToListAsync();
        }

        public async Task<ShippingMethodDto> UpsertMethodAsync(int shopId, int userId, UpsertShippingMethodDto dto)
        {
            var shop = await _context.Shops.FirstOrDefaultAsync(s => s.Id == shopId);
            if (shop == null) throw new Exception("Boutique non trouvée");
            if (shop.OwnerId != userId) throw new Exception("Non autorisé");

            ShopShippingMethod method;

            if (dto.Id.HasValue)
            {
                method = await _context.ShopShippingMethods
                    .FirstOrDefaultAsync(m => m.Id == dto.Id.Value && m.ShopId == shopId)
                    ?? throw new Exception("Méthode de livraison non trouvée");
            }
            else
            {
                method = new ShopShippingMethod { ShopId = shopId, CreatedAt = DateTime.UtcNow };
                _context.ShopShippingMethods.Add(method);
            }

            method.Name = dto.Name;
            method.Price = dto.Price;
            method.FreeThreshold = dto.FreeThreshold;
            method.MinDays = dto.MinDays;
            method.MaxDays = dto.MaxDays;
            method.IsActive = dto.IsActive;
            method.UpdatedAt = DateTime.UtcNow;

            if (dto.IsDefault)
            {
                var others = await _context.ShopShippingMethods
                    .Where(m => m.ShopId == shopId && m.Id != method.Id)
                    .ToListAsync();
                others.ForEach(o => o.IsDefault = false);
                method.IsDefault = true;
            }

            await _context.SaveChangesAsync();

            return new ShippingMethodDto
            {
                Id = method.Id,
                ShopId = method.ShopId,
                Name = method.Name,
                Price = method.Price,
                FreeThreshold = method.FreeThreshold,
                MinDays = method.MinDays,
                MaxDays = method.MaxDays,
                IsDefault = method.IsDefault,
                IsActive = method.IsActive,
            };
        }

        public async Task<bool> DeleteMethodAsync(int shopId, int userId, int methodId)
        {
            var shop = await _context.Shops.FirstOrDefaultAsync(s => s.Id == shopId);
            if (shop == null || shop.OwnerId != userId) return false;

            var method = await _context.ShopShippingMethods
                .FirstOrDefaultAsync(m => m.Id == methodId && m.ShopId == shopId);
            if (method == null) return false;

            _context.ShopShippingMethods.Remove(method);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<CartShippingSummaryDto> CalculateCartShippingAsync(int userId)
        {
            var cart = await _context.Carts
                .Include(c => c.Items)
                    .ThenInclude(i => i.Product)
                        .ThenInclude(p => p!.Shop)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            var result = new CartShippingSummaryDto { AllShopsConfigured = true };

            if (cart == null || cart.Items.Count == 0)
                return result;

            var itemsByShop = cart.Items
                .Where(i => i.Product.ShopId.HasValue)
                .GroupBy(i => i.Product.ShopId!.Value);

            foreach (var group in itemsByShop)
            {
                var shopId = group.Key;
                var shopName = group.First().Product.Shop?.Name ?? "Boutique";
                var subtotal = group.Sum(i => i.Quantity * i.Product.Price);

                // ⭐ Cette méthode utilise GetShopMethodsAsync qui a été corrigée
                var methods = await GetShopMethodsAsync(shopId);

                if (methods.Count == 0)
                {
                    result.Breakdown.Add(new ShopShippingBreakdownDto
                    {
                        ShopId = shopId,
                        ShopName = shopName,
                        Subtotal = subtotal,
                        ShippingMethodName = "Non configurée",
                        ShippingCost = 0,
                        HasShippingConfigured = false,
                    });
                    result.AllShopsConfigured = false;
                    continue;
                }

                var method = methods.FirstOrDefault(m => m.IsDefault) ?? methods.First();
                var isFree = method.FreeThreshold.HasValue && subtotal >= method.FreeThreshold.Value;
                var cost = isFree ? 0 : method.Price;

                result.Breakdown.Add(new ShopShippingBreakdownDto
                {
                    ShopId = shopId,
                    ShopName = shopName,
                    Subtotal = subtotal,
                    ShippingMethodName = method.Name,
                    ShippingCost = cost,
                    FreeThreshold = method.FreeThreshold,
                    ProgressTowardFree = method.FreeThreshold.HasValue
                        ? Math.Min(100, (double)(subtotal / method.FreeThreshold.Value) * 100)
                        : null,
                    HasShippingConfigured = true,
                    MinDays = method.MinDays,   // ⭐ AJOUT
                    MaxDays = method.MaxDays,   // ⭐ AJOUT
                });

                result.TotalShipping += cost;
            }

            return result;
        }
    }
}