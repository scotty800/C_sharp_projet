using Microsoft.AspNetCore.Mvc;
using ECommerceApi.Models;
using ECommerceApi.Services;

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
    public async Task<IActionResult> GettAllUser()
    {
        var users = await _userService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(int id)
    {
        var user = await _userService.GetUserByIdAsync(id);
        if (user == null)
            return NotFound();

        return Ok(user);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] User user)
    {
        if (string.IsNullOrWhiteSpace(user.Username) || string.IsNullOrWhiteSpace(user.Email) || string.IsNullOrWhiteSpace(user.Password))
        {
            return BadRequest("Invalid user data");
        }

        var updatedUser = await _userService.UpdateAsync(id, user);
        if (!updatedUser)
            return NotFound("Utilisateur non trouvé");

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var deletedUser = await _userService.DeleteAsync(id);
        if (!deletedUser)
            return NotFound("Utilisateur non trouvé");
        
        return NoContent();
    }
}
