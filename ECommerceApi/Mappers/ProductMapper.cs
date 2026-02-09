using ECommerceApi.DTO;
using ECommerceApi.Models;

namespace ECommerceApi.Mappers
{
    public static class ProductMapper
    {
        public static ProductResponseDto ToDto(Product product)
        {
            return new ProductResponseDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                Stock = product.Stock,
                Size = product.Size,
                Color = product.Color,
                Category = product.Category,
                ShopId = product.ShopId,
                ShopName = product.Shop?.Name,
                CreatedAt = product.CreatedAt
            };
        }
    }
}
