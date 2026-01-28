using Microsoft.EntityFrameworkCore;
using MyBackendApi.Models;

namespace MyBackendApi.Data  // 🔥 doit matcher le dossier
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<Product> Products { get; set; }
        public DbSet<User> Users { get; set; }
    }
}
