using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ECommerceApi.Models
{
    public class CustomizationSnapshot
    {
        public int Id { get; set; }

        [Required]
        public int ShopId { get; set; }
        [ForeignKey(nameof(ShopId))]
        public Shop Shop { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public string ConfigurationJson { get; set; } = "{}";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}