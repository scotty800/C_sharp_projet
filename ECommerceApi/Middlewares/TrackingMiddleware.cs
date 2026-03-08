using ECommerceApi.Data;
using ECommerceApi.Models;
using Microsoft.Extensions.DependencyInjection;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace ECommerceApi.Middlewares
{
    public class TrackingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<TrackingMiddleware> _logger;

        public TrackingMiddleware(RequestDelegate next, ILogger<TrackingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, IServiceProvider serviceProvider)
        {
            var path = context.Request.Path.Value;
            var method = context.Request.Method;

            if (method == "GET")
            {
                context.Response.OnCompleted(async () =>
                {
                    try
                    {
                        using var scope = serviceProvider.CreateScope();
                        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                        if (context.Response.StatusCode == 200)
                        {
                            if (path?.StartsWith("/api/products") == true && !path.Contains("/paged"))
                            {
                                await TrackProductView(context, dbContext, path);
                            }
                            else if (path?.StartsWith("/api/shops") == true && !path.Contains("/products"))
                            {
                                await TrackShopVisit(context, dbContext, path);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Erreur lors du tracking (non bloquante)");
                    }
                });
            }

            await _next(context);
        }

        private async Task TrackProductView(HttpContext context, AppDbContext dbContext, string path)
        {
            var segments = path.Split('/');

            if (segments.Length >= 3 && int.TryParse(segments[3], out int productId))
            {
                var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                int? userId = null;
                if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int parsedUserId))
                {
                    userId = parsedUserId;
                }

                var product = await dbContext.Products.FindAsync(productId);
                if (product == null)
                {
                    _logger.LogWarning($"Tentative de vue sur produit inexistant {productId}");
                    return;
                }

                // ✅ Vérifier si l'utilisateur est le propriétaire (ne pas compter ses propres vues)
                var shop = await dbContext.Shops.FirstOrDefaultAsync(s => s.Id == product.ShopId);
                if (shop != null && userId.HasValue && userId.Value == shop.OwnerId)
                {
                    _logger.LogInformation($"🚫 Propriétaire - Vue non comptée pour produit {productId}");
                    return;
                }

                // ✅ Vérifier les doublons (éviter les rafraîchissements multiples)
                var ipAddress = context.Connection.RemoteIpAddress?.ToString() ?? string.Empty;
                var fiveMinutesAgo = DateTime.UtcNow.AddMinutes(-5);

                // ✅ CORRECTION: Pas d'opérateur null propagating dans l'expression lambda
                var recentView = await dbContext.ProductViews
                    .AnyAsync(v => v.ProductId == productId
                        && v.IpAddress == ipAddress
                        && v.ViewedAt >= fiveMinutesAgo);

                if (recentView)
                {
                    _logger.LogInformation($"🚫 Vue récente ignorée pour produit {productId}");
                    return;
                }

                var userAgent = context.Request.Headers["User-Agent"].ToString();
                var truncatedUserAgent = userAgent.Length > 500 ? userAgent.Substring(0, 500) : userAgent;

                var productView = new ProductView
                {
                    ProductId = productId,
                    UserId = userId,
                    IpAddress = ipAddress,
                    UserAgent = truncatedUserAgent,
                    ViewedAt = DateTime.UtcNow
                };

                await dbContext.ProductViews.AddAsync(productView);
                await dbContext.SaveChangesAsync();

                _logger.LogInformation($"📊 Vue produit {productId} - {product.Name} comptée");
            }
        }

        private async Task TrackShopVisit(HttpContext context, AppDbContext dbContext, string path)
        {
            var segments = path.Split('/');

            if (segments.Length >= 3)
            {
                var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                int? userId = null;
                if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int parsedUserId))
                {
                    userId = parsedUserId;
                }

                Shop? shop = null;
                int shopId;

                // Essayer de parser comme ID d'abord
                if (int.TryParse(segments[3], out shopId))
                {
                    shop = await dbContext.Shops.FindAsync(shopId);
                }

                // Si ce n'est pas un ID, essayer comme slug
                if (shop == null)
                {
                    var slug = segments[3];
                    shop = await dbContext.Shops.FirstOrDefaultAsync(s => s.Slug == slug);

                    if (shop != null)
                        shopId = shop.Id;
                    else
                    {
                        _logger.LogWarning($"Tentative de visite sur shop inexistant {segments[3]}");
                        return;
                    }
                }

                // ✅ NE PAS COMPTER les visites du propriétaire
                if (shop != null && userId.HasValue && userId.Value == shop.OwnerId)
                {
                    _logger.LogInformation($"🚫 Propriétaire - Visite non comptée pour shop {shop.Id}");
                    return;
                }

                // ✅ Éviter les visites multiples d'une même IP en peu de temps
                var ipAddress = context.Connection.RemoteIpAddress?.ToString() ?? string.Empty;
                var fiveMinutesAgo = DateTime.UtcNow.AddMinutes(-5);

                // ✅ CORRECTION: Pas d'opérateur null propagating dans l'expression lambda
                var recentVisit = await dbContext.ShopVisits
                    .AnyAsync(v => v.ShopId == shopId
                        && v.IpAddress == ipAddress
                        && v.VisitedAt >= fiveMinutesAgo);

                if (recentVisit)
                {
                    _logger.LogInformation($"🚫 Visite récente ignorée pour shop {shopId}");
                    return;
                }

                var userAgent = context.Request.Headers["User-Agent"].ToString();
                var truncatedUserAgent = userAgent.Length > 500 ? userAgent.Substring(0, 500) : userAgent;

                var shopVisit = new ShopVisit
                {
                    ShopId = shopId,
                    UserId = userId,
                    IpAddress = ipAddress,
                    UserAgent = truncatedUserAgent,
                    Device = DetectDevice(userAgent),
                    VisitedAt = DateTime.UtcNow
                };

                await dbContext.ShopVisits.AddAsync(shopVisit);
                await dbContext.SaveChangesAsync();

                _logger.LogInformation($"🏪 Visite shop {shopId} - {shop?.Name ?? "Inconnu"} comptée");
            }
        }

        private string DetectDevice(string userAgent)
        {
            if (string.IsNullOrEmpty(userAgent))
                return "unknown";

            var ua = userAgent.ToLower();

            if (ua.Contains("mobile") || ua.Contains("android") || ua.Contains("iphone"))
                return "mobile";
            else if (ua.Contains("tablet") || ua.Contains("ipad"))
                return "tablet";
            else
                return "desktop";
        }
    }
}