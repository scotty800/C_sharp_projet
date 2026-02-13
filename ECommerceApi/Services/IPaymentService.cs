using ECommerceApi.DTO;
using ECommerceApi.Models;
using Stripe;
using System.Threading.Tasks;

namespace ECommerceApi.Services  // ← Vérifie que c'est bien ce namespace
{
    public interface IPaymentService
    {
        Task<PaymentIntent> CreatePaymentIntentAsync(decimal amount, string orderNumber);
        Task<PaymentIntent> ConfirmPaymentAsync(string paymentIntentId);
        Task<bool> RefundPaymentAsync(string paymentIntentId);
        Task<PaymentIntent> GetPaymentIntentAsync(string paymentIntentId);
    }
}