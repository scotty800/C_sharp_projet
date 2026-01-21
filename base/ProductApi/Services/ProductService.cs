using System.Collections.Generic;
using System.Threading.Tasks;

public class ProductService : IProductService
{
    public Task<List<Product>> GetAllProductsAsync()
    {
        var products = new List<Product>
        {
            new Product { Id = 1, Name = "Laptop", Price = 999.99m },
            new Product { Id = 2, Name = "Smartphone", Price = 499.99m },
            new Product { Id = 3, Name = "Tablet", Price = 299.99m }
        };

        return Task.FromResult(products);
    }
}
