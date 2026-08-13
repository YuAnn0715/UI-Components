# UiComponentLibrary

ASP.NET Core MVC／Razor Pages 的 Bootstrap 5 表單元件庫。

## 專案

- `UiComponentLibrary.Components`：可封裝成 NuGet 的 Razor Class Library。
- `UiComponentLibrary`：MVC 示範站與日後的選色、程式碼產生器；目前展示的是 Razor Tag Helper 與原生 JavaScript，不載入 Vue。
- `UiComponentLibrary.Tests`：元件測試專案。

## 目前元件

文字與選單：`ui-text-input`、`ui-textarea`、`ui-select`、`ui-tag-select`、`ui-checkbox`、`ui-radio`、`ui-button`。

檔案與日期：`ui-file-upload`、`ui-file-download`、`ui-date-picker`、`ui-date-time-picker`、`ui-time-picker`、`ui-date-range-picker`。

資料：`ui-data-table`。

## 使用方式
- `standalone` 版本只包含 `ui-components.css` 與 `ui-components.js`，不包含 Razor Tag Helper、Vue adapter 或 Vue runtime。
