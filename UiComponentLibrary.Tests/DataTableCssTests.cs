namespace UiComponentLibrary.Tests;

public sealed class DataTableCssTests
{
    [Fact]
    public void Data_table_styles_include_separate_pagination_and_sorting_states()
    {
        var css = File.ReadAllText(Path.Combine(AppContext.BaseDirectory, "ui-components.css"));

        Assert.Contains(".ui-data-table-page-button", css);
        Assert.Contains(".ui-data-table-sort-button", css);
        Assert.Contains("--ui-table-header-background", css);
        Assert.Contains("--ui-table-accent", css);
    }
}
