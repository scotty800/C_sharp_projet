using ECommerceApi.Data;
using ECommerceApi.DTO;
using ECommerceApi.Models;
using ECommerceApi.Services;
using Microsoft.EntityFrameworkCore;

namespace ECommerceApi.Services
{
    public class OrderService : IOrderService
    {
        private readonly AppDbContext _context;
        private readonly ICartService _cartService;
        private readonly IProductService _productService;
        private readonly IPaymentService _paymentService;
        private readonly ILogger<OrderService> _logger;

        public OrderService(
            AppDbContext context,
            ICartService cartService,
            IProductService productService,
            IPaymentService paymentService,
            ILogger<OrderService> logger)
        {
            _context = context;
            _cartService = cartService;
            _productService = productService;
            _paymentService = paymentService;
            _logger = logger;
        }

        public async Task<Order> CreateOrderFromCartAsync(int userId, CreateOrderDto orderDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1. Récupérer le panier
                var cart = await _cartService.GetCartDetailsAsync(userId);
                if (!cart.Items.Any())
                    throw new Exception("Le panier est vide");

                // 2. Vérifier le stock
                foreach (var item in cart.Items)
                {
                    var product = await _productService.GetProductByIdAsync(item.ProductId);

                    if (product == null)
                        throw new Exception($"Produit {item.ProductId} non trouvé");

                    if (product.Stock < item.Quantity)
                        throw new Exception($"Stock insuffisant pour {product.Name}. Disponible: {product.Stock}, Demandé: {item.Quantity}");
                }

                // 3. Générer le numéro de commande
                var orderNumber = GenerateOrderNumber();

                // 4. Créer la commande
                var order = new Order
                {
                    OrderNumber = orderNumber,
                    UserId = userId,
                    Status = OrderStatus.Pending,
                    PaymentStatus = PaymentStatus.Pending,
                    PaymentMethod = orderDto.PaymentMethod,
                    TotalAmount = cart.TotalAmount,
                    TaxAmount = orderDto.TaxAmount,
                    ShippingCost = orderDto.ShippingCost,
                    DiscountAmount = orderDto.DiscountAmount,
                    ShippingAddress = orderDto.ShippingAddress,
                    ShippingCity = orderDto.ShippingCity,
                    ShippingPostalCode = orderDto.ShippingPostalCode,
                    ShippingCountry = orderDto.ShippingCountry,
                    BillingAddress = orderDto.BillingAddress ?? orderDto.ShippingAddress,
                    BillingCity = orderDto.BillingCity ?? orderDto.ShippingCity,
                    BillingPostalCode = orderDto.BillingPostalCode ?? orderDto.ShippingPostalCode,
                    BillingCountry = orderDto.BillingCountry ?? orderDto.ShippingCountry,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                // 5. Ajouter les items et mettre à jour le stock
                foreach (var item in cart.Items)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product != null)
                    {
                        product.Stock -= item.Quantity;

                        var orderItem = new OrderItem
                        {
                            OrderId = order.Id,
                            ProductId = item.ProductId,
                            Quantity = item.Quantity,
                            UnitPrice = item.ProductPrice
                        };
                        _context.OrderItems.Add(orderItem);
                    }
                }

                await _context.SaveChangesAsync();

                // 6. Vider le panier
                await ClearCartDirectly(userId);

                // 7. Paiement avec Stripe (si ce n'est pas du cash à la livraison)
                if (orderDto.PaymentMethod != PaymentMethod.CashOnDelivery)
                {
                    try
                    {
                        _logger.LogInformation($"💰 Création du paiement Stripe pour la commande {order.OrderNumber}");
                        
                        var paymentIntent = await _paymentService.CreatePaymentIntentAsync(order.FinalAmount, order.OrderNumber);
                        order.PaymentIntentId = paymentIntent.Id;
                        await _context.SaveChangesAsync();
                        
                        _logger.LogInformation($"✅ PaymentIntent créé: {paymentIntent.Id} pour commande {order.OrderNumber}");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError($"❌ Erreur paiement: {ex.Message}");
                        throw new Exception($"Erreur lors de la création du paiement: {ex.Message}");
                    }
                }
                else
                {
                    // Pour le cash à la livraison, pas de paiement Stripe
                    _logger.LogInformation($"📦 Commande {order.OrderNumber} en cash à la livraison");
                }

                await transaction.CommitAsync();

                return order;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<Order?> GetOrderByIdAsync(int orderId)
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.Items)
                .ThenInclude(i => i.Product)
                .ThenInclude(p => p.Shop)
                .FirstOrDefaultAsync(o => o.Id == orderId);
        }

        public async Task<OrderResponseDto?> GetOrderByNumberAsync(string orderNumber)
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.Items)
                .ThenInclude(i => i.Product)
                .Where(o => o.OrderNumber == orderNumber)
                .Select(o => new OrderResponseDto
                {
                    Id = o.Id,
                    OrderNumber = o.OrderNumber,
                    UserId = o.UserId,
                    Username = o.User != null ? o.User.Username : "",
                    UserEmail = o.User != null ? o.User.Email : "",
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
                    Items = o.Items.Select(i => new OrderItemDto
                    {
                        Id = i.Id,
                        ProductId = i.ProductId,
                        ProductName = i.Product != null ? i.Product.Name : "",
                        ProductImage = i.Product != null ? i.Product.ImageUrl : null,
                        Quantity = i.Quantity,
                        UnitPrice = i.UnitPrice,
                        TotalPrice = i.TotalPrice,
                        ShopId = i.Product != null ? i.Product.ShopId : null,
                        ShopName = i.Product != null && i.Product.Shop != null ? i.Product.Shop.Name : null,
                        IsReviewed = i.IsReviewed
                    }).ToList()
                })
                .FirstOrDefaultAsync();
        }

        public async Task<OrderResponseDto?> GetOrderByPaymentIntentId(string paymentIntentId)
        {
            return await _context.Orders
                .Where(o => o.PaymentIntentId == paymentIntentId)
                .Select(o => new OrderResponseDto
                {
                    Id = o.Id,
                    OrderNumber = o.OrderNumber,
                    UserId = o.UserId,
                    Username = o.User != null ? o.User.Username : "",
                    Status = o.Status,
                    PaymentStatus = o.PaymentStatus,
                    FinalAmount = o.FinalAmount,
                    CreatedAt = o.CreatedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task<List<Order>> GetUserOrdersAsync(int userId)
        {
            return await _context.Orders
                .Where(o => o.UserId == userId)
                .Include(o => o.Items)
                .ThenInclude(i => i.Product)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<OrderResponseDto>> GetShopOrdersAsync(int shopId)
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.Items)
                .ThenInclude(i => i.Product)
                .Where(o => o.Items.Any(i => i.Product.ShopId == shopId))
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new OrderResponseDto
                {
                    Id = o.Id,
                    OrderNumber = o.OrderNumber,
                    UserId = o.UserId,
                    Username = o.User != null ? o.User.Username : "",
                    UserEmail = o.User != null ? o.User.Email : "",
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
                    Items = o.Items.Select(i => new OrderItemDto
                    {
                        Id = i.Id,
                        ProductId = i.ProductId,
                        ProductName = i.Product != null ? i.Product.Name : "",
                        ProductImage = i.Product != null ? i.Product.ImageUrl : null,
                        Quantity = i.Quantity,
                        UnitPrice = i.UnitPrice,
                        TotalPrice = i.TotalPrice,
                        ShopId = i.Product != null ? i.Product.ShopId : null,
                        ShopName = i.Product != null && i.Product.Shop != null ? i.Product.Shop.Name : null,
                        IsReviewed = i.IsReviewed
                    }).ToList()
                })
                .ToListAsync();
        }

        public async Task<bool> UpdateOrderStatusAsync(int orderId, OrderStatus status)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
                return false;

            order.Status = status;
            order.UpdatedAt = DateTime.UtcNow;

            if (status == OrderStatus.Shipped)
                order.ShippedAt = DateTime.UtcNow;
            else if (status == OrderStatus.Delivered)
                order.DeliveredAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateOrderStatusAsync(string orderNumber, OrderStatus status)
        {
            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);
            
            if (order == null)
                return false;

            order.Status = status;
            order.UpdatedAt = DateTime.UtcNow;

            if (status == OrderStatus.Shipped)
                order.ShippedAt = DateTime.UtcNow;
            else if (status == OrderStatus.Delivered)
                order.DeliveredAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdatePaymentStatusAsync(int orderId, PaymentStatus status, string? paymentIntentId = null)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
                return false;

            order.PaymentStatus = status;
            order.UpdatedAt = DateTime.UtcNow;

            if (status == PaymentStatus.Paid)
            {
                order.PaidAt = DateTime.UtcNow;
                order.Status = OrderStatus.Processing;
            }

            if (!string.IsNullOrEmpty(paymentIntentId))
                order.PaymentIntentId = paymentIntentId;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdatePaymentStatusAsync(string orderNumber, PaymentStatus status)
        {
            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);
            
            if (order == null)
                return false;

            order.PaymentStatus = status;
            order.UpdatedAt = DateTime.UtcNow;

            if (status == PaymentStatus.Paid)
            {
                order.PaidAt = DateTime.UtcNow;
                order.Status = OrderStatus.Processing;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CancelOrderAsync(int orderId, int userId)
        {
            var order = await _context.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

            if (order == null || order.Status != OrderStatus.Pending)
                return false;

            // Restaurer le stock
            foreach (var item in order.Items)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                if (product != null)
                {
                    product.Stock += item.Quantity;
                }
            }

            order.Status = OrderStatus.Cancelled;
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<OrderResponseDto>> GetOrdersByStatusAsync(OrderStatus status)
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.Items)
                .ThenInclude(i => i.Product)
                .Where(o => o.Status == status)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new OrderResponseDto
                {
                    Id = o.Id,
                    OrderNumber = o.OrderNumber,
                    UserId = o.UserId,
                    Username = o.User != null ? o.User.Username : "",
                    UserEmail = o.User != null ? o.User.Email : "",
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
                    Items = o.Items.Select(i => new OrderItemDto
                    {
                        Id = i.Id,
                        ProductId = i.ProductId,
                        ProductName = i.Product != null ? i.Product.Name : "",
                        ProductImage = i.Product != null ? i.Product.ImageUrl : null,
                        Quantity = i.Quantity,
                        UnitPrice = i.UnitPrice,
                        TotalPrice = i.TotalPrice,
                        ShopId = i.Product != null ? i.Product.ShopId : null,
                        ShopName = i.Product != null && i.Product.Shop != null ? i.Product.Shop.Name : null,
                        IsReviewed = i.IsReviewed
                    }).ToList()
                })
                .ToListAsync();
        }

        public async Task<bool> HasUserPurchasedProductAsync(int userId, int productId)
        {
            return await _context.OrderItems
                .Include(oi => oi.Order)
                .AnyAsync(oi => oi.ProductId == productId &&
                                oi.Order.UserId == userId &&
                                oi.Order.Status == OrderStatus.Delivered);
        }

        public async Task<OrderStatsDto> GetOrderStatsAsync(int? shopId = null)
        {
            IQueryable<Order> query = _context.Orders;

            if (shopId.HasValue)
            {
                query = query.Where(o => o.Items.Any(i => i.Product.ShopId == shopId.Value));
            }

            var orders = await query
                .Select(o => new
                {
                    o.TotalAmount,
                    o.TaxAmount,
                    o.ShippingCost,
                    o.DiscountAmount,
                    o.Status,
                    o.CreatedAt
                })
                .ToListAsync();

            var totalOrders = orders.Count;
            var totalRevenue = orders.Sum(o => o.TotalAmount + o.TaxAmount + o.ShippingCost - o.DiscountAmount);
            var pendingOrders = orders.Count(o => o.Status == OrderStatus.Pending);
            var processingOrders = orders.Count(o => o.Status == OrderStatus.Processing);
            var shippedOrders = orders.Count(o => o.Status == OrderStatus.Shipped);
            var deliveredOrders = orders.Count(o => o.Status == OrderStatus.Delivered);
            var cancelledOrders = orders.Count(o => o.Status == OrderStatus.Cancelled);

            var revenueByDay = orders
                .GroupBy(o => o.CreatedAt.Date.ToString("yyyy-MM-dd"))
                .ToDictionary(g => g.Key, g => g.Sum(o => o.TotalAmount + o.TaxAmount + o.ShippingCost - o.DiscountAmount));

            var ordersByDay = orders
                .GroupBy(o => o.CreatedAt.Date.ToString("yyyy-MM-dd"))
                .ToDictionary(g => g.Key, g => g.Count());

            return new OrderStatsDto
            {
                TotalOrders = totalOrders,
                TotalRevenue = totalRevenue,
                PendingOrders = pendingOrders,
                ProcessingOrders = processingOrders,
                ShippedOrders = shippedOrders,
                DeliveredOrders = deliveredOrders,
                CancelledOrders = cancelledOrders,
                AverageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0,
                RevenueByDay = revenueByDay,
                OrdersByDay = ordersByDay
            };
        }

        // ==================== MÉTHODES PRIVÉES ====================

        private string GenerateOrderNumber()
        {
            var date = DateTime.UtcNow.ToString("yyyyMMdd");
            var random = new Random().Next(10000, 99999);
            return $"ORD-{date}-{random}";
        }

        private async Task<bool> ClearCartDirectly(int userId)
        {
            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);
            
            if (cart == null)
                return false;
            
            _context.CartItems.RemoveRange(cart.Items);
            cart.Items.Clear();
            cart.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return true;
        }
    }
}