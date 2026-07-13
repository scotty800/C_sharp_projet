using System.ComponentModel.DataAnnotations;

namespace ECommerceApi.Models
{
    // ⭐ Ce n'est PAS une commande. C'est un brouillon éphémère qui capture
    // l'adresse + un instantané du panier au moment où le client passe au paiement.
    // Jamais visible par le vendeur, jamais dans "Mes commandes".
    public class CheckoutSession
    {
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        public string? PaymentIntentId { get; set; }

        public string ShippingAddress { get; set; } = string.Empty;
        public string ShippingCity { get; set; } = string.Empty;
        public string ShippingPostalCode { get; set; } = string.Empty;
        public string ShippingCountry { get; set; } = string.Empty;

        public string BillingAddress { get; set; } = string.Empty;
        public string BillingCity { get; set; } = string.Empty;
        public string BillingPostalCode { get; set; } = string.Empty;
        public string BillingCountry { get; set; } = string.Empty;

        public string? Notes { get; set; }

        public decimal TaxAmount { get; set; }
        public decimal ShippingCost { get; set; }

        // JSON: [{ "ProductId": 1, "Quantity": 2, "UnitPrice": 19.99 }]
        public string CartSnapshotJson { get; set; } = "[]";

        // JSON: [{ "ShopId": 1, "ShippingMethodName": "...", "ShippingCost": 5, "Subtotal": 50, "MinDays": 2, "MaxDays": 5 }]
        public string ShippingBreakdownJson { get; set; } = "[]";

        public bool IsFinalized { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}