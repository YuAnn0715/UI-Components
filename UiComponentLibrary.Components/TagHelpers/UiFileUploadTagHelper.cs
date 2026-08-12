using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace UiComponentLibrary.Components.TagHelpers;

[HtmlTargetElement("ui-file-upload", Attributes = "asp-for")]
public sealed class UiFileUploadTagHelper : TagHelper
{
    [HtmlAttributeName("asp-for")]
    public ModelExpression For { get; set; } = default!;

    public string? Label { get; set; }
    public string Accept { get; set; } = ".pdf,.doc,.docx";
    [HtmlAttributeName("max-size-mb")]
    public int MaxSizeMb { get; set; } = 10;
    public bool Multiple { get; set; }
    public string? BorderColor { get; set; }
    [HtmlAttributeName("progress-color")]
    public string? ProgressColor { get; set; }
    [HtmlAttributeName("button-color")]
    public string? ButtonColor { get; set; }

    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        var id = TagBuilder.CreateSanitizedId(For.Name, "_");
        var fieldLabel = Label ?? For.Metadata.DisplayName ?? For.Name;
        var wrapper = new TagBuilder("div");
        wrapper.AddCssClass("ui-file-upload");
        wrapper.Attributes["data-ui-component"] = "file-upload";
        wrapper.Attributes["data-ui-for"] = For.Name;
        wrapper.Attributes["data-ui-label"] = fieldLabel;
        wrapper.Attributes["data-ui-accept"] = Accept;
        wrapper.Attributes["data-ui-max-size"] = MaxSizeMb.ToString();
        if (Multiple) wrapper.Attributes["data-ui-multiple"] = "true";

        var styles = new Dictionary<string, string?>
        {
            ["--ui-upload-border-color"] = UiThemeColor.Normalize(BorderColor),
            ["--ui-upload-progress-color"] = UiThemeColor.Normalize(ProgressColor),
            ["--ui-upload-button-color"] = UiThemeColor.Normalize(ButtonColor)
        }
        .Where(pair => pair.Value is not null)
        .Select(pair => $"{pair.Key}:{pair.Value}");
        var style = string.Join(";", styles);
        if (!string.IsNullOrWhiteSpace(style)) wrapper.Attributes["style"] = style;

        var label = new TagBuilder("label");
        label.AddCssClass("form-label ui-label");
        label.Attributes["for"] = id;
        label.InnerHtml.Append(fieldLabel);

        var dropZone = new TagBuilder("div");
        dropZone.AddCssClass("ui-file-drop-zone");
        dropZone.Attributes["data-ui-file-dropzone"] = "";
        dropZone.Attributes["tabindex"] = "0";
        dropZone.Attributes["role"] = "button";
        dropZone.Attributes["aria-label"] = $"選擇{fieldLabel}";
        dropZone.InnerHtml.AppendHtml("<span class=\"ui-file-upload-icon\" aria-hidden=\"true\"><i class=\"bi bi-cloud-arrow-up\"></i></span><strong>拖放檔案到這裡</strong><span class=\"ui-file-or\">或</span>");
        var browse = new TagBuilder("button");
        browse.Attributes["type"] = "button";
        browse.Attributes["data-ui-file-browse"] = "";
        browse.AddCssClass("ui-file-browse");
        browse.InnerHtml.AppendHtml("<i class=\"bi bi-folder2-open\" aria-hidden=\"true\"></i><span>瀏覽檔案</span>");
        dropZone.InnerHtml.AppendHtml(browse);
        var hint = new TagBuilder("span");
        hint.AddCssClass("ui-file-hint");
        hint.InnerHtml.Append($"支援 {Accept.Replace(",", "、")} · 上限 {MaxSizeMb} MB");
        dropZone.InnerHtml.AppendHtml(hint);

        var input = new TagBuilder("input");
        input.Attributes["id"] = id;
        input.Attributes["name"] = For.Name;
        input.Attributes["type"] = "file";
        input.Attributes["accept"] = Accept;
        input.Attributes["data-ui-file-input"] = "";
        input.AddCssClass("ui-file-input");
        if (Multiple) input.Attributes["multiple"] = "multiple";

        var list = new TagBuilder("div");
        list.AddCssClass("ui-file-list");
        list.Attributes["data-ui-file-list"] = "";
        list.Attributes["aria-live"] = "polite";

        var content = new HtmlContentBuilder();
        content.AppendHtml(label);
        content.AppendHtml(dropZone);
        content.AppendHtml(input);
        content.AppendHtml(list);
        wrapper.InnerHtml.AppendHtml(content);

        output.TagName = null;
        output.Content.SetHtmlContent(wrapper);
    }
}
