using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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

        public string? ImageUrl { get; set; } 

        [MaxLength(500)]
        public string? Description { get; set; }

        public string? Size { get; set; }  

        public string? Color { get; set; }
        
        public string? Category { get; set; }

        public int? ShopId { get; set; }

        [ForeignKey(nameof(ShopId))]
        public Shop? Shop { get; set; }

        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}