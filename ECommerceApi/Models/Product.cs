using System.ComponentModel.DataAnnotations;

namespace ECommerceApi.Models
{
    public class Product
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Range(0.01, 1000)]
        public decimal Price { get; set; } 

        [Range(0, 1000)]
        public int Stock { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public string? Size { get; set; }  

        public string? Color { get; set; }
        
        public string? Category { get; set; }
    }
}