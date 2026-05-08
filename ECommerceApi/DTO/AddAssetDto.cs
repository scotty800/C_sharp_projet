using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace ECommerceApi.DTO
{
    public class AddAssetDto
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public IFormFile? File { get; set; }
        public string? Url { get; set; }
        public bool IsPremium { get; set; } = false;
        public int Price { get; set; } = 0;
        public string? License { get; set; }
    }

    public class RenameAssetDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
    }
}