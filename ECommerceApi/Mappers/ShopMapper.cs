using ECommerceApi.DTO;
using ECommerceApi.Models;

namespace ECommerceApi.Mappers
{
    public static class ShopMapper
    {
        public static ShopResponseDto ToDto(Shop shop)
        {
            return new ShopResponseDto
            {
                Id = shop.Id,
                Name = shop.Name,
                Slug = shop.Slug,
                ProductCount = shop.Products?.Count ?? 0,
                OwnerId = shop.OwnerId,
                OwnerUsername = shop.Owner?.Username // remplace Username par la vraie propriété
            };
        }

        public static List<ShopResponseDto> ToDtoList(List<Shop> shops)
        {
            return shops.Select(s => ToDto(s)).ToList();
        }
    }
}
