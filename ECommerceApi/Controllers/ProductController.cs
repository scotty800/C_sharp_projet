using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using ECommerceApi.Data;
using System.Security.Claims;
using ECommerceApi.Models;
using ECommerceApi.Services;
using ECommerceApi.DTO;

[ApiController]
[Route("api/products")]
public class ProductController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IShopService _shopService;
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public ProductController(IProductService productService,
        IShopService shopService, AppDbContext context,
        IWebHostEnvironment environment)
    {
        _productService = productService;
        _shopService = shopService;
        _context = context;
        _environment = environment;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllAsync()
    {
        var products = await _productService.GetAllProductsAsync();
        return Ok(products);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var product = await _productService.GetProductByIdAsync(id);
        if (product == null)
            return NotFound("Produit introuvable");

        return Ok(product);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto productDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var product = new Product
        {
            Name = productDto.Name,
            Price = productDto.Price,
            Stock = productDto.Stock,
            Description = productDto.Description,
            Size = productDto.Size,
            Color = productDto.Color,
            Category = productDto.Category,
            ShopId = productDto.ShopId,
            CreatedAt = DateTime.UtcNow
        };

        if (productDto.ShopId.HasValue)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var shop = await _shopService.GetShopByIdAsync(productDto.ShopId.Value);

            if (shop == null)
                return NotFound("Shop non trouvé");

            if (shop.OwnerId != userId)
                return Unauthorized("Vous n'êtes pas le propriétaire de ce shop");
        }

        var createdProduct = await _productService.CreateAsync(product);

        var responseDto = new ProductResponseDto
        {
            Id = createdProduct.Id,
            Name = createdProduct.Name,
            Description = createdProduct.Description,
            Price = createdProduct.Price,
            Stock = createdProduct.Stock,
            Size = createdProduct.Size,
            Color = createdProduct.Color,
            Category = createdProduct.Category,
            ShopId = createdProduct.ShopId,
            CreatedAt = createdProduct.CreatedAt
        };

        return CreatedAtAction(
            nameof(GetById),
            new { id = createdProduct.Id },
            responseDto
        );
    }

    // ⚠️ IMPORTANT: Cette route DOIT être AVANT "shop/{shopId}" pour éviter les conflits
    [HttpPost("update/{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateProductPost(int id, [FromBody] UpdateProductDto productDto)
    {
        Console.WriteLine($"🟢🟢🟢 POST /api/products/update/{id} EXÉCUTÉ à {DateTime.Now}");
        Console.WriteLine($"📦 Données reçues: {System.Text.Json.JsonSerializer.Serialize(productDto)}");

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var existingProduct = await _context.Products
                .Include(p => p.Shop)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (existingProduct == null)
                return NotFound(new { message = "Produit non trouvé" });

            if (existingProduct.ShopId.HasValue)
            {
                if (existingProduct.Shop == null || existingProduct.Shop.OwnerId != userId)
                    return Unauthorized(new { message = "Vous n'êtes pas autorisé à modifier ce produit" });
            }

            existingProduct.Name = productDto.Name;
            existingProduct.Description = productDto.Description;
            existingProduct.Price = productDto.Price;
            existingProduct.Stock = productDto.Stock;
            existingProduct.Size = productDto.Size;
            existingProduct.Color = productDto.Color;
            existingProduct.Category = productDto.Category;
            existingProduct.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var updatedProduct = await _productService.GetProductByIdAsync(id);
            Console.WriteLine($"✅ Produit {id} mis à jour avec succès (via POST)");
            return Ok(updatedProduct);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Erreur mise à jour produit: {ex.Message}");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("shop/{shopId}")]
    [Authorize]
    public async Task<IActionResult> CreateProductForShop(
    int shopId,
    [FromBody] CreateProductDto productDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var createdProduct = await _productService.CreateForShopAsync(shopId, productDto, userId);

            var responseDto = new ProductResponseDto
            {
                Id = createdProduct.Id,
                Name = createdProduct.Name,
                Description = createdProduct.Description,
                Price = createdProduct.Price,
                Stock = createdProduct.Stock,
                Size = createdProduct.Size,
                Color = createdProduct.Color,
                Category = createdProduct.Category,
                ShopId = createdProduct.ShopId,
                CreatedAt = createdProduct.CreatedAt
            };

            return CreatedAtAction(
                nameof(GetById),
                new { id = createdProduct.Id },
                responseDto
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Erreur création produit: {ex.Message}");
            if (ex.InnerException != null)
                Console.WriteLine($"Inner exception: {ex.InnerException.Message}");

            return StatusCode(500, new
            {
                message = "Erreur lors de la création du produit",
                error = ex.Message,
                innerError = ex.InnerException?.Message
            });
        }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductDto productDto)
    {
        Console.WriteLine($"🔵🔵🔵 PUT /api/products/{id} EXÉCUTÉ à {DateTime.Now}");
        Console.WriteLine($"📦 Données reçues: {System.Text.Json.JsonSerializer.Serialize(productDto)}");

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var existingProduct = await _context.Products
                .Include(p => p.Shop)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (existingProduct == null)
                return NotFound(new { message = "Produit non trouvé" });

            if (existingProduct.ShopId.HasValue)
            {
                if (existingProduct.Shop == null || existingProduct.Shop.OwnerId != userId)
                    return Unauthorized(new { message = "Vous n'êtes pas autorisé à modifier ce produit" });
            }

            existingProduct.Name = productDto.Name;
            existingProduct.Description = productDto.Description;
            existingProduct.Price = productDto.Price;
            existingProduct.Stock = productDto.Stock;
            existingProduct.Size = productDto.Size;
            existingProduct.Color = productDto.Color;
            existingProduct.Category = productDto.Category;
            existingProduct.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var updatedProduct = await _productService.GetProductByIdAsync(id);
            Console.WriteLine($"✅ Produit {id} mis à jour avec succès");
            return Ok(updatedProduct);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Erreur mise à jour produit: {ex.Message}");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        Console.WriteLine($"🔴🔴🔴 DELETE /api/products/{id} EXÉCUTÉ à {DateTime.Now}");

        var existingProduct = await _productService.GetProductByIdAsync(id);
        if (existingProduct == null)
            return NotFound("Produit non trouvé");

        if (existingProduct.ShopId.HasValue)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var shop = await _shopService.GetShopByIdAsync(existingProduct.ShopId.Value);

            if (shop == null)
                return NotFound("Shop non trouvé");

            if (shop.OwnerId != userId)
                return Unauthorized("Vous n'êtes pas le propriétaire de ce shop");
        }

        var deleted = await _productService.DeleteAsync(id);
        if (!deleted)
            return NotFound("Produit non trouvé");

        Console.WriteLine($"🗑️ Produit {id} supprimé avec succès");
        return NoContent();
    }

    [HttpGet("instock")]
    public async Task<IActionResult> GetProductsInStock()
    {
        var stock = await _productService.GetProductsInStockAsync();
        return Ok(stock);
    }

    [HttpGet("paged")]
    public async Task<IActionResult> GetProducts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? category = null)
    {
        var result = await _productService.GetPagedAsync(
            page,
            pageSize,
            minPrice,
            maxPrice,
            sortBy,
            category
        );

        return Ok(result);
    }

    [HttpGet("shop/{shopId}")]
    public async Task<IActionResult> GetProductsByShop(
        int shopId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] string? sortBy = null)
    {
        var shop = await _shopService.GetShopByIdAsync(shopId);
        if (shop == null)
            return NotFound("Shop non trouvé");

        var result = await _productService.GetProductsByShopPagedAsync(
            shopId, page, pageSize, minPrice, maxPrice, sortBy);

        return Ok(new
        {
            shop = new { shop.Id, shop.Name, shop.Slug, shop.ProductCount },
            products = result
        });
    }

    [HttpPost("upload-images")]
    [Authorize]
    public async Task<IActionResult> UploadProductImages([FromForm] ProductImageUploadDto images)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var result = await _productService.UploadProductImagesAsync(images.ProductId, userId, images);

            return Ok(new
            {
                message = "Images uploadées avec succès",
                productId = images.ProductId
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{productId}/image/{imageNumber}")]
    [Authorize]
    public async Task<IActionResult> DeleteProductImage(int productId, int imageNumber)
    {
        if (imageNumber < 1 || imageNumber > 3)
            return BadRequest("Le numéro d'image doit être entre 1 et 3");

        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var product = await _context.Products
                .Include(p => p.Shop)
                .FirstOrDefaultAsync(p => p.Id == productId);

            if (product == null)
                return NotFound("Produit non trouvé");

            if (product.ShopId.HasValue)
            {
                if (product.Shop == null || product.Shop.OwnerId != userId)
                    return Unauthorized("Vous n'êtes pas autorisé");
            }

            string? imageUrl = null;
            switch (imageNumber)
            {
                case 1: imageUrl = product.ImageUrl1; product.ImageUrl1 = null; break;
                case 2: imageUrl = product.ImageUrl2; product.ImageUrl2 = null; break;
                case 3: imageUrl = product.ImageUrl3; product.ImageUrl3 = null; break;
            }

            if (!string.IsNullOrEmpty(imageUrl))
            {
                var filePath = Path.Combine(_environment.WebRootPath, imageUrl.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                    System.IO.File.Delete(filePath);
            }

            product.ImageUrl = product.ImageUrl1 ?? product.ImageUrl2 ?? product.ImageUrl3;
            product.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = $"Image {imageNumber} supprimée avec succès" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{productId}/images")]
    public async Task<IActionResult> GetProductImages(int productId)
    {
        var product = await _context.Products.FindAsync(productId);
        if (product == null)
            return NotFound("Produit non trouvé");

        var images = new List<string>();
        if (!string.IsNullOrEmpty(product.ImageUrl1)) images.Add(product.ImageUrl1);
        if (!string.IsNullOrEmpty(product.ImageUrl2)) images.Add(product.ImageUrl2);
        if (!string.IsNullOrEmpty(product.ImageUrl3)) images.Add(product.ImageUrl3);

        return Ok(new
        {
            productId = product.Id,
            productName = product.Name,
            mainImage = product.ImageUrl1 ?? product.ImageUrl2 ?? product.ImageUrl3,
            images = images,
            count = images.Count
        });
    }
}