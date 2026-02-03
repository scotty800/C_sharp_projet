using ECommerceApi.Data;
using ECommerceApi.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Ajouter les services
builder.Services.AddDbContext<AppDbContext>(opt => 
    opt.UseSqlite("Data Source=ecommerce.db"));

builder.Services.AddScoped<IProductService, ProductService>();

// Pour les controllers
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

// **Map les controllers**
app.MapControllers();

app.Run();
