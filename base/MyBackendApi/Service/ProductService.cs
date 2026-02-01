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

    public async Task<IEnumerable<Product>> GetPagedAsync(
    int page,
    int pageSize,
    decimal? minPrice,
    decimal? maxPrice,
    string? sortBy)
    
    {
        var query = _context.Products.AsQueryable();
        
        if (minPrice.HasValue)
            query = query.Where(p => p.Price >= minPrice.Value);
        
        if (maxPrice.HasValue)
            query = query.Where(p => p.Price <= maxPrice.Value);
            
        query = sortBy switch
        {
            "name"  => query.OrderBy(p => p.Name),
            "price" => query.OrderBy(p => (double)p.Price),
            _       => query.OrderBy(p => p.Id)
        };
        
        return await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new Product
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price
            })
            .ToListAsync();
    }

}
