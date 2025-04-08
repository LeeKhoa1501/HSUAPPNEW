using System;
using HSUWebAPI.DTOs;

//using HSUWebAPI.Models;
using Microsoft.AspNetCore.Mvc;

namespace HSUWebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private const string EMAIL = "sinhvien@hoasen.edu.vn";
    private const string PASSWORD = "123456";

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginDto userLogin)
    {
        if (userLogin.Email.Equals(EMAIL, StringComparison.OrdinalIgnoreCase) && userLogin.Password.Equals(PASSWORD, StringComparison.OrdinalIgnoreCase))
        {
            return Ok(new { success = true, message = "Login Success!" });
        }
        else
        {
            return Unauthorized(new { success = false, message = "Login Invalid!" });
        }
    }
}
