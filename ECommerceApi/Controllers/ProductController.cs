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

    // ⭐⭐⭐ GetById AVEC Sizes ⭐⭐⭐
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var product = await _context.Products
            .Include(p => p.Shop)
            .Include(p => p.ColorVariants)
            .Where(p => p.Id == id)
            .Select(p => new ProductResponseDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                Stock = p.Stock,
                Size = p.Size,
                Color = p.Color,
                Category = p.Category,
                ShopId = p.ShopId,
                ShopName = p.Shop != null ? p.Shop.Name : null,
                ImageUrl = p.ImageUrl,
                ImageUrl1 = p.ImageUrl1,
                ImageUrl2 = p.ImageUrl2,
                ImageUrl3 = p.ImageUrl3,
                CreatedAt = p.CreatedAt,
                Variants = p.ColorVariants.Select(v => new ProductColorVariantDto
                {
                    Id = v.Id,
                    Color = v.Color,
                    CustomName = v.CustomName,
                    Stock = v.Stock,
                    Sizes = v.Size,
                    ImageUrl1 = v.ImageUrl1,
                    ImageUrl2 = v.ImageUrl2,
                    ImageUrl3 = v.ImageUrl3
                }).ToList()
            })
            .FirstOrDefaultAsync();

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
            CreatedAt = createdProduct.CreatedAt,
            Variants = new List<ProductColorVariantDto>()
        };

        return CreatedAtAction(
            nameof(GetById),
            new { id = createdProduct.Id },
            responseDto
        );
    }

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
                .Include(p => p.ColorVariants)
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

            var updatedProduct = await GetProductByIdResponse(id);
            Console.WriteLine($"✅ Produit {id} mis à jour avec succès (via POST)");
            return Ok(updatedProduct);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Erreur mise à jour produit: {ex.Message}");
            return BadRequest(new { message = ex.Message });
        }
    }

    // ⭐⭐⭐ CreateProductForShop AVEC rechargement du produit via GetProductByIdResponse ⭐⭐⭐
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

            // ⭐ Recharger le produit avec ses variantes fraîchement persistées
            var responseDto = await GetProductByIdResponse(createdProduct.Id);

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
                .Include(p => p.ColorVariants)
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

            var updatedProduct = await GetProductByIdResponse(id);
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

    [HttpGet("shop/{shopId}/all")]
    public async Task<IActionResult> GetAllProductsByShop(int shopId)
    {
        var shop = await _shopService.GetShopByIdAsync(shopId);
        if (shop == null)
            return NotFound("Shop non trouvé");

        var products = await _productService.GetProductsByShopIdAsync(shopId);

        return Ok(new
        {
            shop = new { shop.Id, shop.Name, shop.Slug, shop.ProductCount },
            products = products
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

            string? currentImage1 = product.ImageUrl1;
            string? currentImage2 = product.ImageUrl2;
            string? currentImage3 = product.ImageUrl3;

            Console.WriteLine($"📸 Images avant suppression: Image1={currentImage1}, Image2={currentImage2}, Image3={currentImage3}");

            string? imageUrlToDelete = null;
            switch (imageNumber)
            {
                case 1: imageUrlToDelete = product.ImageUrl1; break;
                case 2: imageUrlToDelete = product.ImageUrl2; break;
                case 3: imageUrlToDelete = product.ImageUrl3; break;
            }

            if (!string.IsNullOrEmpty(imageUrlToDelete))
            {
                var filePath = Path.Combine(_environment.WebRootPath, imageUrlToDelete.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                    Console.WriteLine($"🗑️ Fichier supprimé: {filePath}");
                }
            }

            string? newImageUrl1 = currentImage1;
            string? newImageUrl2 = currentImage2;
            string? newImageUrl3 = currentImage3;

            if (imageNumber == 1)
            {
                newImageUrl1 = currentImage2;
                newImageUrl2 = currentImage3;
                newImageUrl3 = null;
                Console.WriteLine("🔄 Réorganisation après suppression Image1");
            }
            else if (imageNumber == 2)
            {
                newImageUrl1 = currentImage1;
                newImageUrl2 = currentImage3;
                newImageUrl3 = null;
                Console.WriteLine("🔄 Réorganisation après suppression Image2");
            }
            else if (imageNumber == 3)
            {
                newImageUrl1 = currentImage1;
                newImageUrl2 = currentImage2;
                newImageUrl3 = null;
                Console.WriteLine("🔄 Réorganisation après suppression Image3");
            }

            product.ImageUrl1 = newImageUrl1;
            product.ImageUrl2 = newImageUrl2;
            product.ImageUrl3 = newImageUrl3;
            product.ImageUrl = newImageUrl1 ?? newImageUrl2 ?? newImageUrl3;
            product.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            Console.WriteLine($"📸 Images après réorganisation: Image1={product.ImageUrl1}, Image2={product.ImageUrl2}, Image3={product.ImageUrl3}");

            var updatedProduct = new
            {
                product.Id,
                product.Name,
                product.Description,
                product.Price,
                product.Stock,
                product.Category,
                product.ShopId,
                ImageUrl1 = product.ImageUrl1,
                ImageUrl2 = product.ImageUrl2,
                ImageUrl3 = product.ImageUrl3,
                ImageUrl = product.ImageUrl,
                product.CreatedAt,
                product.UpdatedAt
            };

            return Ok(new
            {
                message = $"Image {imageNumber} supprimée avec succès",
                product = updatedProduct
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Erreur suppression image: {ex.Message}");
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

    // ============ NOUVELLES MÉTHODES POUR LES VARIANTES DE COULEUR ============

    [HttpPost("{id}/variants")]
    [Authorize]
    public async Task<IActionResult> UpsertVariant(int id, [FromBody] UpsertColorVariantDto dto)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var result = await _productService.UpsertColorVariantAsync(id, userId, dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}/variants/{color}")]
    [Authorize]
    public async Task<IActionResult> DeleteVariant(int id, string color)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var result = await _productService.DeleteColorVariantAsync(id, userId, color);
            if (!result)
                return NotFound(new { message = "Variante non trouvée" });
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ⭐⭐⭐ NOUVELLE ROUTE : Supprimer une image spécifique d'une variante ⭐⭐⭐
    [HttpDelete("{id}/variants/{color}/image/{imageNumber}")]
    [Authorize]
    public async Task<IActionResult> DeleteVariantImage(int id, string color, int imageNumber)
    {
        if (imageNumber < 1 || imageNumber > 3)
            return BadRequest(new { message = "Le numéro d'image doit être entre 1 et 3" });

        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var result = await _productService.DeleteVariantImageAsync(id, color, imageNumber, userId);

            if (result == null)
                return NotFound(new { message = "Variante non trouvée" });

            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/variants/{color}/upload-images")]
    [Authorize]
    public async Task<IActionResult> UploadVariantImages(int id, string color, [FromForm] ProductImageUploadDto images)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await _productService.UploadVariantImagesAsync(id, color, userId, images);
            return Ok(new { message = "Images de variante uploadées avec succès" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ⭐⭐⭐ GetVariants AVEC Sizes ⭐⭐⭐
    [HttpGet("{id}/variants")]
    public async Task<IActionResult> GetVariants(int id)
    {
        var product = await _context.Products
            .Include(p => p.ColorVariants)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            return NotFound("Produit non trouvé");

        var variants = product.ColorVariants.Select(v => new ProductColorVariantDto
        {
            Id = v.Id,
            Color = v.Color,
            CustomName = v.CustomName,
            Stock = v.Stock,
            Sizes = v.Size,
            ImageUrl1 = v.ImageUrl1,
            ImageUrl2 = v.ImageUrl2,
            ImageUrl3 = v.ImageUrl3
        }).ToList();

        return Ok(variants);
    }

    // ⭐⭐⭐ GetVariant AVEC Sizes ⭐⭐⭐
    [HttpGet("{id}/variants/{color}")]
    public async Task<IActionResult> GetVariant(int id, string color)
    {
        var variant = await _context.ProductColorVariants
            .FirstOrDefaultAsync(v => v.ProductId == id && v.Color == color);

        if (variant == null)
            return NotFound("Variante non trouvée");

        var dto = new ProductColorVariantDto
        {
            Id = variant.Id,
            Color = variant.Color,
            CustomName = variant.CustomName,
            Stock = variant.Stock,
            Sizes = variant.Size,
            ImageUrl1 = variant.ImageUrl1,
            ImageUrl2 = variant.ImageUrl2,
            ImageUrl3 = variant.ImageUrl3
        };

        return Ok(dto);
    }

    // ============ MÉTHODE PRIVÉE POUR RÉCUPÉRER UN PRODUIT AVEC SES VARIANTES ============

    // ⭐⭐⭐ GetProductByIdResponse AVEC Sizes ⭐⭐⭐
    private async Task<ProductResponseDto?> GetProductByIdResponse(int id)
    {
        return await _context.Products
            .Include(p => p.Shop)
            .Include(p => p.ColorVariants)
            .Where(p => p.Id == id)
            .Select(p => new ProductResponseDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                Stock = p.Stock,
                Size = p.Size,
                Color = p.Color,
                Category = p.Category,
                ShopId = p.ShopId,
                ShopName = p.Shop != null ? p.Shop.Name : null,
                ImageUrl = p.ImageUrl,
                ImageUrl1 = p.ImageUrl1,
                ImageUrl2 = p.ImageUrl2,
                ImageUrl3 = p.ImageUrl3,
                CreatedAt = p.CreatedAt,
                Variants = p.ColorVariants.Select(v => new ProductColorVariantDto
                {
                    Id = v.Id,
                    Color = v.Color,
                    CustomName = v.CustomName,
                    Stock = v.Stock,
                    Sizes = v.Size,
                    ImageUrl1 = v.ImageUrl1,
                    ImageUrl2 = v.ImageUrl2,
                    ImageUrl3 = v.ImageUrl3
                }).ToList()
            })
            .FirstOrDefaultAsync();
    }
}