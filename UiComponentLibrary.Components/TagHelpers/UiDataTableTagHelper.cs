using Microsoft.AspNetCore.Razor.TagHelpers;

namespace UiComponentLibrary.Components.TagHelpers;

[HtmlTargetElement("ui-data-table")]
public sealed class UiDataTableTagHelper : TagHelper
{
    public int PageSize { get; set; } = 10;

    [HtmlAttributeName("page-size-options")]
    public string PageSizeOptions { get; set; } = "10,25,50";

    public bool Sortable { get; set; } = true;
    public bool Striped { get; set; } = true;
    public bool Hover { get; set; } = true;
    public bool Compact { get; set; }

    [HtmlAttributeName("page-size-label")]
    public string PageSizeLabel { get; set; } = "筆／頁";

    [HtmlAttributeName("pagination-label")]
    public string PaginationLabel { get; set; } = "資料表分頁";

    [HtmlAttributeName("header-background-color")]
    public string? HeaderBackgroundColor { get; set; }

    [HtmlAttributeName("header-text-color")]
    public string? HeaderTextColor { get; set; }

    [HtmlAttributeName("table-border-color")]
    public string? TableBorderColor { get; set; }

    [HtmlAttributeName("stripe-background-color")]
    public string? StripeBackgroundColor { get; set; }

    [HtmlAttributeName("accent-color")]
    public string? AccentColor { get; set; }

    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        output.TagName = "div";
        output.Attributes.SetAttribute("class", BuildClass(output.Attributes["class"]?.Value?.ToString()));
        output.Attributes.SetAttribute("data-ui-component", "data-table");
        output.Attributes.SetAttribute("data-ui-data-table", "true");
        output.Attributes.SetAttribute("data-ui-page-size", Math.Max(1, PageSize).ToString());
        output.Attributes.SetAttribute("data-ui-page-size-options", NormalizePageSizeOptions());
        output.Attributes.SetAttribute("data-ui-sortable", Sortable ? "true" : "false");
        output.Attributes.SetAttribute("data-ui-striped", Striped ? "true" : "false");
        output.Attributes.SetAttribute("data-ui-hover", Hover ? "true" : "false");
        output.Attributes.SetAttribute("data-ui-page-size-label", PageSizeLabel);
        output.Attributes.SetAttribute("data-ui-pagination-label", PaginationLabel);
        if (Compact) output.Attributes.SetAttribute("data-ui-compact", "true");

        foreach (var attribute in new[]
        {
            "page-size", "page-size-options", "sortable", "striped", "hover", "compact", "page-size-label", "pagination-label",
            "header-background-color", "header-text-color", "table-border-color",
            "stripe-background-color", "accent-color"
        })
        {
            output.Attributes.RemoveAll(attribute);
        }

        var variables = new Dictionary<string, string?>
        {
            ["--ui-table-header-background"] = UiThemeColor.Normalize(HeaderBackgroundColor),
            ["--ui-table-header-text"] = UiThemeColor.Normalize(HeaderTextColor),
            ["--ui-table-border"] = UiThemeColor.Normalize(TableBorderColor),
            ["--ui-table-stripe"] = UiThemeColor.Normalize(StripeBackgroundColor),
            ["--ui-table-accent"] = UiThemeColor.Normalize(AccentColor)
        };
        var style = string.Join(";", variables
            .Where(pair => !string.IsNullOrWhiteSpace(pair.Value))
            .Select(pair => $"{pair.Key}:{pair.Value}"));
        if (!string.IsNullOrWhiteSpace(style)) output.Attributes.SetAttribute("style", style);
    }

    private string NormalizePageSizeOptions()
    {
        var values = PageSizeOptions
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(value => int.TryParse(value, out var number) ? number : 0)
            .Where(number => number > 0)
            .Distinct()
            .Order()
            .ToArray();

        return values.Length > 0 ? string.Join(',', values) : Math.Max(1, PageSize).ToString();
    }

    private string BuildClass(string? existing)
    {
        var classes = new List<string> { "ui-data-table" };
        if (!string.IsNullOrWhiteSpace(existing)) classes.Add(existing);
        return string.Join(' ', classes);
    }
}
