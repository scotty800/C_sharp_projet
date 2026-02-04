using Microsoft.AspNetCore.Mvc;
using ECommerceApi.Models;
using ECommerceApi.Services;
using BCrypt.Net;
using ECommerceApi.DTO;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/users")]
public class UserController : ControllerBase
{
    private readonly IUserServices _userService;

    public UserController(IUserServices userService)
    {
        _userService = userService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _userService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetUserById(int id)
    {
        var user = await _userService.GetUserByIdAsync(id);
        if (user == null)
            return NotFound();

        return Ok(user);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest("Invalid user data");
        }

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            Role = request.Role
        };

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        }

        var updatedUser = await _userService.UpdateAsync(id, user);
        if (!updatedUser)
            return NotFound("Utilisateur non trouvé");

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var deletedUser = await _userService.DeleteAsync(id);
        if (!deletedUser)
            return NotFound("Utilisateur non trouvé");
        
        return NoContent();
    }
}
