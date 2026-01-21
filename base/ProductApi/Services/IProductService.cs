using System.Collections.Generic;
using System.Threading.Tasks;

public interface IProductService
{
   Task<List<Product>> GetAllProductsAsync();
}