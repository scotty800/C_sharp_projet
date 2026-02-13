using ECommerceApi.Data;
using ECommerceApi.DTO;
using ECommerceApi.Models;
using ECommerceApi.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Stripe;

public class PaymentService : IPaymentService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<PaymentService> _logger;

    public PaymentService(IConfiguration configuration, ILogger<PaymentService> logger)
    {
        _configuration = configuration;
        _logger = logger;

        StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
    }

    public async Task<PaymentIntent> CreatePaymentIntentAsync(decimal amount, string orderNumber)
    {
        try
        {
            var options = new PaymentIntentCreateOptions
            {
                Amount = (long)(amount * 100),
                Currency = "eur",
                Metadata = new Dictionary<string, string>
                {
                    { "order_number", orderNumber }
                },
                AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                {
                    Enabled = true,
                },
            };

            var service = new PaymentIntentService();
            var paymentIntent  = await service.CreateAsync(options);

            _logger.LogInformation($"PaymentIntent créé: {paymentIntent.Id} pour la commande {orderNumber}");

            return paymentIntent;
        }
        catch (StripeException ex)
        {
            _logger.LogError(ex, $"Erreur Stripe lors de la création du PaymentIntent pour {orderNumber}");
                throw new Exception($"Erreur de paiement: {ex.Message}");
        }
    }

    public async Task<PaymentIntent> ConfirmPaymentAsync(string paymentIntentId)
    {
        try
        {
            var service = new PaymentIntentService();
            var paymentIntent  = await service.ConfirmAsync(paymentIntentId);
            
            _logger.LogInformation($"Paiement confirmé: {paymentIntentId}");
            
            return paymentIntent;
        }
        catch (StripeException ex)
        {
            _logger.LogError(ex, $"Erreur Stripe lors de la confirmation du paiement {paymentIntentId}");
                throw new Exception($"Erreur de confirmation: {ex.Message}");
        }
        
    }

    public async Task<bool> RefundPaymentAsync(string paymentIntentId)
    {
        try
        {
            var options = new RefundCreateOptions
            {
                PaymentIntent = paymentIntentId
            };

            var service = new RefundService();
            var refund = await service.CreateAsync(options);

            _logger.LogInformation($"Remboursement effectué pour {paymentIntentId}");

            return refund.Status == "succeeded";
        }
        catch (StripeException ex)
        {
            _logger.LogError(ex, $"Erreur Stripe lors du remboursement {paymentIntentId}");
                throw new Exception($"Erreur de remboursement: {ex.Message}");
        }
    }

    public async Task<PaymentIntent> GetPaymentIntentAsync(string paymentIntentId)
    {
        try
        {
            var service = new PaymentIntentService();
            return await service.GetAsync(paymentIntentId);
        }
        catch (StripeException  ex)
        {
            _logger.LogError(ex, $"Erreur Stripe lors de la récupération du PaymentIntent {paymentIntentId}");
                throw new Exception($"Erreur de récupération: {ex.Message}");
        }
    }

}