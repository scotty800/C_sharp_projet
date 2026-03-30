using Microsoft.Extensions.Options;
using Stripe;
using ECommerceApi.Settings;

namespace ECommerceApi.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly StripeSettings _stripeSettings;
        private readonly ILogger<PaymentService> _logger;

        public PaymentService(IOptions<StripeSettings> stripeSettings, ILogger<PaymentService> logger)
        {
            _stripeSettings = stripeSettings.Value;
            _logger = logger;

            // Initialiser Stripe avec la clé secrète
            StripeConfiguration.ApiKey = _stripeSettings.SecretKey;
        }

        public async Task<PaymentIntent> CreatePaymentIntentAsync(decimal amount, string orderNumber)
        {
            try
            {
                _logger.LogInformation($"💰 Création d'un PaymentIntent pour commande {orderNumber}, montant: {amount}€");

                var options = new PaymentIntentCreateOptions
                {
                    Amount = (long)(amount * 100), // Convertir en centimes
                    Currency = "eur",
                    Metadata = new Dictionary<string, string>
                    {
                        { "order_number", orderNumber }
                    },
                    // Méthodes de paiement acceptées
                    PaymentMethodTypes = new List<string>
                    {
                        "card",      // Cartes bancaires
                        "paypal",    // PayPal (si activé dans ton dashboard)
                        "bancontact", // Bancontact (Belgique)
                        "ideal"      // iDEAL (Pays-Bas)
                    },
                    // Pour les tests 3D Secure
                    PaymentMethodOptions = new PaymentIntentPaymentMethodOptionsOptions
                    {
                        Card = new PaymentIntentPaymentMethodOptionsCardOptions
                        {
                            RequestThreeDSecure = "automatic"
                        }
                    }
                };

                var service = new PaymentIntentService();
                var paymentIntent = await service.CreateAsync(options);

                _logger.LogInformation($"✅ PaymentIntent créé: {paymentIntent.Id}");

                return paymentIntent;
            }
            catch (StripeException ex)
            {
                _logger.LogError($"❌ Erreur Stripe: {ex.Message}");
                throw new Exception($"Erreur de paiement: {ex.Message}");
            }
        }

        public async Task<PaymentIntent> ConfirmPaymentAsync(string paymentIntentId)
        {
            try
            {
                var service = new PaymentIntentService();
                var paymentIntent = await service.ConfirmAsync(paymentIntentId);

                _logger.LogInformation($"✅ Paiement confirmé: {paymentIntentId} - Statut: {paymentIntent.Status}");

                return paymentIntent;
            }
            catch (StripeException ex)
            {
                _logger.LogError($"❌ Erreur confirmation: {ex.Message}");
                throw new Exception($"Erreur de confirmation: {ex.Message}");
            }
        }

        public async Task<bool> RefundPaymentAsync(string paymentIntentId, decimal? amount = null)
        {
            try
            {
                var options = new RefundCreateOptions
                {
                    PaymentIntent = paymentIntentId,
                    Reason = "requested_by_customer"
                };

                // Si un montant partiel est spécifié
                if (amount.HasValue)
                {
                    options.Amount = (long)(amount.Value * 100);
                }

                var service = new RefundService();
                var refund = await service.CreateAsync(options);

                _logger.LogInformation($"💰 Remboursement effectué pour {paymentIntentId} - Statut: {refund.Status}");

                return refund.Status == "succeeded";
            }
            catch (StripeException ex)
            {
                _logger.LogError($"❌ Erreur remboursement: {ex.Message}");
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
            catch (StripeException ex)
            {
                _logger.LogError($"❌ Erreur récupération: {ex.Message}");
                throw new Exception($"Erreur de récupération: {ex.Message}");
            }
        }
    }
}