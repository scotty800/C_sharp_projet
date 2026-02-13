using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace ECommerceApi.DTO
{
   public class ShopResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public int ProductCount { get; set; }
    public int OwnerId { get; set; }
    public string? OwnerUsername { get; set; } // <- nom ou username du propriétaire
}

}
