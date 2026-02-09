using System.ComponentModel.DataAnnotations;

namespace ECommerceApi.DTO
{
    public class CreateProductDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Range(0.01, 1000)]
        public decimal Price { get; set; }

        [Required]
        [Range(0, 1000)]
        public int Stock { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public string? Size { get; set; }

        public string? Color { get; set; }
        
        public string? Category { get; set; }

        public int? ShopId { get; set; }
        public string? ShopName { get; set; }

    }
}