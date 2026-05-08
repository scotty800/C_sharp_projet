using Microsoft.EntityFrameworkCore;
using ECommerceApi.Models;

namespace ECommerceApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Shop> Shops { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<ProductView> ProductViews { get; set; }
        public DbSet<ShopVisit> ShopVisits { get; set; }

        // Personnalisation avancée
        public DbSet<ShopCustomization> ShopCustomizations { get; set; }
        public DbSet<CustomSection> CustomSections { get; set; }
        public DbSet<CustomAsset> CustomAssets { get; set; }
        public DbSet<Template> Templates { get; set; }
        public DbSet<ShopProductCustomization> ShopProductCustomizations { get; set; }
        public DbSet<CustomizationSnapshot> CustomizationSnapshots { get; set; }
        public DbSet<Asset> Assets { get; set; }

        // Filtres
        public DbSet<ImageFilter> ImageFilters { get; set; }
        public DbSet<ProductImageFilter> ProductImageFilters { get; set; }
        public DbSet<ShopFilter> ShopFilters { get; set; }

        // ❌ SUPPRIMÉ - ImageSelection pour la bibliothèque d'images
        // public DbSet<ImageSelection> ImageSelections { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuration existante
            modelBuilder.Entity<Shop>()
                .HasMany(s => s.Products)
                .WithOne(p => p.Shop)
                .HasForeignKey(p => p.ShopId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<User>()
                .HasMany(u => u.Shops)
                .WithOne(s => s.Owner)
                .HasForeignKey(s => s.OwnerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Shop>()
                .HasIndex(s => s.Slug)
                .IsUnique();

            modelBuilder.Entity<Shop>()
                .HasIndex(s => s.Name);

            modelBuilder.Entity<Product>()
                .HasIndex(p => p.Name);

            modelBuilder.Entity<Product>()
                .HasIndex(p => p.ShopId);

            modelBuilder.Entity<Review>()
                .HasIndex(r => new { r.UserId, r.ProductId })
                .IsUnique();

            modelBuilder.Entity<Order>()
                .HasOne(o => o.User)
                .WithMany(u => u.Orders)
                .HasForeignKey(o => o.UserId);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Product)
                .WithMany(p => p.OrderItems)
                .HasForeignKey(oi => oi.ProductId);

            modelBuilder.Entity<Cart>()
                .HasIndex(c => c.UserId)
                .IsUnique();

            modelBuilder.Entity<ProductView>()
                .HasIndex(pv => new { pv.ProductId, pv.ViewedAt });

            modelBuilder.Entity<ShopVisit>()
                .HasIndex(sv => new { sv.ShopId, sv.VisitedAt });

            // ⭐ CONFIGURATIONS POUR LES FILTRES

            // Configuration de ImageFilter
            modelBuilder.Entity<ImageFilter>()
                .HasOne(i => i.ShopCustomization)
                .WithMany(s => s.ImageFilters)
                .HasForeignKey(i => i.ShopCustomizationId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configuration de ShopCustomization avec ActiveShopFilter
            modelBuilder.Entity<ShopCustomization>()
                .HasOne(s => s.ActiveShopFilter)
                .WithOne()
                .HasForeignKey<ShopCustomization>(s => s.ActiveShopFilterId)
                .OnDelete(DeleteBehavior.SetNull);

            // Configuration de ShopProductCustomization
            modelBuilder.Entity<ShopProductCustomization>()
                .HasIndex(sp => new { sp.ShopId, sp.ProductId })
                .IsUnique();

            // Configuration de CustomizationSnapshot
            modelBuilder.Entity<CustomizationSnapshot>()
                .HasIndex(cs => cs.ShopId);

            // Configuration de Asset
            modelBuilder.Entity<Asset>()
                .HasIndex(a => new { a.Type, a.Category });

            // Configuration de ShopFilter
            modelBuilder.Entity<ShopFilter>()
                .HasIndex(sf => sf.ShopId)
                .IsUnique();

            // Configuration de ProductImageFilter
            modelBuilder.Entity<ProductImageFilter>()
                .HasIndex(pf => new { pf.ShopId, pf.ProductId, pf.ImageIndex })
                .IsUnique();
        }
    }
}