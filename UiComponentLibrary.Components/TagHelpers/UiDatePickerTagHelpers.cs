using System.Globalization;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace UiComponentLibrary.Components.TagHelpers;

public abstract class UiDatePickerTagHelperBase : UiFormControlTagHelperBase
{
    public string? ConfirmColor { get; set; }
    public string? CancelColor { get; set; }
    public string? EndpointColor { get; set; }

    protected TagBuilder CreateDateControl(string mode)
    {
        var control = CreateControl("input", "form-control ui-control ui-date-control");
        control.Attributes["type"] = "text";
        control.Attributes["readonly"] = "readonly";
        control.Attributes["autocomplete"] = "off";
        control.Attributes["data-ui-date-control"] = mode;
        control.Attributes["value"] = FormatValue(For.Model, mode);
        return control;
    }

    protected void AddDateThemeVariables(TagBuilder wrapper)
    {
        var values = new Dictionary<string, string?>
        {
            ["--ui-confirm-color"] = UiThemeColor.Normalize(ConfirmColor),
            ["--ui-cancel-color"] = UiThemeColor.Normalize(CancelColor),
            ["--ui-range-endpoint-color"] = UiThemeColor.Normalize(EndpointColor)
        };
        var style = string.Join(";", values.Where(pair => !string.IsNullOrWhiteSpace(pair.Value))
            .Select(pair => $"{pair.Key}:{pair.Value}"));
        if (!string.IsNullOrEmpty(style)) wrapper.MergeAttribute("style", style, replaceExisting: false);
    }

    public static string FormatValue(object? value, string mode) => value switch
    {
        DateOnly date => date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
        DateTime dateTime when mode == "datetime" => dateTime.ToString("yyyy-MM-dd HH:mm", CultureInfo.InvariantCulture),
        DateTime dateTime => dateTime.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
        DateTimeOffset dateTimeOffset when mode == "datetime" => dateTimeOffset.ToString("yyyy-MM-dd HH:mm", CultureInfo.InvariantCulture),
        DateTimeOffset dateTimeOffset => dateTimeOffset.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
        TimeOnly time => time.ToString("HH:mm", CultureInfo.InvariantCulture),
        _ => string.Empty
    };

    protected IHtmlContent BuildDateField(TagBuilder control)
    {
        var field = BuildField(control);
        if (field is TagBuilder wrapper) AddDateThemeVariables(wrapper);
        return field;
    }
}

[HtmlTargetElement("ui-date-picker", Attributes = "asp-for")]
public sealed class UiDatePickerTagHelper : UiDatePickerTagHelperBase
{
    protected override string ComponentKind => "date-picker";

    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        output.TagName = null;
        output.Content.SetHtmlContent(BuildDateField(CreateDateControl("date")));
    }
}

[HtmlTargetElement("ui-date-time-picker", Attributes = "asp-for")]
public sealed class UiDateTimePickerTagHelper : UiDatePickerTagHelperBase
{
    protected override string ComponentKind => "date-time-picker";

    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        output.TagName = null;
        output.Content.SetHtmlContent(BuildDateField(CreateDateControl("datetime")));
    }
}

[HtmlTargetElement("ui-time-picker", Attributes = "asp-for")]
public sealed class UiTimePickerTagHelper : UiDatePickerTagHelperBase
{
    protected override string ComponentKind => "time-picker";

    public string? ControlColor { get; set; }
    [HtmlAttributeName("flip-number-color")]
    public string? FlipNumberColor { get; set; }
    [HtmlAttributeName("flip-number-background-color")]
    public string? FlipNumberBackgroundColor { get; set; }

    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        var control = CreateControl("input", "form-control ui-control ui-time-control");
        control.Attributes["type"] = "text";
        control.Attributes["readonly"] = "readonly";
        control.Attributes["autocomplete"] = "off";
        control.Attributes["data-ui-time-control"] = "true";
        control.Attributes["value"] = FormatValue(For.Model, "time");
        var field = BuildDateField(control);
        if (field is TagBuilder wrapper)
        {
            var style = string.Join(";", new Dictionary<string, string?>
            {
                ["--ui-time-control-color"] = UiThemeColor.Normalize(ControlColor),
                ["--ui-flip-number-color"] = UiThemeColor.Normalize(FlipNumberColor),
                ["--ui-flip-number-background"] = UiThemeColor.Normalize(FlipNumberBackgroundColor)
            }.Where(pair => !string.IsNullOrWhiteSpace(pair.Value)).Select(pair => $"{pair.Key}:{pair.Value}"));
            if (!string.IsNullOrWhiteSpace(style)) wrapper.MergeAttribute("style", style, replaceExisting: false);
        }
        output.TagName = null;
        output.Content.SetHtmlContent(field);
    }
}

[HtmlTargetElement("ui-date-range-picker", Attributes = "asp-for-start,asp-for-end")]
public sealed class UiDateRangePickerTagHelper : TagHelper
{
    [HtmlAttributeName("asp-for-start")]
    public ModelExpression StartFor { get; set; } = default!;

    [HtmlAttributeName("asp-for-end")]
    public ModelExpression EndFor { get; set; } = default!;

    public string? Label { get; set; }
    public string? BorderColor { get; set; }
    public string? FocusColor { get; set; }
    public string? TextColor { get; set; }
    public string? BackgroundColor { get; set; }
    public string? ConfirmColor { get; set; }
    public string? CancelColor { get; set; }
    public string? EndpointColor { get; set; }
    public string? RangeColor { get; set; }

    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        var wrapper = new TagBuilder("div");
        wrapper.AddCssClass("ui-field");
        wrapper.Attributes["data-ui-component"] = "date-range-picker";
        wrapper.Attributes["data-ui-for"] = StartFor.Name;
        wrapper.Attributes["data-ui-label"] = Label ?? "日期區間";
        wrapper.Attributes["data-ui-end-for"] = EndFor.Name;
        var variables = new Dictionary<string, string?>
        {
            ["--ui-border-color"] = UiThemeColor.Normalize(BorderColor),
            ["--ui-focus-color"] = UiThemeColor.Normalize(FocusColor),
            ["--ui-text-color"] = UiThemeColor.Normalize(TextColor),
            ["--ui-background-color"] = UiThemeColor.Normalize(BackgroundColor),
            ["--ui-confirm-color"] = UiThemeColor.Normalize(ConfirmColor),
            ["--ui-cancel-color"] = UiThemeColor.Normalize(CancelColor),
            ["--ui-range-endpoint-color"] = UiThemeColor.Normalize(EndpointColor),
            ["--ui-range-fill-color"] = UiThemeColor.Normalize(RangeColor)
        };
        var style = string.Join(";", variables.Where(pair => !string.IsNullOrWhiteSpace(pair.Value))
            .Select(pair => $"{pair.Key}:{pair.Value}"));
        if (!string.IsNullOrEmpty(style)) wrapper.Attributes["style"] = style;

        var display = new TagBuilder("input");
        display.Attributes["type"] = "text";
        display.Attributes["readonly"] = "readonly";
        display.Attributes["autocomplete"] = "off";
        display.Attributes["data-ui-date-control"] = "range";
        display.AddCssClass("form-control ui-control ui-date-control");
        display.Attributes["value"] = FormatRange(StartFor.Model, EndFor.Model);

        var start = new TagBuilder("input");
        start.Attributes["type"] = "hidden";
        start.Attributes["name"] = StartFor.Name;
        start.Attributes["value"] = UiDatePickerTagHelperBase.FormatValue(StartFor.Model, "date");
        start.Attributes["data-ui-range-start"] = "true";

        var end = new TagBuilder("input");
        end.Attributes["type"] = "hidden";
        end.Attributes["name"] = EndFor.Name;
        end.Attributes["value"] = UiDatePickerTagHelperBase.FormatValue(EndFor.Model, "date");
        end.Attributes["data-ui-range-end"] = "true";

        var label = new TagBuilder("label");
        label.Attributes["for"] = TagBuilder.CreateSanitizedId(StartFor.Name, "_");
        label.AddCssClass("form-label ui-label");
        label.InnerHtml.Append(Label ?? "日期區間");
        display.Attributes["id"] = TagBuilder.CreateSanitizedId(StartFor.Name, "_");

        wrapper.InnerHtml.AppendHtml(label);
        wrapper.InnerHtml.AppendHtml(display);
        wrapper.InnerHtml.AppendHtml(start);
        wrapper.InnerHtml.AppendHtml(end);
        output.TagName = null;
        output.Content.SetHtmlContent(wrapper);
    }

    private static string FormatRange(object? start, object? end)
    {
        var startText = UiDatePickerTagHelperBase.FormatValue(start, "date");
        var endText = UiDatePickerTagHelperBase.FormatValue(end, "date");
        return string.IsNullOrWhiteSpace(startText) && string.IsNullOrWhiteSpace(endText) ? string.Empty : $"{startText} 至 {endText}";
    }
}
