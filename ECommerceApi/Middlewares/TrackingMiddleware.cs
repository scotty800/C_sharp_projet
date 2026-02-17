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
                var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                var product = await dbContext.Products.FindAsync(productId);
                if (product == null)
                {
                    _logger.LogWarning($"Tentative de vue sur produit inexistant {productId}");

                    return;
                }

                var productView = new ProductView
                {
                    ProductId = productId,
                    UserId = userId != null ? int.Parse(userId) : null,
                    IpAddress = context.Connection.RemoteIpAddress?.ToString(),
                    UserAgent = context.Request.Headers["User-Agent"].ToString().Substring(0, Math.Min(500, context.Request.Headers["User-Agent"].ToString().Length)),
                    ViewedAt = DateTime.UtcNow
                };

                await dbContext.ProductViews.AddAsync(productView);
                await dbContext.SaveChangesAsync();

                _logger.LogInformation($"📊 Vue produit {productId} - {product.Name}");
            }
        }

        private async Task TrackShopVisit(HttpContext context, AppDbContext dbContext, string path)
        {
            var segments = path.Split('/');

            if (segments.Length >= 3 && int.TryParse(segments[3], out int shopId))
            {
                var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                var shop = await dbContext.Shops.FindAsync(shopId);
                if (shop == null)
                {
                    var slug = segments[3];
                    shop = await dbContext.Shops.FirstOrDefaultAsync(s => s.Slug == slug);

                    if (shop != null)
                        shopId = shop.Id;
                    else
                    {
                        _logger.LogWarning($"Tentative de visite sur shop inexistant {shopId}");
                        return;
                    }
                }

                var userAgent = context.Request.Headers["User-Agent"].ToString();

                var shopVisit = new ShopVisit
                {
                    ShopId = shopId,
                    UserId = userId != null ? int.Parse(userId) : null,
                    IpAddress = context.Connection.RemoteIpAddress?.ToString(),
                    UserAgent = userAgent.Substring(0, Math.Min(500, userAgent.Length)),
                    Device = DetectDevice(userAgent),
                    VisitedAt = DateTime.UtcNow
                };

                await dbContext.ShopVisits.AddAsync(shopVisit);
                await dbContext.SaveChangesAsync();

                _logger.LogInformation($"🏪 Visite shop {shopId} - {shop?.Name ?? "Inconnu"}");
            }
        }

        private string DetectDevice(string userAgent)
        {
            if (string.IsNullOrEmpty(userAgent))
                return "unknown";

            userAgent = userAgent.ToLower();

            if (userAgent.Contains("mobile") || userAgent.Contains("android") || userAgent.Contains("iphone"))
                return "mobile";
            else if (userAgent.Contains("tablet") || userAgent.Contains("ipad"))
                return "tablet";
            else
                return "desktop";
        }
    }
}