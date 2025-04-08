using System;

namespace HSUWebAPI.Model;

public class MenuModel
{
  public required string Name { get; set; }
  public string Description { get; set; } = "";
  public required string Icon { get; set; }
  public required string TargetPage { get; set; }
  public required string IconColor { get; set; }
}
