using Microsoft.AspNetCore.Mvc;
using MyBackendApi.Models;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/auth")]

public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest(new
            {
                error = "Username and password are required."
            });
        }
        
        // 🔒 Ici normalement : vérif DB (password hash)
        var token = _authService.GenerateToken(
            request.Username,
            "Admin",
            request.Username + "@example.com"
        );
        return Ok(new { token });
    }

}

public class LoginRequest
{
    public required string Username { get; set; }
    public required string Password { get; set; }
}
