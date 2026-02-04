using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;

    public ExceptionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (LoginErrorException ex)
        {
            context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
            context.Response.ContentType = "application/json";

            var response = new
            {
                status = context.Response.StatusCode,
                error = ex.Message
            };

            await context.Response.WriteAsync(
                JsonSerializer.Serialize(response)
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERREUR COMPLÈTE: {ex}");
            context.Response.StatusCode = 500;
            context.Response.ContentType = "application/json";

            var response = new
            {
                status = 500,
                error = "Erreur interne du serveur",
                details = ex.Message, // Temporairement pour déboguer
                stackTrace = ex.StackTrace
            };

            await context.Response.WriteAsync(
                JsonSerializer.Serialize(response)
            );
        }
    }
}
