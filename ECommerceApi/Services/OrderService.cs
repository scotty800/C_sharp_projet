using ECommerceApi.Data;
using ECommerceApi.DTO;
using ECommerceApi.Models;
using ECommerceApi.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace ECommerceApi.Services
{
    public class OrderService : IOrderService
    {
        private readonly AppDbContext _context;
        private readonly ICartService _cartService;
        private readonly IProductService _productService;
        private readonly IPaymentService _paymentService;
        private readonly IShippingService _shippingService;
        private readonly ILogger<OrderService> _logger;

        public OrderService(
            AppDbContext context,
            ICartService cartService,
            IProductService productService,
            IPaymentService paymentService,
            IShippingService shippingService,
            ILogger<OrderService> logger)
        {
            _context = context;
            _cartService = cartService;
            _productService = productService;
            _paymentService = paymentService;
            _shippingService = shippingService;
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

                var shippingSummary = await _shippingService.CalculateCartShippingAsync(userId);

                if (!shippingSummary.AllShopsConfigured)
                    throw new Exception("Une ou plusieurs boutiques de votre panier n'ont pas encore configuré leur livraison. Veuillez réessayer plus tard ou retirer ces articles.");

                if (shippingSummary.Breakdown.Count == 0)
                    throw new Exception("Impossible de calculer la livraison pour ce panier.");

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
                    ShippingCost = shippingSummary.TotalShipping,
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

                // Persister le snapshot de livraison par boutique avec MinDays et MaxDays
                foreach (var shopBreakdown in shippingSummary.Breakdown)
                {
                    _context.OrderShopShippings.Add(new OrderShopShipping
                    {
                        OrderId = order.Id,
                        ShopId = shopBreakdown.ShopId,
                        ShippingMethodName = shopBreakdown.ShippingMethodName,
                        ShippingCost = shopBreakdown.ShippingCost,
                        Subtotal = shopBreakdown.Subtotal,
                        MinDays = shopBreakdown.MinDays,
                        MaxDays = shopBreakdown.MaxDays,
                    });
                }
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

        // ⭐ NOUVELLE MÉTHODE — Création d'une session de checkout
        public async Task<CheckoutIntentResponseDto> CreateCheckoutSessionAsync(int userId, CreateCheckoutIntentDto dto)
        {
            var cart = await _cartService.GetCartDetailsAsync(userId);
            if (!cart.Items.Any())
                throw new Exception("Le panier est vide");

            foreach (var item in cart.Items)
            {
                var product = await _productService.GetProductByIdAsync(item.ProductId);
                if (product == null)
                    throw new Exception($"Produit {item.ProductId} non trouvé");
                if (product.Stock < item.Quantity)
                    throw new Exception($"Stock insuffisant pour {product.Name}");
            }

            var shippingSummary = await _shippingService.CalculateCartShippingAsync(userId);
            if (!shippingSummary.AllShopsConfigured)
                throw new Exception("Une ou plusieurs boutiques n'ont pas encore configuré leur livraison.");

            var subtotal = cart.TotalAmount;
            var taxAmount = subtotal * 0.2m;
            var shippingCost = shippingSummary.TotalShipping;
            var total = subtotal + taxAmount + shippingCost;

            var snapshot = cart.Items.Select(i => new {
                i.ProductId, i.Quantity, UnitPrice = i.ProductPrice,
                SelectedColor = i.SelectedColor, SelectedSize = i.SelectedSize
            });
            var breakdown = shippingSummary.Breakdown.Select(b => new
            {
                b.ShopId, b.ShippingMethodName, b.ShippingCost, b.Subtotal, b.MinDays, b.MaxDays
            });

            var session = new CheckoutSession
            {
                UserId = userId,
                ShippingAddress = dto.ShippingAddress,
                ShippingCity = dto.ShippingCity,
                ShippingPostalCode = dto.ShippingPostalCode,
                ShippingCountry = dto.ShippingCountry,
                BillingAddress = dto.BillingAddress ?? dto.ShippingAddress,
                BillingCity = dto.BillingCity ?? dto.ShippingCity,
                BillingPostalCode = dto.BillingPostalCode ?? dto.ShippingPostalCode,
                BillingCountry = dto.BillingCountry ?? dto.ShippingCountry,
                Notes = dto.Notes,
                TaxAmount = taxAmount,
                ShippingCost = shippingCost,
                CartSnapshotJson = JsonSerializer.Serialize(snapshot),
                ShippingBreakdownJson = JsonSerializer.Serialize(breakdown),
                CreatedAt = DateTime.UtcNow
            };

            _context.CheckoutSessions.Add(session);
            await _context.SaveChangesAsync();

            if (dto.PaymentMethod == PaymentMethod.CashOnDelivery)
            {
                var order = await CreateOrderFromSnapshotAsync(userId, session, PaymentStatus.Pending, OrderStatus.Pending, PaymentMethod.CashOnDelivery);
                session.IsFinalized = true;
                await _context.SaveChangesAsync();

                return new CheckoutIntentResponseDto
                {
                    CheckoutSessionId = session.Id,
                    Subtotal = subtotal,
                    ShippingCost = shippingCost,
                    TaxAmount = taxAmount,
                    Total = total,
                    RequiresOnlinePayment = false,
                    OrderId = order.Id
                };
            }

            var reference = $"CHK-{session.Id}-{DateTime.UtcNow.Ticks}";
            var paymentIntent = await _paymentService.CreatePaymentIntentAsync(total, reference);

            session.PaymentIntentId = paymentIntent.Id;
            await _context.SaveChangesAsync();

            return new CheckoutIntentResponseDto
            {
                CheckoutSessionId = session.Id,
                ClientSecret = paymentIntent.ClientSecret,
                PaymentIntentId = paymentIntent.Id,
                Subtotal = subtotal,
                ShippingCost = shippingCost,
                TaxAmount = taxAmount,
                Total = total,
                RequiresOnlinePayment = true
            };
        }

        // ⭐ NOUVELLE MÉTHODE — Finalisation de la commande après paiement
        public async Task<Order> FinalizeOrderAsync(int userId, string paymentIntentId)
        {
            var session = await _context.CheckoutSessions
                .Where(s => s.UserId == userId && s.PaymentIntentId == paymentIntentId && !s.IsFinalized)
                .OrderByDescending(s => s.CreatedAt)
                .FirstOrDefaultAsync();

            if (session == null)
                throw new Exception("Session de paiement introuvable ou déjà traitée");

            var paymentIntent = await _paymentService.GetPaymentIntentAsync(paymentIntentId);
            if (paymentIntent.Status != "succeeded")
                throw new Exception($"Le paiement n'est pas confirmé (statut Stripe: {paymentIntent.Status})");

            var order = await CreateOrderFromSnapshotAsync(userId, session, PaymentStatus.Paid, OrderStatus.Processing, PaymentMethod.CreditCard);
            order.PaymentIntentId = paymentIntentId;
            order.PaidAt = DateTime.UtcNow;

            session.IsFinalized = true;
            await _context.SaveChangesAsync();

            return order;
        }

        // ⭐ MÉTHODE PRIVÉE — Création d'une commande depuis un snapshot
        private async Task<Order> CreateOrderFromSnapshotAsync(
            int userId, CheckoutSession session, PaymentStatus paymentStatus, OrderStatus orderStatus, PaymentMethod paymentMethod)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var items = JsonSerializer.Deserialize<List<CheckoutSnapshotItem>>(session.CartSnapshotJson) ?? new();
                var breakdown = JsonSerializer.Deserialize<List<CheckoutSnapshotShipping>>(session.ShippingBreakdownJson) ?? new();

                decimal subtotal = 0;
                foreach (var item in items)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product == null) throw new Exception($"Produit {item.ProductId} introuvable");
                    if (product.Stock < item.Quantity) throw new Exception($"Stock insuffisant pour {product.Name}");
                    subtotal += item.UnitPrice * item.Quantity;
                }

                var order = new Order
                {
                    OrderNumber = GenerateOrderNumber(),
                    UserId = userId,
                    Status = orderStatus,
                    PaymentStatus = paymentStatus,
                    PaymentMethod = paymentMethod,
                    TotalAmount = subtotal,
                    TaxAmount = session.TaxAmount,
                    ShippingCost = session.ShippingCost,
                    DiscountAmount = 0,
                    ShippingAddress = session.ShippingAddress,
                    ShippingCity = session.ShippingCity,
                    ShippingPostalCode = session.ShippingPostalCode,
                    ShippingCountry = session.ShippingCountry,
                    BillingAddress = session.BillingAddress,
                    BillingCity = session.BillingCity,
                    BillingPostalCode = session.BillingPostalCode,
                    BillingCountry = session.BillingCountry,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                foreach (var b in breakdown)
                {
                    _context.OrderShopShippings.Add(new OrderShopShipping
                    {
                        OrderId = order.Id,
                        ShopId = b.ShopId,
                        ShippingMethodName = b.ShippingMethodName,
                        ShippingCost = b.ShippingCost,
                        Subtotal = b.Subtotal,
                        MinDays = b.MinDays,
                        MaxDays = b.MaxDays
                    });
                }

                foreach (var item in items)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    product!.Stock -= item.Quantity;

                    _context.OrderItems.Add(new OrderItem
                    {
                        OrderId = order.Id,
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice,
                        SelectedColor = item.SelectedColor,
                        SelectedSize = item.SelectedSize
                    });
                }

                await _context.SaveChangesAsync();

                await ClearCartDirectly(userId);

                await transaction.CommitAsync();
                return order;
            }
            catch
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
                .Include(o => o.ShopShippings)
                .FirstOrDefaultAsync(o => o.Id == orderId);
        }

        // ⭐ MODIFICATION — GetOrderByNumberAsync avec ShopSlug
        public async Task<OrderResponseDto?> GetOrderByNumberAsync(string orderNumber)
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.Items)
                .ThenInclude(i => i.Product)
                .Include(o => o.ShopShippings)
                .ThenInclude(s => s.Shop)
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
                        // ⭐ NOUVEAU
                        ShopSlug = i.Product != null && i.Product.Shop != null ? i.Product.Shop.Slug : null,
                        IsReviewed = i.IsReviewed,
                        SelectedColor = i.SelectedColor,
                        SelectedSize = i.SelectedSize
                    }).ToList(),
                    ShippingBreakdown = o.ShopShippings.Select(s => new OrderShopShippingDto
                    {
                        ShopId = s.ShopId,
                        ShopName = s.Shop != null ? s.Shop.Name : null,
                        ShippingMethodName = s.ShippingMethodName,
                        ShippingCost = s.ShippingCost,
                        Subtotal = s.Subtotal,
                        MinDays = s.MinDays,
                        MaxDays = s.MaxDays,
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
                .Include(o => o.ShopShippings)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        // ⭐ MODIFICATION — GetShopOrdersAsync avec ShopSlug
        public async Task<List<OrderResponseDto>> GetShopOrdersAsync(int shopId)
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.Items)
                .ThenInclude(i => i.Product)
                .Include(o => o.ShopShippings)
                .ThenInclude(s => s.Shop)
                .Where(o => o.Items.Any(i => i.Product.ShopId == shopId)
                    && (o.PaymentStatus == PaymentStatus.Paid || o.PaymentMethod == PaymentMethod.CashOnDelivery))
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
                        // ⭐ NOUVEAU
                        ShopSlug = i.Product != null && i.Product.Shop != null ? i.Product.Shop.Slug : null,
                        IsReviewed = i.IsReviewed,
                        SelectedColor = i.SelectedColor,
                        SelectedSize = i.SelectedSize
                    }).ToList(),
                    ShippingBreakdown = o.ShopShippings
                        .Where(s => s.ShopId == shopId)
                        .Select(s => new OrderShopShippingDto
                        {
                            ShopId = s.ShopId,
                            ShopName = s.Shop != null ? s.Shop.Name : null,
                            ShippingMethodName = s.ShippingMethodName,
                            ShippingCost = s.ShippingCost,
                            Subtotal = s.Subtotal,
                            MinDays = s.MinDays,
                            MaxDays = s.MaxDays,
                        }).ToList()
                })
                .ToListAsync();
        }

        public async Task<bool> UpdateOrderStatusAsync(int orderId, OrderStatus status)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
                return false;

            var isPaid = order.PaymentStatus == PaymentStatus.Paid;
            var isCashOnDelivery = order.PaymentMethod == PaymentMethod.CashOnDelivery;
            var isCancelling = status == OrderStatus.Cancelled;

            if (!isPaid && !isCashOnDelivery && !isCancelling)
            {
                throw new InvalidOperationException(
                    "Impossible de modifier le statut : cette commande n'a pas encore été payée.");
            }

            order.Status = status;
            order.UpdatedAt = DateTime.UtcNow;

            if (status == OrderStatus.Shipped)
                order.ShippedAt = DateTime.UtcNow;
            else if (status == OrderStatus.Delivered)
                order.DeliveredAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IsUserShopOwnerAsync(int userId, int orderId)
        {
            var shopIds = await _context.Shops
                .Where(s => s.OwnerId == userId && s.IsActive)
                .Select(s => s.Id)
                .ToListAsync();

            if (!shopIds.Any())
                return false;

            return await _context.OrderItems
                .Include(oi => oi.Product)
                .AnyAsync(oi => oi.OrderId == orderId &&
                                oi.Product != null &&
                                oi.Product.ShopId.HasValue &&
                                shopIds.Contains(oi.Product.ShopId.Value));
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

            if (order == null)
                return false;

            var statusNum = (int)order.Status;
            
            if (statusNum == 0 || statusNum == 1)
            {
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
            
            if (statusNum == 3)
            {
                var daysSinceOrder = (DateTime.UtcNow - order.CreatedAt).TotalDays;
                
                if (daysSinceOrder <= 14)
                {
                    try
                    {
                        if (!string.IsNullOrEmpty(order.PaymentIntentId))
                        {
                            var refunded = await _paymentService.RefundPaymentAsync(order.PaymentIntentId);
                            if (refunded)
                            {
                                order.Status = OrderStatus.Refunded;
                                order.PaymentStatus = PaymentStatus.Refunded;
                                order.UpdatedAt = DateTime.UtcNow;
                                await _context.SaveChangesAsync();
                                return true;
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError($"❌ Erreur remboursement Stripe: {ex.Message}");
                        throw new Exception("Erreur lors du remboursement");
                    }
                }
            }
            
            if (statusNum == 2)
            {
                order.Status = OrderStatus.Cancelled;
                order.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return true;
            }
            
            return false;
        }

        // ==================== GESTION DES RETOURS ====================

        public async Task<bool> RequestReturnAsync(int orderId, int userId)
        {
            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

            if (order == null)
                return false;

            if (order.Status != OrderStatus.Delivered)
                return false;

            var daysSinceOrder = (DateTime.UtcNow - order.CreatedAt).TotalDays;
            if (daysSinceOrder > 14)
                return false;

            if (order.Status == OrderStatus.ReturnRequested)
                return false;

            order.Status = OrderStatus.ReturnRequested;
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"📧 Demande de retour pour commande {order.OrderNumber} par utilisateur {userId}");

            return true;
        }

        public async Task<bool> ApproveReturnAsync(int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
                return false;

            if (order.Status != OrderStatus.ReturnRequested)
                return false;

            foreach (var item in order.Items)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                if (product != null)
                {
                    product.Stock += item.Quantity;
                }
            }

            try
            {
                if (!string.IsNullOrEmpty(order.PaymentIntentId))
                {
                    var refunded = await _paymentService.RefundPaymentAsync(order.PaymentIntentId);
                    if (!refunded)
                    {
                        _logger.LogError($"❌ Échec remboursement Stripe pour commande {order.OrderNumber}");
                        return false;
                    }
                }

                order.Status = OrderStatus.Refunded;
                order.PaymentStatus = PaymentStatus.Refunded;
                order.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation($"💰 Remboursement effectué pour commande {order.OrderNumber}");
                
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"❌ Erreur lors du remboursement: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> RejectReturnAsync(int orderId)
        {
            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
                return false;

            if (order.Status != OrderStatus.ReturnRequested)
                return false;

            order.Status = OrderStatus.Delivered;
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"❌ Demande de retour refusée pour commande {order.OrderNumber}");

            return true;
        }

        // ⭐ MODIFICATION — GetOrdersByStatusAsync avec ShopSlug
        public async Task<List<OrderResponseDto>> GetOrdersByStatusAsync(OrderStatus status)
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.Items)
                .ThenInclude(i => i.Product)
                .Include(o => o.ShopShippings)
                .ThenInclude(s => s.Shop)
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
                        // ⭐ NOUVEAU
                        ShopSlug = i.Product != null && i.Product.Shop != null ? i.Product.Shop.Slug : null,
                        IsReviewed = i.IsReviewed,
                        SelectedColor = i.SelectedColor,
                        SelectedSize = i.SelectedSize
                    }).ToList(),
                    ShippingBreakdown = o.ShopShippings.Select(s => new OrderShopShippingDto
                    {
                        ShopId = s.ShopId,
                        ShopName = s.Shop != null ? s.Shop.Name : null,
                        ShippingMethodName = s.ShippingMethodName,
                        ShippingCost = s.ShippingCost,
                        Subtotal = s.Subtotal,
                        MinDays = s.MinDays,
                        MaxDays = s.MaxDays,
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

        // ⭐ CLASSES PRIVÉES POUR LA DÉSÉRIALISATION
        private class CheckoutSnapshotItem
        {
            public int ProductId { get; set; }
            public int Quantity { get; set; }
            public decimal UnitPrice { get; set; }
            public string? SelectedColor { get; set; }
            public string? SelectedSize { get; set; }
        }

        private class CheckoutSnapshotShipping
        {
            public int ShopId { get; set; }
            public string? ShippingMethodName { get; set; }
            public decimal ShippingCost { get; set; }
            public decimal Subtotal { get; set; }
            public int MinDays { get; set; }
            public int MaxDays { get; set; }
        }
    }
}