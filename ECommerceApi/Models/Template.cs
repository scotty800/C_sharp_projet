using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ECommerceApi.Models
{
    public class Template
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        public string Category { get; set; } = "general";
        public string? ThumbnailUrl { get; set; }
        public string? PreviewUrl { get; set; }

        public string ConfigurationJson { get; set; } = "{}";

        public bool IsPremium { get; set; } = false;
        public int Price { get; set; } = 0;
        public int UsageCount { get; set; } = 0;
        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = "admin";
    }
}