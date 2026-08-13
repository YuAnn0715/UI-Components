# UiComponentLibrary

ASP.NET Core MVC／Razor Pages 的 Bootstrap 5 表單元件庫。

## 專案

- `UiComponentLibrary.Components`：可封裝成 NuGet 的 Razor Class Library。
- `UiComponentLibrary`：MVC 示範站與日後的選色、程式碼產生器；目前展示的是 Razor Tag Helper 與原生 JavaScript，不載入 Vue。
- `UiComponentLibrary.Tests`：元件測試專案。
- `local-nuget`：本機套件來源；執行 `dotnet pack` 後輸出 `.nupkg` 至此。(不建議 此功能測試中 改依使用說明使用)

## 目前元件

文字與選單：`ui-text-input`、`ui-textarea`、`ui-select`、`ui-tag-select`、`ui-checkbox`、`ui-radio`、`ui-button`。

檔案與日期：`ui-file-upload`、`ui-file-download`、`ui-date-picker`、`ui-date-time-picker`、`ui-time-picker`、`ui-date-range-picker`。

資料：`ui-data-table`。

## 使用方式

- RCL／NuGet 版本可使用 Razor Tag Helper；套件另附可選的 `ui-components-vue.js` adapter，但不包含 Vue 3 runtime。若要使用 Vue，請由應用程式自行提供本機 Vue 3 檔案，再依 `USAGE_GUIDE.zh-TW.md` 第 3 節載入。
- `standalone` 版本只包含 `ui-components.css` 與 `ui-components.js`，不包含 Razor Tag Helper、Vue adapter 或 Vue runtime。
