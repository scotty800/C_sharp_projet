using System.ComponentModel.DataAnnotations;

namespace ECommerceApi.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash  { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = "User";

        public ICollection<Shop> Shops { get; set; } = new List<Shop>();
    }
}
