using HSUWebAPI.Model;
using Microsoft.AspNetCore.Mvc;

namespace HSUWebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HomeController : ControllerBase
{
  private readonly List<MenuModel> _menuModels = new List<MenuModel>(){
      new MenuModel {
        Name = "Absent Report",
        Icon = "absent",
        TargetPage = "absent",
        IconColor = "#000080"
      },
      new MenuModel {
        Name = "Advisor Feedback",
        Icon = "feedback",
        TargetPage = "advisor",
        IconColor = "#000080"
      },
      new MenuModel {
        Name = "Attendence",
        Icon = "attendance",
        TargetPage = "attendance",
        IconColor = "#000080"
      },
      new MenuModel {
        Name = "Book Room",
        Icon = "book",
        TargetPage = "book",
        IconColor = "#000080"
      },
      new MenuModel {
        Name = "Course Feedback",
        Icon = "feedback",
        TargetPage = "course",
        IconColor = "#000080"
      },
      new MenuModel {
        Name = "Events Attendenced",
        Icon = "events",
        TargetPage = "events",
        IconColor = "#000080"
      },
      new MenuModel {
        Name = "Exam",
        Icon = "exam",
        TargetPage = "exam",
        IconColor = "#000080"
      },
      new MenuModel {
        Name = "Grade",
        Icon = "grade",
        TargetPage = "grade",
        IconColor = "#000080"
      },
      new MenuModel {
        Name = "Hand Book",
        Icon = "handbook",
        TargetPage = "handbook",
        IconColor = "#000080"
      },
      new MenuModel {
        Name = "Internship",
        Icon = "intern",
        TargetPage = "intern",
        IconColor = "#000080"
      },
  };

  [HttpGet("icons")]
  public ActionResult<IEnumerable<MenuModel>> GetIcons()
  {
    var menuModels = _menuModels;

    return Ok(menuModels);
  }
}
