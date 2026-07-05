using System;
using System.ComponentModel.DataAnnotations;

namespace ECommerceApi.DTO
{
    public class ProductResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public List<string>? Size { get; set; }
        public List<string>? Color { get; set; }
        public string? Category { get; set; }
        public int? ShopId { get; set; }
        public string? ShopName { get; set; }

        // ✅ Propriétés d'images
        public string? ImageUrl { get; set; }
        public string? ImageUrl1 { get; set; }
        public string? ImageUrl2 { get; set; }
        public string? ImageUrl3 { get; set; }

        public List<ProductColorVariantDto>? Variants { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}