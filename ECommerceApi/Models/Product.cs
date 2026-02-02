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
    }
}