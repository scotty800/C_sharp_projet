using MyBackendApi.Models;

public class ProductService : IProductService
{
    private static List<Product> _products = new()
    {
        new Product { Id = 1, Name = "Keyboard", Price = 10.00m },
        new Product { Id = 2, Name = "Mouse", Price = 20.00m },
    };

    public Task<List<Product>> GetAllProductsAsync()
    {
        return Task.FromResult(_products);
    }

    public Task<Product?> GetProductByIdAsync(int id)
    {
        var product = _products.FirstOrDefault(p => p.Id == id);
        return Task.FromResult(product);
    }

    public Task<Product> CreateAsync(Product product)
    {
        product.Id = _products.Max(p => p.Id) + 1;
        _products.Add(product);
        return Task.FromResult(product);
    }

    public Task<bool> UpdateAsync(int id, Product product)
    {
        var existing = _products.FirstOrDefault(p => p.Id == id);
        if (existing == null) return Task.FromResult(false);

        existing.Name = product.Name;
        existing.Price = product.Price;
        return Task.FromResult(true);
    }

    public Task<bool> DeleteAsync(int id)
    {
        var product = _products.FirstOrDefault(p => p.Id == id);
        if (product == null) return Task.FromResult(false);

        _products.Remove(product);
        return Task.FromResult(true);
    }
}
