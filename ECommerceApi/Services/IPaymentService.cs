using ECommerceApi.DTO;
using ECommerceApi.Models;
using Stripe;
using System.Threading.Tasks;

namespace ECommerceApi.Services
{
    public interface IPaymentService
    {
        Task<PaymentIntent> CreatePaymentIntentAsync(decimal amount, string orderNumber);
        Task<PaymentIntent> ConfirmPaymentAsync(string paymentIntentId);
        Task<bool> RefundPaymentAsync(string paymentIntentId, decimal? amount = null);
        Task<PaymentIntent> GetPaymentIntentAsync(string paymentIntentId);
    }
}