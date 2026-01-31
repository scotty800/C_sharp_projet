using MyBackendApi.Models;
using MyBackendApi.Data;
using Microsoft.EntityFrameworkCore;

public class ProductService : IProductService
{
    private readonly AppDbContext _context;

    public ProductService(AppDbContext context)
    {
        _context = context;
    }

    public Task<List<Product>> GetAllProductsAsync()
    {
        return Task.FromResult(_context.Products.ToList());
    }

    public Task<Product?> GetProductByIdAsync(int id)
    {
        var product = _context.Products.FirstOrDefault(p => p.Id == id);
        return Task.FromResult(product);
    }

    public Task<Product> CreateAsync(Product product)
    {
        _context.Products.Add(product);
        _context.SaveChanges();
        return Task.FromResult(product);
    }

    public Task<bool> UpdateAsync(int id, Product product)
    {
        var existing = _context.Products.FirstOrDefault(p => p.Id == id);
        if (existing == null) return Task.FromResult(false);

        existing.Name = product.Name;
        existing.Price = product.Price;
        existing.Stock = product.Stock;
        _context.SaveChangesAsync();
        return Task.FromResult(true);
    }

    public Task<bool> DeleteAsync(int id)
    {
        var product = _context.Products.FirstOrDefault(p => p.Id == id);
        if (product == null) return Task.FromResult(false);

        _context.Products.Remove(product);
        _context.SaveChanges();
        return Task.FromResult(true);
    }

    public Task<List<Product>> GetProductsInStockAsync()
    {
        var productsInStock = _context.Products
            .Where(p => p.Stock > 0)
            .ToList();
        return Task.FromResult(productsInStock);
    }
}
