using Microsoft.AspNetCore.Mvc;
using MyBackendApi.Models;

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
    public async Task<IActionResult> GetAll()
    {
        var products = await _productService.GetAllProductsAsync();
        return Ok(products);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var product = await _productService.GetProductByIdAsync(id);
        if (product == null)
            throw new ProductNotFoundException(id);

        return Ok(product);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Product product)
    {
        if (product.Stock < 0 || product.Price < 0 || string.IsNullOrWhiteSpace(product.Name))
        {
            return BadRequest(new
            {
                error = "Invalid product data.",
                details = "stock and price must be >= 0, name cannot be empty."
            });
        }

        var createdProduct = await _productService.CreateAsync(product);

        return CreatedAtAction(
            nameof(GetById),
            new { id = createdProduct.Id },
            createdProduct
        );
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Product product)
    {
        if (product.Stock < 0 || product.Price < 0 || string.IsNullOrWhiteSpace(product.Name))
        {
            return BadRequest("Invalid product data.");
        }

        var updated = await _productService.UpdateAsync(id, product);
        if (!updated)
            throw new ProductNotFoundException(id);
            
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _productService.DeleteAsync(id);
        if (!deleted)
            throw new ProductNotFoundException(id);

        return NoContent();
    }

    [HttpGet("in-stock")]
    public async Task<IActionResult> GetProductsInStock()
    {
        var products = await _productService.GetProductsInStockAsync();
        return Ok(products);
    }
}
