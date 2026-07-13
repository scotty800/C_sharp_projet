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
    [Authorize]
    public async Task<IActionResult> CreatePaymentIntent([FromBody] CreatePaymentIntentDto intentDto)
    {
        try
        {
            _logger.LogInformation("📤 Création PaymentIntent pour order: {OrderId}", intentDto.OrderId);

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var order = await _orderService.GetOrderByIdAsync(intentDto.OrderId);

            if (order == null || order.UserId != userId)
                return NotFound(new { message = "Commande non trouvée" });

            var paymentIntent = await _paymentService.CreatePaymentIntentAsync(
                order.FinalAmount,
                order.OrderNumber
            );

            _logger.LogInformation("✅ PaymentIntent créé: {PaymentIntentId}", paymentIntent.Id);

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

    // ⭐ NOUVEAU ENDPOINT — Création d'une session de checkout
    [HttpPost("create-checkout-intent")]
    [Authorize]
    public async Task<IActionResult> CreateCheckoutIntent([FromBody] CreateCheckoutIntentDto dto)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var result = await _orderService.CreateCheckoutSessionAsync(userId, dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Erreur create-checkout-intent");
            return BadRequest(new { message = ex.Message });
        }
    }

    // ⭐ NOUVEAU ENDPOINT — Finalisation de la commande après paiement
    [HttpPost("finalize-order")]
    [Authorize]
    public async Task<IActionResult> FinalizeOrder([FromBody] FinalizeOrderDto dto)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var order = await _orderService.FinalizeOrderAsync(userId, dto.PaymentIntentId);
            return Ok(new { orderId = order.Id, orderNumber = order.OrderNumber });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Erreur finalize-order");
            return BadRequest(new { message = ex.Message });
        }
    }

    // ⭐ ENDPOINT SUPPRIMÉ — GetPendingOrder n'est plus utilisé
    /*
    [HttpGet("pending-order")]
    [Authorize]
    public async Task<IActionResult> GetPendingOrder()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var order = await _orderService.GetPendingUnpaidOrderAsync(userId);

        if (order == null || string.IsNullOrEmpty(order.PaymentIntentId))
            return Ok(new { hasPendingOrder = false });

        try
        {
            var paymentIntent = await _paymentService.GetPaymentIntentAsync(order.PaymentIntentId);

            if (paymentIntent.Status == "succeeded")
            {
                await _orderService.UpdatePaymentStatusAsync(order.Id, PaymentStatus.Paid, order.PaymentIntentId);
                return Ok(new { hasPendingOrder = false, alreadyPaid = true, orderId = order.Id });
            }

            if (paymentIntent.Status == "canceled")
                return Ok(new { hasPendingOrder = false });

            return Ok(new
            {
                hasPendingOrder = true,
                orderId = order.Id,
                orderNumber = order.OrderNumber,
                clientSecret = paymentIntent.ClientSecret,
                amount = order.FinalAmount
            });
        }
        catch (StripeException)
        {
            return Ok(new { hasPendingOrder = false });
        }
    }
    */

    [HttpPost("confirm")]
    [Authorize]
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

            var paymentIntent = await _paymentService.GetPaymentIntentAsync(confirmDto.PaymentIntentId);

            _logger.LogInformation("📦 PaymentIntent récupéré: status={Status}", paymentIntent.Status);

            if (paymentIntent.Status == "succeeded")
            {
                _logger.LogInformation("✅ Paiement réussi pour commande {OrderId}", confirmDto.OrderId);

                await _orderService.UpdatePaymentStatusAsync(
                    confirmDto.OrderId,
                    PaymentStatus.Paid,
                    confirmDto.PaymentIntentId
                );

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
    [Authorize(Roles = "Admin")]
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
    [Authorize]
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