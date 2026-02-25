using ECommerceApi.Data;
using ECommerceApi.Services;
using ECommerceApi.Middlewares;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using ECommerceApi.Settings;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 🔑 Configuration JWT
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("JWT Issuer not configured");
//builder.Services.Configure<StripeSettings>(builder.Configuration.GetSection("Stripe"));

// 🗄 Base de données
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=ecommerce.db"));

builder.Services.AddHttpContextAccessor();

// ✅ CONFIGURATION CORS - AJOUTÉ ICI
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins(
                "http://localhost:5173",     // Frontend Vite (port par défaut)
                "http://127.0.0.1:5173",     // Alternative
                "http://localhost:3000",      // Si tu utilises React Create App
                "http://127.0.0.1:3000",
                "http://localhost:8080"       // Au cas où
                )
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials(); // Important pour les cookies/auth
        });
});

// 🛠 Services DI
builder.Services.AddScoped<IUserServices, UserService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IShopService, ShopService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<AuthService>();

// 🔐 Authentification JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateIssuerSigningKey = true,
        ValidateLifetime = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtIssuer,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero,
        NameClaimType = ClaimTypes.NameIdentifier,
        RoleClaimType = ClaimTypes.Role
    };

    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"Authentication failed: {context.Exception.Message}");
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            Console.WriteLine($"Token validated for user: {context.Principal?.Identity?.Name}");
            if (context.Principal?.Claims != null)
            {
                foreach (var claim in context.Principal.Claims)
                {
                    Console.WriteLine($"  Claim: {claim.Type} = {claim.Value}");
                }
            }
            return Task.CompletedTask;
        }
    };
});

// 📦 Contrôleurs
builder.Services.AddControllers();

// 🖼 Gestion des fichiers statiques (uploads)
builder.Services.AddDirectoryBrowser();
builder.Services.AddSingleton<IWebHostEnvironment>(builder.Environment);

// 🔧 Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 🌱 Middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseDeveloperExceptionPage();
}

// ✅ ORDRE CRITIQUE DES MIDDLEWARES
app.UseRouting(); // 1. Routing en premier

app.UseCors("AllowFrontend"); // 2. CORS immédiatement après Routing

// Middleware custom pour les exceptions
app.UseMiddleware<ExceptionMiddleware>();
app.UseMiddleware<TrackingMiddleware>();

// HTTPS, Auth
app.UseHttpsRedirection();
app.UseAuthentication(); // 3. Authentication après CORS
app.UseAuthorization(); // 4. Authorization après Authentication

// 📂 Servir les fichiers statiques pour les uploads (logo, banner, products)
app.UseStaticFiles(); // wwwroot
app.UseFileServer(new FileServerOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
        Path.Combine(app.Environment.WebRootPath, "uploads")),
    RequestPath = "/uploads",
    EnableDirectoryBrowsing = true
});

// 🔨 Créer la base si nécessaire
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.EnsureCreated();

    // Créer le dossier uploads si inexistant
    var uploadsPath = Path.Combine(app.Environment.WebRootPath, "uploads");
    if (!Directory.Exists(uploadsPath))
        Directory.CreateDirectory(uploadsPath);
}

// 🔗 Mapper les contrôleurs (doit être après tous les middlewares)
app.MapControllers();

app.Run();