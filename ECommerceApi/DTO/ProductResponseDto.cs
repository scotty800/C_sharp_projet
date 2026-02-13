using System;
using System.ComponentModel.DataAnnotations;

namespace ECommerceApi.DTO
{
    public class ProductResponseDto
    {
        public int Id { get; set; }           // <- Ici on a l'Id
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string? Size { get; set; }
        public string? Color { get; set; }
        public string? Category { get; set; }
        public int? ShopId { get; set; }
        public string? ShopName { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
