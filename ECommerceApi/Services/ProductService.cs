using ECommerceApi.Models;
using ECommerceApi.Data;
using Microsoft.EntityFrameworkCore;

namespace ECommerceApi.Services
{
    public class ProductService : IProductService
    {
        private readonly AppDbContext _context;
        
        public ProductService(AppDbContext context)
        {
            _context = context;
        }
        
        public async Task<List<Product>> GetAllProductsAsync()
        {
            return await _context.Products.ToListAsync();
        }
        
        public async Task<Product?> GetProductByIdAsync(int id)
        {
            return await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
        }
        
        public async Task<Product> CreateAsync(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return product;
        }
        
        public async Task<bool> UpdateAsync(int id, Product product)
        {
            var existing = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
            if (existing == null) return false;
            
            existing.Name = product.Name;
            existing.Price = product.Price;
            existing.Stock = product.Stock;
            existing.Size = product.Size;
            existing.Color = product.Color;
            existing.Category = product.Category;
            existing.Description = product.Description;
            
            await _context.SaveChangesAsync();
            return true;
        }
        
        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
            if (existing == null) return false;
            
            _context.Products.Remove(existing);
            await _context.SaveChangesAsync();
            return true;
        }
        
        public async Task<List<Product>> GetProductsInStockAsync()
        {
            return await _context.Products
                .Where(p => p.Stock > 0)
                .ToListAsync();
        }
    }

}