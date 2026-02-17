using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace ECommerceApi.DTO
{
    public class ProductImageUploadDto
    {
        [Required]
        public int ProductId { get; set; }

        public IFormFile? Image1 { get; set; }
        public IFormFile? Image2 { get; set; }
        public IFormFile? Image3 { get; set; }
    }
}