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
        model.DataTableRows = CreateDataTableRows();
        return View(model);
    }

    private static ComponentDemoViewModel CreateModel() => new()
    {
        Countries = CreateCountries(),
        SkillOptions = CreateSkillOptions(),
        DataTableRows = CreateDataTableRows(),
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

    private static IReadOnlyList<DataTableDemoRow> CreateDataTableRows() =>
    [
        new("147", "虎尾分行", "067378", "黃＊＊", "高級襄理", "是"),
        new("043", "頭份分行", "067389", "杜＊＊", "高級專員", "是"),
        new("009", "臺南分行", "070896", "白＊＊", "初級專員", "是"),
        new("004", "發行部", "070908", "葉＊＊", "中級專員", "是"),
        new("014", "嘉義分行", "073752", "吳＊＊", "中級專員", "是"),
        new("022", "宜蘭分行", "073763", "林＊＊", "高級襄理", "是"),
        new("102", "資訊處", "073774", "吳＊＊", "中級專員", "是"),
        new("278", "中都分行", "080059", "周＊＊", "副經理", "是"),
        new("170", "太平分行", "080060", "傅＊＊", "中級襄理", "是"),
        new("008", "信託部", "080093", "施＊＊", "辦事員", "是"),
        new("031", "新竹分行", "081245", "陳＊＊", "高級專員", "否"),
        new("056", "台中分行", "082116", "張＊＊", "中級專員", "是")
    ];
}
