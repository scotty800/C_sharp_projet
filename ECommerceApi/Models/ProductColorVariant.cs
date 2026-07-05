// Models/ProductColorVariant.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ECommerceApi.Models
{
    public class ProductColorVariant
    {
        public int Id { get; set; }

        [Required]
        public int ProductId { get; set; }

        [ForeignKey(nameof(ProductId))]
        public Product? Product { get; set; }

        // ⭐ Valeur couleur (hex ou nom) — doit matcher une entrée de Product.Color
        [Required]
        [MaxLength(50)]
        public string Color { get; set; } = string.Empty;

        // ⭐ Nom personnalisé (facultatif) — sinon fallback sur Product.Name
        [MaxLength(100)]
        public string? CustomName { get; set; }

        public int? Stock { get; set; } // null = hérite du stock produit

        public List<string>? Size { get; set; } // null = hérite des tailles produit

        public string? ImageUrl1 { get; set; }
        public string? ImageUrl2 { get; set; }
        public string? ImageUrl3 { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}