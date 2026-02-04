using System.ComponentModel.DataAnnotations;

namespace ECommerceApi.DTO
{
    public class UpdateUserRequest
    {
        [Required]
        public string Username { get; set; } = string.Empty; // Initialisation par défaut

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty; // Initialisation par défaut

        public string? Password { get; set; } // Nullable si optionnel

        [Required]
        public string Role { get; set; } = "User"; // Initialisation par défaut
    }
}