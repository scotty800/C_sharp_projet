using Microsoft.AspNetCore.Mvc;
using ECommerceApi.Services;
using ECommerceApi.Models;
using ECommerceApi.DTO;
using BCrypt.Net;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IUserServices _userService;
    private readonly AuthService _authService;

    public AuthController(IUserServices userService, AuthService authService)
    {
        _userService = userService;
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var existingUser = await _userService.GetByEmailAsync(request.Email);
        if (existingUser != null)
            return BadRequest("Email already exists");

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = request.Role ?? "User"
        };

        var createdUser = await _userService.CreateUserAsync(user);
        

        var token = _authService.GenerateJwtToken(
            createdUser.Id,
            createdUser.Username,
            createdUser.Email,
            createdUser.Role
        );

        return Ok(new
        {
            token,
            user = new
            {
                createdUser.Id,
                createdUser.Username,
                createdUser.Email,
                createdUser.Role
            }
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = await _userService.GetByEmailAsync(request.Email);
        if (user == null)
            throw new LoginErrorException(request.Email);

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new LoginErrorException(request.Password);

        var token = _authService.GenerateJwtToken(
            user.Id,
            user.Username,
            user.Email,
            user.Role
        );

        return Ok(new
        {
            token,
            user = new
            {
                user.Id,
                user.Username,
                user.Email,
                user.Role
            }
        });
    }
}
