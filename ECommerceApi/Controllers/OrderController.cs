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
    private readonly IInvoiceService _invoiceService;
    private readonly ILogger<OrderController> _logger;

    public OrderController(
        IOrderService orderService,
        ICartService cartService,
        IInvoiceService invoiceService,
        ILogger<OrderController> logger)
    {
        _orderService = orderService;
        _cartService = cartService;
        _invoiceService = invoiceService;
        _logger = logger;
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
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ⭐ MODIFICATION — GetMyOrders avec ShopSlug
    [HttpGet("my-orders")]
    [Authorize]
    public async Task<IActionResult> GetMyOrders()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var orders = await _orderService.GetUserOrdersAsync(userId);

        _logger.LogInformation($"📦 Récupération {orders.Count} commandes pour userId: {userId}");

        var orderDtos = orders.Select(o => new OrderResponseDto
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            UserId = o.UserId,
            Username = o.User?.Username ?? "",
            UserEmail = o.User?.Email ?? "",
            Status = o.Status,
            PaymentStatus = o.PaymentStatus,
            PaymentMethod = o.PaymentMethod,
            TotalAmount = o.TotalAmount,
            TaxAmount = o.TaxAmount,
            ShippingCost = o.ShippingCost,
            DiscountAmount = o.DiscountAmount,
            FinalAmount = o.FinalAmount,
            ShippingAddress = o.ShippingAddress,
            ShippingCity = o.ShippingCity,
            ShippingPostalCode = o.ShippingPostalCode,
            ShippingCountry = o.ShippingCountry,
            BillingAddress = o.BillingAddress,
            BillingCity = o.BillingCity,
            BillingPostalCode = o.BillingPostalCode,
            BillingCountry = o.BillingCountry,
            PaymentIntentId = o.PaymentIntentId,
            TrackingNumber = o.TrackingNumber,
            CreatedAt = o.CreatedAt,
            PaidAt = o.PaidAt,
            ShippedAt = o.ShippedAt,
            DeliveredAt = o.DeliveredAt,
            Items = o.Items.Select(i =>
            {
                var imageUrl = i.Product?.ImageUrl 
                    ?? i.Product?.ImageUrl1 
                    ?? i.Product?.ImageUrl2 
                    ?? i.Product?.ImageUrl3;

                return new OrderItemDto
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductName = i.Product?.Name ?? "",
                    ProductImage = imageUrl,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    TotalPrice = i.TotalPrice,
                    ShopId = i.Product?.ShopId,
                    ShopName = i.Product?.Shop?.Name,
                    ShopSlug = i.Product?.Shop?.Slug,   // ⭐ AJOUT
                    IsReviewed = i.IsReviewed,
                    SelectedColor = i.SelectedColor,
                    SelectedSize = i.SelectedSize
                };
            }).ToList()
        }).ToList();

        return Ok(orderDtos);
    }

    // ⭐ MODIFICATION — GetOrderById avec ShopSlug
    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetOrderById(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
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
                ProductImage = i.Product?.ImageUrl 
                    ?? i.Product?.ImageUrl1 
                    ?? i.Product?.ImageUrl2 
                    ?? i.Product?.ImageUrl3,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                TotalPrice = i.TotalPrice,
                ShopId = i.Product?.ShopId,
                ShopName = i.Product?.Shop?.Name,
                ShopSlug = i.Product?.Shop?.Slug,   // ⭐ AJOUT
                IsReviewed = i.IsReviewed,
                SelectedColor = i.SelectedColor,
                SelectedSize = i.SelectedSize
            }).ToList()
        };

        return Ok(orderDto);
    }

    [HttpGet("number/{orderNumber}")]
    [Authorize]
    public async Task<IActionResult> GetOrderByNumber(string orderNumber)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var orderDto = await _orderService.GetOrderByNumberAsync(orderNumber);

        if (orderDto == null)
            return NotFound("Commande non trouvée");

        if (orderDto.UserId != userId && !User.IsInRole("Admin"))
            return Unauthorized("Vous n'êtes pas autorisé à voir cette commande");

        return Ok(orderDto);
    }

    [HttpPut("{id}/cancel")]
    [Authorize]
    public async Task<IActionResult> CancelOrder(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        try
        {
            var cancelled = await _orderService.CancelOrderAsync(id, userId);

            if (!cancelled)
                return BadRequest(new { message = "Impossible d'annuler cette commande. Vérifiez que vous êtes dans le délai de rétractation de 14 jours." });

            return Ok(new { message = "Commande annulée avec succès. Le remboursement sera effectué sous 3-5 jours ouvrés." });
        }
        catch (Exception ex)
        {
            _logger.LogError($"❌ Erreur annulation commande {id}: {ex.Message}");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("shop/{shopId}")]
    [Authorize]
    public async Task<IActionResult> GetShopOrders(int shopId)
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
    [Authorize]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto statusDto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var order = await _orderService.GetOrderByIdAsync(id);

        if (order == null)
            return NotFound(new { message = "Commande non trouvée" });

        var isAdmin = User.IsInRole("Admin");
        var isShopOwner = await _orderService.IsUserShopOwnerAsync(userId, id);

        if (!isAdmin && !isShopOwner)
            return Forbid();

        try
        {
            var updated = await _orderService.UpdateOrderStatusAsync(id, statusDto.Status);

            if (!updated)
                return NotFound(new { message = "Erreur lors de la mise à jour" });

            _logger.LogInformation($"✅ Commande {id} mise à jour vers {statusDto.Status} par user {userId}");

            return Ok(new { message = $"Statut mis à jour: {statusDto.Status}", status = statusDto.Status });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
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

    // ==================== GESTION DES RETOURS ====================

    [HttpPost("{id}/return-request")]
    [Authorize]
    public async Task<IActionResult> RequestReturn(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var result = await _orderService.RequestReturnAsync(id, userId);

        if (!result)
            return BadRequest(new { message = "Impossible de demander un retour. Vérifiez que la commande est livrée et dans les 14 jours." });

        return Ok(new { message = "Demande de retour envoyée avec succès. Le vendeur va examiner votre demande." });
    }

    [HttpPost("{id}/return-approve")]
    [Authorize]
    public async Task<IActionResult> ApproveReturn(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        var isAdmin = User.IsInRole("Admin");
        var isShopOwner = await _orderService.IsUserShopOwnerAsync(userId, id);

        if (!isAdmin && !isShopOwner)
            return Unauthorized(new { message = "Vous n'êtes pas autorisé à approuver ce retour" });

        var result = await _orderService.ApproveReturnAsync(id);

        if (!result)
            return BadRequest(new { message = "Erreur lors du remboursement. Vérifiez les logs." });

        return Ok(new { message = "Remboursement effectué avec succès. Le client sera notifié." });
    }

    [HttpPost("{id}/return-reject")]
    [Authorize]
    public async Task<IActionResult> RejectReturn(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        var isAdmin = User.IsInRole("Admin");
        var isShopOwner = await _orderService.IsUserShopOwnerAsync(userId, id);

        if (!isAdmin && !isShopOwner)
            return Unauthorized(new { message = "Vous n'êtes pas autorisé à refuser ce retour" });

        var result = await _orderService.RejectReturnAsync(id);

        if (!result)
            return BadRequest(new { message = "Erreur lors du refus de retour" });

        return Ok(new { message = "Demande de retour refusée. Le client sera notifié." });
    }

    [HttpGet("{id}/invoice")]
    [Authorize]
    public async Task<IActionResult> DownloadInvoice(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var order = await _orderService.GetOrderByIdAsync(id);
        if (order == null)
            return NotFound(new { message = "Commande non trouvée" });

        if (order.UserId != userId && !User.IsInRole("Admin"))
            return Unauthorized(new { message = "Vous n'êtes pas autorisé à accéder à cette facture" });

        var orderDto = await _orderService.GetOrderByNumberAsync(order.OrderNumber);
        if (orderDto == null)
            return NotFound(new { message = "Commande non trouvée" });

        var pdfBytes = _invoiceService.GenerateInvoicePdf(orderDto);

        return File(pdfBytes, "application/pdf", $"facture-{orderDto.OrderNumber}.pdf");
    }
}