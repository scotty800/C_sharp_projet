using ECommerceApi.DTO;
using ECommerceApi.Models;
using Stripe;

namespace ECommerceApi.Services
{
    public interface IPaymentService
    {
        Task<PaymentIntent> CreatePaymentIntentAsync(decimal amount, string orderNumber);
        Task<PaymentIntent> ConfirmPaymentAsync(string paymentIntentId);
        Task<bool> RefundPaymentAsync(string paymentIntentId);
        Task<PaymentIntent> GetPaymentIntentAsync(string paymentIntentId);
    }
}