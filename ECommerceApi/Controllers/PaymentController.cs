using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ECommerceApi.Services;
using ECommerceApi.DTO;
using ECommerceApi.Models;
using System.Security.Claims;

[ApiController]
[Route("api/payments")]
[Authorize]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;   
    private readonly IOrderService _orderService;

    public PaymentController(IPaymentService paymentService, IOrderService orderService)
    {
        _paymentService = paymentService;
        _orderService = orderService;
    }

    [HttpPost("create-intent")]
    public async Task<IActionResult> CreatePaymentIntent([FromBody] CreatePaymentIntentDto intentDto)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            // ✅ CORRIGÉ : intentDto au lieu de confirmDto
            var order = await _orderService.GetOrderByIdAsync(intentDto.OrderId);

            if (order == null || order.UserId != userId)
                return NotFound("Commande non trouvée");
            
            var paymentIntent = await _paymentService.CreatePaymentIntentAsync(
                order.FinalAmount,
                order.OrderNumber
            );

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
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [HttpPost("confirm")]
    public async Task<IActionResult> ConfirmPayment([FromBody] ConfirmPaymentDto confirmDto)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var order = await _orderService.GetOrderByIdAsync(confirmDto.OrderId);
            
            if (order == null || order.UserId != userId)
                return NotFound("Commande non trouvée");
                
            var paymentIntent = await _paymentService.ConfirmPaymentAsync(confirmDto.PaymentIntentId);
            
            if (paymentIntent.Status == "succeeded")
            {
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
                    status = "succeeded"
                });
            }
            return Ok(new
            {
                message = "Paiement en attente",
                status = paymentIntent.Status
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{orderId}/refund")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RefundPayment(int orderId, [FromBody] RefundRequestDto refundDto)
    {
        try
        {
            var order = await _orderService.GetOrderByIdAsync(orderId);  
            if (order == null)
                return NotFound("Commande non trouvée");

            if (string.IsNullOrEmpty(order.PaymentIntentId))
                return BadRequest("Aucun paiement associé à cette commande");

            var refunded = await _paymentService.RefundPaymentAsync(order.PaymentIntentId);

            if (refunded)
            {
                await _orderService.UpdatePaymentStatusAsync(orderId, PaymentStatus.Refunded);
                await _orderService.UpdateOrderStatusAsync(orderId, OrderStatus.Refunded);

                 return Ok(new { message = "Remboursement effectué avec succès" });
            }

            return BadRequest("Échec du remboursement");
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("intent/{paymentIntentId}")]
    public async Task<IActionResult> GetPaymentIntent(string paymentIntentId)
    {
        try
        {
            var paymentIntent = await _paymentService.GetPaymentIntentAsync(paymentIntentId);
            return Ok(paymentIntent);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}