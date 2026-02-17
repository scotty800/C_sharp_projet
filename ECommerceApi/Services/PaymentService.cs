using ECommerceApi.Data;
using ECommerceApi.DTO;
using ECommerceApi.Models;
using ECommerceApi.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Stripe;

namespace ECommerceApi.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly ILogger<PaymentService> _logger;

        public PaymentService(ILogger<PaymentService> logger)
        {
            _logger = logger;
            // ⚠️ Stripe complètement désactivé
        }

        public async Task<PaymentIntent> CreatePaymentIntentAsync(decimal amount, string orderNumber)
        {
            _logger.LogInformation($"💰 SIMULATION: Paiement de {amount}€ pour commande {orderNumber}");

            // Simuler un PaymentIntent réussi
            return await Task.FromResult(new PaymentIntent
            {
                Id = $"pi_mock_{Guid.NewGuid():N}",
                ClientSecret = "cs_mock_secret",
                Amount = (long)(amount * 100),
                Currency = "eur",
                Status = "succeeded"
            });
        }

        public async Task<PaymentIntent> ConfirmPaymentAsync(string paymentIntentId)
        {
            return await Task.FromResult(new PaymentIntent
            {
                Id = paymentIntentId,
                Status = "succeeded"
            });
        }

        public async Task<bool> RefundPaymentAsync(string paymentIntentId)
        {
            return await Task.FromResult(true);
        }

        public async Task<PaymentIntent> GetPaymentIntentAsync(string paymentIntentId)
        {
            return await Task.FromResult(new PaymentIntent
            {
                Id = paymentIntentId,
                Status = "succeeded"
            });
        }
    }
}