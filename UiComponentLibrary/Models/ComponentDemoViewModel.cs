using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace UiComponentLibrary.Models;

public sealed class ComponentDemoViewModel
{
    [Display(Name = "姓名")]
    public string? Name { get; set; }

    [Display(Name = "電子郵件")]
    public string? Email { get; set; }

    [Display(Name = "備註")]
    public string? Notes { get; set; }

    [Display(Name = "國家／地區")]
    public string? Country { get; set; }

    [Display(Name = "技能標籤")]
    public List<string> Skills { get; set; } = [];

    [Display(Name = "訂閱電子報")]
    public bool EmailUpdates { get; set; }

    [Display(Name = "偏好的聯絡方式")]
    public string? PreferredContact { get; set; }

    [Display(Name = "預約日期")]
    public DateOnly? SelectedDate { get; set; }

    [Display(Name = "開始日期與時間")]
    public DateTime? SelectedDateTime { get; set; }

    [Display(Name = "開始時間")]
    public TimeOnly? SelectedTime { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public IFormFile? UploadFile { get; set; }

    public IReadOnlyList<SelectListItem> Countries { get; set; } = [];

    public IReadOnlyList<SelectListItem> SkillOptions { get; set; } = [];

    public IReadOnlyList<DataTableDemoRow> DataTableRows { get; set; } = [];
}

public sealed record DataTableDemoRow(
    string UnitCode,
    string UnitName,
    string EmployeeCode,
    string Name,
    string Title,
    string Instructor);
