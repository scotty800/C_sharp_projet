using Microsoft.AspNetCore.Mvc;
using ECommerceApi.Models;
using ECommerceApi.Services;

[ApiController]
[Route("api/products")]
public class ProductController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductController(IProductService productService)
    {
        _productService = productService;
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
            throw new ProductErrorException("Produit introuvable");

        return Ok(product);
    }

    [HttpPost]
    public async Task<IActionResult> CreateProduct([FromBody] Product product)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var createdProduct = await _productService.CreateAsync(product);

        return CreatedAtAction(
            nameof(GetById),
            new { id = createdProduct.Id },
            createdProduct
        );
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] Product product)
    {
        if (product.Stock < 0 || product.Price < 0 || (product.Description?.Length ?? 0) > 500 || string.IsNullOrWhiteSpace(product.Name))
        {
            return BadRequest("Invalid product data");
        }

        var updated = await _productService.UpdateAsync(id, product);
        if (!updated)
            throw new ProductErrorException("Produit introuvable");

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var deleted = await _productService.DeleteAsync(id);
        if (!deleted)
            throw new ProductErrorException("Produit introuvable");

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
        [FromQuery] string? sortBy = null
    )
    {
        var result = await _productService.GetPagedAsync(
            page,
            pageSize,
            minPrice,
            maxPrice,
            sortBy
        );

        return Ok(result);
    }
}
