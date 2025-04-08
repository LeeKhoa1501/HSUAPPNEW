using System;
using Microsoft.AspNetCore.Mvc;

namespace HSUWebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HelloController : ControllerBase
{
  [HttpGet()]
  public string GetHello() {
    return "Hello World From Back-end!";
  }
}
