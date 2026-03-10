using Microsoft.AspNetCore.Mvc;
using Stripe;
using ECommerceApi.Services;
using ECommerceApi.Settings;
using ECommerceApi.Models;
using Microsoft.Extensions.Options;

namespace ECommerceApi.Controllers
{
    [ApiController]
    [Route("api/stripe/webhook")]
    public class StripeWebhookController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly StripeSettings _stripeSettings;
        private readonly ILogger<StripeWebhookController> _logger;

        public StripeWebhookController(
            IOrderService orderService, 
            IOptions<StripeSettings> stripeSettings,
            ILogger<StripeWebhookController> logger)
        {
            _orderService = orderService;
            _stripeSettings = stripeSettings.Value;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> HandleWebhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            
            try
            {
                var stripeEvent = EventUtility.ConstructEvent(
                    json,
                    Request.Headers["Stripe-Signature"],
                    _stripeSettings.WebhookSecret
                );

                _logger.LogInformation($"📡 Webhook reçu: {stripeEvent.Type}");

                switch (stripeEvent.Type)
                {
                    case "payment_intent.succeeded":
                        var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
                        if (paymentIntent != null)
                            await HandlePaymentIntentSucceeded(paymentIntent);
                        break;

                    case "payment_intent.payment_failed":
                        var failedPayment = stripeEvent.Data.Object as PaymentIntent;
                        if (failedPayment != null)
                            await HandlePaymentIntentFailed(failedPayment);
                        break;

                    case "charge.refunded":
                        var refund = stripeEvent.Data.Object as Charge;
                        if (refund != null)
                            await HandleRefund(refund);
                        break;
                }

                return Ok();
            }
            catch (StripeException ex)
            {
                _logger.LogError($"❌ Erreur webhook: {ex.Message}");
                return BadRequest();
            }
        }

        private async Task HandlePaymentIntentSucceeded(PaymentIntent paymentIntent)
        {
            if (paymentIntent?.Metadata == null || !paymentIntent.Metadata.ContainsKey("order_number"))
            {
                _logger.LogWarning("⚠️ Webhook reçu sans order_number dans les metadata");
                return;
            }

            var orderNumber = paymentIntent.Metadata["order_number"];
            _logger.LogInformation($"✅ Paiement réussi pour commande {orderNumber}");
            
            await _orderService.UpdatePaymentStatusAsync(orderNumber, PaymentStatus.Paid);
            await _orderService.UpdateOrderStatusAsync(orderNumber, OrderStatus.Processing);
        }

        private async Task HandlePaymentIntentFailed(PaymentIntent paymentIntent)
        {
            if (paymentIntent?.Metadata == null || !paymentIntent.Metadata.ContainsKey("order_number"))
            {
                _logger.LogWarning("⚠️ Webhook reçu sans order_number dans les metadata");
                return;
            }

            var orderNumber = paymentIntent.Metadata["order_number"];
            _logger.LogWarning($"❌ Paiement échoué pour commande {orderNumber}");
            
            await _orderService.UpdatePaymentStatusAsync(orderNumber, PaymentStatus.Failed);
        }

        private async Task HandleRefund(Charge refund)
        {
            var paymentIntentId = refund?.PaymentIntentId;
            if (string.IsNullOrEmpty(paymentIntentId))
            {
                _logger.LogWarning("⚠️ Webhook de remboursement sans PaymentIntentId");
                return;
            }

            _logger.LogInformation($"💰 Remboursement pour {paymentIntentId}");
            
            // Récupérer la commande via paymentIntentId
            var order = await _orderService.GetOrderByPaymentIntentId(paymentIntentId);
            if (order != null)
            {
                await _orderService.UpdateOrderStatusAsync(order.OrderNumber, OrderStatus.Refunded);
                _logger.LogInformation($"✅ Commande {order.OrderNumber} marquée comme remboursée");
            }
            else
            {
                _logger.LogWarning($"⚠️ Aucune commande trouvée pour le paymentIntent {paymentIntentId}");
            }
        }
    }
}