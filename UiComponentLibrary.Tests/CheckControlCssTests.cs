namespace UiComponentLibrary.Tests;

public sealed class CheckControlCssTests
{
    [Fact]
    public void Checked_controls_use_the_configurable_focus_color()
    {
        var css = File.ReadAllText(Path.Combine(AppContext.BaseDirectory, "ui-components.css"));

        Assert.Contains(".ui-check-control:checked", css);
        Assert.Contains("background-color: var(--ui-focus-color)", css);
        Assert.Contains("border-color: var(--ui-focus-color)", css);
    }
}
