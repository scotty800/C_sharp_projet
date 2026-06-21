using System.ComponentModel.DataAnnotations;

namespace ECommerceApi.DTO
{
    public class UpdateProductDto
    {
        [Required]
        [StringLength(100, MinimumLength = 3)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Le prix doit être supérieur à 0")]
        public decimal Price { get; set; }

        [Required]
        [Range(0, int.MaxValue, ErrorMessage = "Le stock doit être un nombre positif")]
        public int Stock { get; set; }

        public List<string>? Size { get; set; }

        public List<string>? Color { get; set; }

        [Required]
        public string Category { get; set; } = string.Empty;
    }
}