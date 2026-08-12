using System.Text.RegularExpressions;

namespace UiComponentLibrary.Components.TagHelpers;

internal static partial class UiThemeColor
{
    [GeneratedRegex("^(#[0-9a-fA-F]{3,4}|#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?)$")]
    private static partial Regex HexColorPattern();

    public static string? Normalize(string? value)
    {
        var color = value?.Trim();
        return color is not null && HexColorPattern().IsMatch(color) ? color : null;
    }
}
