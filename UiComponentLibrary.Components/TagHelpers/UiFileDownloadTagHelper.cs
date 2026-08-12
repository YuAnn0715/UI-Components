using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace UiComponentLibrary.Components.TagHelpers;

[HtmlTargetElement("ui-file-download")]
public sealed class UiFileDownloadTagHelper : TagHelper
{
    public string FileName { get; set; } = "下載檔案.pdf";
    public string FileUrl { get; set; } = "#";
    public string Label { get; set; } = "檔案下載";

    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        var wrapper = new TagBuilder("section");
        wrapper.AddCssClass("ui-file-download");
        wrapper.Attributes["data-ui-component"] = "file-download";
        wrapper.Attributes["data-ui-download-name"] = FileName;
        wrapper.Attributes["data-ui-download-url"] = FileUrl;

        var content = new HtmlContentBuilder();
        content.AppendHtml($"<div class=\"ui-download-card\"><div class=\"ui-download-file-icon\" aria-hidden=\"true\"><i class=\"bi bi-file-earmark-arrow-down\"></i></div><div class=\"ui-download-copy\"><strong>{System.Net.WebUtility.HtmlEncode(Label)}</strong><span>{System.Net.WebUtility.HtmlEncode(FileName)}</span></div><div class=\"ui-download-actions\"><button type=\"button\" class=\"btn btn-primary\" data-ui-download-start><i class=\"bi bi-download\" aria-hidden=\"true\"></i>下載檔案</button></div></div>");
        content.AppendHtml("<div class=\"ui-download-demo-actions\"><span>效果示範</span><button type=\"button\" class=\"btn btn-outline-success\" data-ui-download-success>顯示成功</button><button type=\"button\" class=\"btn btn-outline-danger\" data-ui-download-failure>顯示失敗</button></div>");
        wrapper.InnerHtml.AppendHtml(content);

        output.TagName = null;
        output.Content.SetHtmlContent(wrapper);
    }
}
