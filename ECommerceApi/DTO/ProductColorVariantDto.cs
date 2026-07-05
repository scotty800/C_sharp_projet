using System.ComponentModel.DataAnnotations;

namespace ECommerceApi.DTO
{
    public class ProductColorVariantDto
    {
        public int? Id { get; set; }
        public string Color { get; set; } = string.Empty;
        public string? CustomName { get; set; }
        public int? Stock { get; set; }
        public List<string>? Sizes { get; set; }   // ⭐ renommé (était Size)
        public string? ImageUrl1 { get; set; }
        public string? ImageUrl2 { get; set; }
        public string? ImageUrl3 { get; set; }
    }

    public class UpsertColorVariantDto
    {
        [Required]
        public string Color { get; set; } = string.Empty;
        public string? CustomName { get; set; }
        public int? Stock { get; set; }
        public List<string>? Sizes { get; set; }   // ⭐ renommé (était Size)
    }
}