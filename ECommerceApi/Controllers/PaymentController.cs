using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ECommerceApi.Services;
using ECommerceApi.DTO;
using ECommerceApi.Models;
using System.Security.Claims;
using Stripe;

[ApiController]
[Route("api/payments")]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly IOrderService _orderService;
    private readonly ILogger<PaymentController> _logger;

    public PaymentController(
        IPaymentService paymentService,
        IOrderService orderService,
        ILogger<PaymentController> logger)
    {
        _paymentService = paymentService;
        _orderService = orderService;
        _logger = logger;
    }

    [HttpPost("create-intent")]
    [Authorize]  // ✅ Authentification requise
    public async Task<IActionResult> CreatePaymentIntent([FromBody] CreatePaymentIntentDto intentDto)
    {
        try
        {
            _logger.LogInformation("📤 Création PaymentIntent pour order: {OrderId}", intentDto.OrderId);

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var order = await _orderService.GetOrderByIdAsync(intentDto.OrderId);

            if (order == null || order.UserId != userId)
                return NotFound(new { message = "Commande non trouvée" });

            // ✅ Créer un PaymentIntent SANS payment method
            // Le frontend va ajouter la méthode de paiement via Stripe.js
            var paymentIntent = await _paymentService.CreatePaymentIntentAsync(
                order.FinalAmount,
                order.OrderNumber
            );

            _logger.LogInformation("✅ PaymentIntent créé: {PaymentIntentId}", paymentIntent.Id);

            // Mettre à jour le statut
            await _orderService.UpdatePaymentStatusAsync(
                order.Id,
                PaymentStatus.Pending,
                paymentIntent.Id
            );

            return Ok(new PaymentIntentResponseDto
            {
                Id = paymentIntent.Id,
                ClientSecret = paymentIntent.ClientSecret,
                Amount = paymentIntent.Amount,
                Currency = paymentIntent.Currency,
                Status = paymentIntent.Status
            });
        }
        catch (StripeException ex)
        {
            _logger.LogError("❌ Erreur Stripe: {Message}", ex.Message);
            return BadRequest(new { message = $"Erreur Stripe: {ex.Message}" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Erreur créationPaymentIntent: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("confirm")]
    [Authorize]  // ✅ Authentification requise
    public async Task<IActionResult> ConfirmPayment([FromBody] ConfirmPaymentDto confirmDto)
    {
        try
        {
            _logger.LogInformation("📤 Confirmation paiement: orderId={OrderId}, paymentIntentId={PaymentIntentId}",
                confirmDto.OrderId, confirmDto.PaymentIntentId);

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var order = await _orderService.GetOrderByIdAsync(confirmDto.OrderId);

            if (order == null || order.UserId != userId)
                return NotFound(new { message = "Commande non trouvée" });

            // ✅ Récupérer le PaymentIntent (qui a déjà été confirmé par le frontend)
            // Le frontend a déjà collecté et traité la méthode de paiement
            var paymentIntent = await _paymentService.GetPaymentIntentAsync(confirmDto.PaymentIntentId);

            _logger.LogInformation("📦 PaymentIntent récupéré: status={Status}", paymentIntent.Status);

            if (paymentIntent.Status == "succeeded")
            {
                _logger.LogInformation("✅ Paiement réussi pour commande {OrderId}", confirmDto.OrderId);

                // Mettre à jour le statut de paiement
                await _orderService.UpdatePaymentStatusAsync(
                    confirmDto.OrderId,
                    PaymentStatus.Paid,
                    confirmDto.PaymentIntentId
                );

                // Mettre à jour le statut de la commande
                await _orderService.UpdateOrderStatusAsync(
                    confirmDto.OrderId,
                    OrderStatus.Processing
                );

                return Ok(new
                {
                    message = "Paiement confirmé avec succès",
                    status = "succeeded",
                    orderId = confirmDto.OrderId
                });
            }
            else if (paymentIntent.Status == "requires_payment_method")
            {
                // ❌ Le PaymentIntent attend une méthode de paiement
                _logger.LogWarning("⚠️ PaymentIntent attend une méthode de paiement: {PaymentIntentId}", confirmDto.PaymentIntentId);
                return BadRequest(new
                {
                    message = "Le PaymentIntent attend une méthode de paiement. Veuillez compléter le paiement via Stripe Elements.",
                    status = paymentIntent.Status
                });
            }

            _logger.LogWarning("⚠️ Paiement en attente: {Status}", paymentIntent.Status);
            return Ok(new
            {
                message = $"Paiement en attente (statut: {paymentIntent.Status})",
                status = paymentIntent.Status
            });
        }
        catch (StripeException ex)
        {
            _logger.LogError("❌ Erreur Stripe: {Message}", ex.Message);
            return BadRequest(new { message = $"Erreur Stripe: {ex.Message}" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Erreur confirmation paiement: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{orderId}/refund")]
    [Authorize(Roles = "Admin")]  // ✅ Admin uniquement
    public async Task<IActionResult> RefundPayment(int orderId, [FromBody] RefundRequestDto refundDto)
    {
        try
        {
            _logger.LogInformation("📤 Remboursement pour commande: {OrderId}", orderId);

            var order = await _orderService.GetOrderByIdAsync(orderId);
            if (order == null)
                return NotFound(new { message = "Commande non trouvée" });

            if (string.IsNullOrEmpty(order.PaymentIntentId))
                return BadRequest(new { message = "Aucun paiement associé à cette commande" });

            var refunded = await _paymentService.RefundPaymentAsync(order.PaymentIntentId);

            if (refunded)
            {
                _logger.LogInformation("✅ Remboursement effectué pour commande {OrderId}", orderId);

                await _orderService.UpdatePaymentStatusAsync(orderId, PaymentStatus.Refunded);
                await _orderService.UpdateOrderStatusAsync(orderId, OrderStatus.Refunded);

                return Ok(new { message = "Remboursement effectué avec succès" });
            }

            _logger.LogError("❌ Échec du remboursement pour commande {OrderId}", orderId);
            return BadRequest(new { message = "Échec du remboursement" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Erreur remboursement: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("intent/{paymentIntentId}")]
    [Authorize]  // ✅ Authentification requise
    public async Task<IActionResult> GetPaymentIntent(string paymentIntentId)
    {
        try
        {
            _logger.LogInformation("📤 Récupération PaymentIntent: {PaymentIntentId}", paymentIntentId);

            var paymentIntent = await _paymentService.GetPaymentIntentAsync(paymentIntentId);
            return Ok(paymentIntent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Erreur récupération PaymentIntent: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }
}