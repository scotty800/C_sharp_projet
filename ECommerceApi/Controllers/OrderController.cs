using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ECommerceApi.Services;
using ECommerceApi.DTO;
using ECommerceApi.Models;
using System.Security.Claims;

[ApiController]
[Route("api/orders")]
public class OrderController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly ICartService _cartService;

    public OrderController (IOrderService orderService, ICartService cartService)
    {
        _orderService = orderService;
        _cartService = cartService;  
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto orderDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var cart = await _cartService.GetCartDetailsAsync(userId);
            if (!cart.Items.Any())
                return BadRequest(new { message = "Votre panier est vide" });

            var order = await _orderService.CreateOrderFromCartAsync(userId, orderDto);

            return Ok(new
            {
                message = "Commande créée avec succès",
                orderId = order.Id,
                orderNumber = order.OrderNumber,
                amount = order.FinalAmount,
                paymentIntentId = order.PaymentIntentId
            });
        }
        catch (Exception  ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("my-orders")]
    [Authorize]
    public async Task<IActionResult> GetMyOrders()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var orders = await _orderService.GetUserOrdersAsync(userId);

        var orderDtos = orders.Select(o => new OrderResponseDto
        {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                UserId = o.UserId,
                Username = o.User?.Username ?? "",
                Status = o.Status,
                PaymentStatus = o.PaymentStatus,
                PaymentMethod = o.PaymentMethod,
                TotalAmount = o.TotalAmount,
                FinalAmount = o.FinalAmount,
                CreatedAt = o.CreatedAt,
                Items = o.Items.Select(i => new OrderItemDto
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductName = i.Product?.Name ?? "",
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    TotalPrice = i.TotalPrice,
                    IsReviewed = i.IsReviewed
                }).ToList()
        }).ToList();

        return Ok(orderDtos);
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetOrderById(int id)  // ← paramètre "id"
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        // ✅ CORRIGÉ : utilise "id" au lieu de "orderId"
        var order = await _orderService.GetOrderByIdAsync(id);

        if (order == null)
            return NotFound("Commande non trouvée");
        
        if (order.UserId != userId)
            return Unauthorized("Vous n'êtes pas autorisé à voir cette commande");
        
        var orderDto = new OrderResponseDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            UserId = order.UserId,
            Username = order.User?.Username ?? "",
            UserEmail = order.User?.Email ?? "",
            Status = order.Status,
            PaymentStatus = order.PaymentStatus,
            PaymentMethod = order.PaymentMethod,
            TotalAmount = order.TotalAmount,
            TaxAmount = order.TaxAmount,
            ShippingCost = order.ShippingCost,
            DiscountAmount = order.DiscountAmount,
            FinalAmount = order.FinalAmount,
            ShippingAddress = order.ShippingAddress,
            ShippingCity = order.ShippingCity,
            ShippingPostalCode = order.ShippingPostalCode,
            ShippingCountry = order.ShippingCountry,
            BillingAddress = order.BillingAddress,
            BillingCity = order.BillingCity,
            BillingPostalCode = order.BillingPostalCode,
            BillingCountry = order.BillingCountry,
            
            // ✅ CORRIGÉ : majuscule P (comme dans le DTO)
            PaymentIntentId = order.PaymentIntentId,
            
            TrackingNumber = order.TrackingNumber,
            CreatedAt = order.CreatedAt,
            PaidAt = order.PaidAt,
            ShippedAt = order.ShippedAt,
            DeliveredAt = order.DeliveredAt,
            Items = order.Items.Select(i => new OrderItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.Product?.Name ?? "",
                ProductImage = i.Product?.ImageUrl,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                TotalPrice = i.TotalPrice,
                ShopId = i.Product?.ShopId,
                ShopName = i.Product?.Shop?.Name,
                IsReviewed = i.IsReviewed
            }).ToList()
        };

        return Ok(orderDto);
    }

    [HttpGet("number/{orderNumber}")]
    [Authorize]
    public async Task<IActionResult> GetOrderByNumber(string orderNumber)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var order = await _orderService.GetOrderByNumberAsync(orderNumber);

        if (order == null)
            return NotFound("Commande non trouvée");

        if (order.UserId != userId && !User.IsInRole("Admin"))
            return Unauthorized("Vous n'êtes pas autorisé à voir cette commande");
        
        return Ok(order);
    }

    [HttpPut("{id}/cancel")]
    [Authorize]
    public async Task<IActionResult> CancelOrder(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var cancelled = await _orderService.CancelOrderAsync(id, userId);

        if (!cancelled)
            return BadRequest(new { message = "Impossible d'annuler cette commande" });

        return Ok(new { message = "Commande annulée avec succès" });
    }

    [HttpGet("shop/{shopId}")]
    [Authorize]
    public async Task<IActionResult>  GetShopOrders(int shopId)
    {
        var orders = await _orderService.GetShopOrdersAsync(shopId);

        return Ok(orders);
    }

    [HttpGet("status/{status}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetOrdersByStatus(OrderStatus status)
    {
        var orders = await _orderService.GetOrdersByStatusAsync(status);
        return Ok(orders);
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto statusDto)
    {
        var updated = await _orderService.UpdateOrderStatusAsync(id, statusDto.Status);

        if (!updated)
            return NotFound("Commande non trouvée");
        
        return Ok(new
        {
            message = $"Statut mis à jour: {statusDto.Status}"  // ✅ CORRIGÉ : "Statut" au lieu de "Staut"
        });
    }

    [HttpGet("stats")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetOrderStats()
    {
        var stats = await _orderService.GetOrderStatsAsync(null);
        return Ok(stats);
    }

    [HttpGet("shop/{shopId}/stats")]
    [Authorize]
    public async Task<IActionResult> GetShopOrderStats(int shopId)
    {
        var stats = await _orderService.GetOrderStatsAsync(shopId);
        return Ok(stats);
    }
}