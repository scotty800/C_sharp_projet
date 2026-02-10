namespace ECommerceApi.Models
{
    public class Cart
    {
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public ICollection<CartItem> Items { get; set; } = new List<CartItem>();

        public decimal TotalAmount => Items.Sum(item => item.Quantity * item.Product.Price);

        public int TotalItems => Items.sum(item => item.Quantity);

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class CartItem
    {
        public int Id { get; set; }

        [required]
        public int CartId { get; set; }
        public Cart car { get; set; } = null!;

        [Required]
        public int ProductId { get; set; }
        public Product Product { get; set; } = null!;

        [Required]
        [range(1, 100)]
        public int Quantity { get; set; }

        public DateTime AddeAt { get; set; } = DateTime.UtcNow;
    }
}