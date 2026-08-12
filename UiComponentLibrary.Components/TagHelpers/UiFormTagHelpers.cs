using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace UiComponentLibrary.Components.TagHelpers;

public abstract class UiFormControlTagHelperBase : TagHelper
{
    protected abstract string ComponentKind { get; }

    [HtmlAttributeName("asp-for")]
    public ModelExpression For { get; set; } = default!;

    public string? Label { get; set; }
    public string? BorderColor { get; set; }
    public string? FocusColor { get; set; }
    public string? TextColor { get; set; }
    public string? BackgroundColor { get; set; }

    protected string InputId => TagBuilder.CreateSanitizedId(For.Name, "_");
    protected string FieldLabel => Label ?? For.Metadata.DisplayName ?? For.Name;

    protected void AddThemeVariables(TagBuilder element)
    {
        var values = new Dictionary<string, string?>
        {
            ["--ui-border-color"] = UiThemeColor.Normalize(BorderColor),
            ["--ui-focus-color"] = UiThemeColor.Normalize(FocusColor),
            ["--ui-text-color"] = UiThemeColor.Normalize(TextColor),
            ["--ui-background-color"] = UiThemeColor.Normalize(BackgroundColor),
        };

        var style = string.Join(";", values.Where(pair => !string.IsNullOrWhiteSpace(pair.Value))
            .Select(pair => $"{pair.Key}:{pair.Value}"));

        if (!string.IsNullOrEmpty(style))
        {
            element.MergeAttribute("style", style, replaceExisting: false);
        }
    }

    protected IHtmlContent BuildField(TagBuilder control, bool isCheckControl = false)
    {
        var wrapper = new TagBuilder("div");
        wrapper.AddCssClass(isCheckControl ? "ui-field ui-check-field" : "ui-field");
        wrapper.Attributes["data-ui-component"] = ComponentKind;
        wrapper.Attributes["data-ui-for"] = For.Name;
        wrapper.Attributes["data-ui-label"] = FieldLabel;
        AddThemeVariables(wrapper);

        var label = new TagBuilder("label");
        label.Attributes["for"] = control.Attributes["id"];
        label.AddCssClass(isCheckControl ? "form-check-label ui-label" : "form-label ui-label");
        label.InnerHtml.Append(FieldLabel);

        var content = new HtmlContentBuilder();
        if (isCheckControl)
        {
            var check = new TagBuilder("div");
            check.AddCssClass("form-check");
            check.InnerHtml.AppendHtml(control);
            check.InnerHtml.AppendHtml(label);
            content.AppendHtml(check);
        }
        else
        {
            content.AppendHtml(label);
            content.AppendHtml(control);
        }

        wrapper.InnerHtml.AppendHtml(content);
        return wrapper;
    }

    protected TagBuilder CreateControl(string tagName, string cssClass)
    {
        var control = new TagBuilder(tagName);
        control.Attributes["id"] = InputId;
        control.Attributes["name"] = For.Name;
        control.AddCssClass(cssClass);
        return control;
    }
}

[HtmlTargetElement("ui-text-input", Attributes = "asp-for")]
public sealed class UiTextInputTagHelper : UiFormControlTagHelperBase
{
    protected override string ComponentKind => "text-input";
    public string Type { get; set; } = "text";
    public string? Placeholder { get; set; }

    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        var control = CreateControl("input", "form-control ui-control");
        control.Attributes["type"] = Type;
        control.Attributes["value"] = For.Model?.ToString() ?? string.Empty;
        if (!string.IsNullOrWhiteSpace(Placeholder)) control.Attributes["placeholder"] = Placeholder;
        var field = BuildField(control);
        if (field is TagBuilder wrapper)
        {
            wrapper.Attributes["data-ui-input-type"] = Type;
            if (!string.IsNullOrWhiteSpace(Placeholder)) wrapper.Attributes["data-ui-placeholder"] = Placeholder;
        }
        output.TagName = null;
        output.Content.SetHtmlContent(field);
    }
}

[HtmlTargetElement("ui-textarea", Attributes = "asp-for")]
public sealed class UiTextareaTagHelper : UiFormControlTagHelperBase
{
    protected override string ComponentKind => "textarea";
    public int Rows { get; set; } = 4;
    public string? Placeholder { get; set; }

    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        var control = CreateControl("textarea", "form-control ui-control");
        control.Attributes["rows"] = Rows.ToString();
        if (!string.IsNullOrWhiteSpace(Placeholder)) control.Attributes["placeholder"] = Placeholder;
        control.InnerHtml.Append(For.Model?.ToString() ?? string.Empty);
        var field = BuildField(control);
        if (field is TagBuilder wrapper)
        {
            wrapper.Attributes["data-ui-rows"] = Rows.ToString();
            if (!string.IsNullOrWhiteSpace(Placeholder)) wrapper.Attributes["data-ui-placeholder"] = Placeholder;
        }
        output.TagName = null;
        output.Content.SetHtmlContent(field);
    }
}

[HtmlTargetElement("ui-select", Attributes = "asp-for")]
public sealed class UiSelectTagHelper : UiFormControlTagHelperBase
{
    protected override string ComponentKind => "select";
    public IEnumerable<SelectListItem> Items { get; set; } = [];
    [HtmlAttributeName("items-expression")]
    public string? ItemsExpression { get; set; }

    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        var control = CreateControl("select", "form-select ui-control");
        var current = For.Model?.ToString();
        foreach (var item in Items)
        {
            var option = new TagBuilder("option");
            option.Attributes["value"] = item.Value ?? item.Text;
            if (item.Selected || string.Equals(item.Value, current, StringComparison.Ordinal)) option.Attributes["selected"] = "selected";
            option.InnerHtml.Append(item.Text);
            control.InnerHtml.AppendHtml(option);
        }
        var field = BuildField(control);
        if (field is TagBuilder wrapper && !string.IsNullOrWhiteSpace(ItemsExpression)) wrapper.Attributes["data-ui-items-expression"] = ItemsExpression;
        output.TagName = null;
        output.Content.SetHtmlContent(field);
    }
}

[HtmlTargetElement("ui-tag-select", Attributes = "asp-for")]
public sealed class UiTagSelectTagHelper : UiFormControlTagHelperBase
{
    protected override string ComponentKind => "tag-select";

    public IEnumerable<SelectListItem> Items { get; set; } = [];

    [HtmlAttributeName("items-expression")]
    public string? ItemsExpression { get; set; }

    [HtmlAttributeName("tag-color")]
    public string? TagColor { get; set; }

    [HtmlAttributeName("tag-text-color")]
    public string? TagTextColor { get; set; }

    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        var selectedValues = GetSelectedValues();
        var wrapper = new TagBuilder("div");
        wrapper.AddCssClass("ui-field");
        wrapper.AddCssClass("ui-tag-select-field");
        wrapper.Attributes["data-ui-component"] = ComponentKind;
        wrapper.Attributes["data-ui-for"] = For.Name;
        wrapper.Attributes["data-ui-label"] = FieldLabel;
        if (!string.IsNullOrWhiteSpace(ItemsExpression)) wrapper.Attributes["data-ui-items-expression"] = ItemsExpression;
        AddThemeVariables(wrapper);
        AddTagThemeVariables(wrapper);

        var label = new TagBuilder("label");
        label.Attributes["for"] = $"{InputId}_options";
        label.AddCssClass("form-label ui-label");
        label.InnerHtml.Append(FieldLabel);

        var control = new TagBuilder("div");
        control.AddCssClass("ui-tag-select-control");
        control.Attributes["data-ui-tag-select-control"] = "";

        var tags = new TagBuilder("div");
        tags.AddCssClass("ui-tag-select-tags");
        tags.Attributes["data-ui-tag-select-tags"] = "";
        tags.Attributes["aria-live"] = "polite";
        control.InnerHtml.AppendHtml(tags);

        var menu = new TagBuilder("select");
        menu.Attributes["id"] = $"{InputId}_options";
        menu.Attributes["data-ui-tag-select-menu"] = "";
        menu.AddCssClass("ui-tag-select-menu");
        var prompt = new TagBuilder("option");
        prompt.Attributes["value"] = "";
        prompt.Attributes["selected"] = "selected";
        prompt.InnerHtml.Append("選擇項目");
        menu.InnerHtml.AppendHtml(prompt);
        foreach (var item in Items)
        {
            var option = new TagBuilder("option");
            option.Attributes["value"] = item.Value ?? item.Text;
            option.InnerHtml.Append(item.Text);
            menu.InnerHtml.AppendHtml(option);
        }
        control.InnerHtml.AppendHtml(menu);

        var values = new TagBuilder("select");
        values.Attributes["id"] = InputId;
        values.Attributes["name"] = For.Name;
        values.Attributes["multiple"] = "multiple";
        values.Attributes["data-ui-tag-select-values"] = "";
        values.AddCssClass("ui-tag-select-values");
        foreach (var item in Items)
        {
            var value = item.Value ?? item.Text;
            var option = new TagBuilder("option");
            option.Attributes["value"] = value;
            if (item.Selected || selectedValues.Contains(value)) option.Attributes["selected"] = "selected";
            option.InnerHtml.Append(item.Text);
            values.InnerHtml.AppendHtml(option);
        }

        wrapper.InnerHtml.AppendHtml(label);
        wrapper.InnerHtml.AppendHtml(control);
        wrapper.InnerHtml.AppendHtml(values);

        output.TagName = null;
        output.Content.SetHtmlContent(wrapper);
    }

    private HashSet<string> GetSelectedValues()
    {
        if (For.Model is string value) return [value];
        if (For.Model is not System.Collections.IEnumerable values) return [];

        return values.Cast<object?>()
            .Where(value => value is not null)
            .Select(value => value!.ToString()!)
            .ToHashSet(StringComparer.Ordinal);
    }

    private void AddTagThemeVariables(TagBuilder wrapper)
    {
        var values = new Dictionary<string, string?>
        {
            ["--ui-tag-color"] = UiThemeColor.Normalize(TagColor),
            ["--ui-tag-text-color"] = UiThemeColor.Normalize(TagTextColor)
        };
        var style = string.Join(";", values.Where(pair => pair.Value is not null).Select(pair => $"{pair.Key}:{pair.Value}"));
        if (!string.IsNullOrWhiteSpace(style))
        {
            var existingStyle = wrapper.Attributes.TryGetValue("style", out var existing) ? $"{existing};" : string.Empty;
            wrapper.Attributes["style"] = $"{existingStyle}{style}";
        }
    }
}

[HtmlTargetElement("ui-checkbox", Attributes = "asp-for")]
public sealed class UiCheckboxTagHelper : UiFormControlTagHelperBase
{
    protected override string ComponentKind => "checkbox";
    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        var control = CreateControl("input", "form-check-input ui-check-control");
        control.Attributes["type"] = "checkbox";
        control.Attributes["value"] = "true";
        if (For.Model is true) control.Attributes["checked"] = "checked";
        output.TagName = null;
        output.Content.SetHtmlContent(BuildField(control, isCheckControl: true));
    }
}

[HtmlTargetElement("ui-radio", Attributes = "asp-for,value")]
public sealed class UiRadioTagHelper : UiFormControlTagHelperBase
{
    protected override string ComponentKind => "radio";
    public string Value { get; set; } = string.Empty;

    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        var control = CreateControl("input", "form-check-input ui-check-control");
        control.Attributes["type"] = "radio";
        control.Attributes["id"] = $"{InputId}_{TagBuilder.CreateSanitizedId(Value, "_")}";
        control.Attributes["value"] = Value;
        if (string.Equals(For.Model?.ToString(), Value, StringComparison.Ordinal)) control.Attributes["checked"] = "checked";
        var field = BuildField(control, isCheckControl: true);
        if (field is TagBuilder wrapper) wrapper.Attributes["data-ui-radio-value"] = Value;
        output.TagName = null;
        output.Content.SetHtmlContent(field);
    }
}

[HtmlTargetElement("ui-button")]
public sealed class UiButtonTagHelper : TagHelper
{
    public string Type { get; set; } = "submit";
    public string? BackgroundColor { get; set; }
    public string? TextColor { get; set; }
    public string? BorderColor { get; set; }

    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        output.TagName = "button";
        output.TagMode = TagMode.StartTagAndEndTag;
        output.Attributes.SetAttribute("type", Type);
        output.Attributes.SetAttribute("class", "btn ui-button");
        output.Attributes.SetAttribute("data-ui-component", "button");
        var variables = new Dictionary<string, string?>
        {
            ["--ui-button-background"] = UiThemeColor.Normalize(BackgroundColor),
            ["--ui-button-text"] = UiThemeColor.Normalize(TextColor),
            ["--ui-button-border"] = UiThemeColor.Normalize(BorderColor)
        };
        var style = string.Join(";", variables.Where(pair => pair.Value is not null).Select(pair => $"{pair.Key}:{pair.Value}"));
        if (!string.IsNullOrWhiteSpace(style)) output.Attributes.SetAttribute("style", style);
    }
}
