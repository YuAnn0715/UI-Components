using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using UiComponentLibrary.Models;

namespace UiComponentLibrary.Controllers;

public sealed class HomeController : Controller
{
    [HttpGet]
    public IActionResult Index() => View(CreateModel());

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Index(ComponentDemoViewModel model)
    {
        model.Countries = CreateCountries();
        model.SkillOptions = CreateSkillOptions();
        return View(model);
    }

    private static ComponentDemoViewModel CreateModel() => new()
    {
        Countries = CreateCountries(),
        SkillOptions = CreateSkillOptions(),
        Skills = ["csharp", "aspnet-core"],
        EmailUpdates = true,
        PreferredContact = "Email",
        SelectedDate = DateOnly.FromDateTime(DateTime.Today),
        SelectedDateTime = DateTime.Today.AddHours(9),
        SelectedTime = new TimeOnly(9, 0),
        StartDate = DateOnly.FromDateTime(DateTime.Today),
        EndDate = DateOnly.FromDateTime(DateTime.Today.AddDays(3))
    };

    private static IReadOnlyList<SelectListItem> CreateCountries() =>
    [
        new("請選擇", ""),
        new("台灣", "TW"),
        new("日本", "JP"),
        new("美國", "US")
    ];

    private static IReadOnlyList<SelectListItem> CreateSkillOptions() =>
    [
        new("C#", "csharp"),
        new("ASP.NET Core", "aspnet-core"),
        new("JavaScript", "javascript"),
        new("TypeScript", "typescript"),
        new("SQL", "sql")
    ];
}
