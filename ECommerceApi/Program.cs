using ECommerceApi.Data;
using ECommerceApi.Services;  // Pour IProductService et ProductService
using Microsoft.EntityFrameworkCore;


var builder = WebApplication.CreateBuilder(args);


builder.Services.AddDbContext<AppDbContext>(opt => 
    opt.UseSqlite("Data Source=ecommerce.db"));

builder.Services.AddScoped<IProductService, ProductService>();
//builder.Services.AddScoped<IUserService, UserService>();
//builder.Services.AddSingleton<AuthService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.Run();


