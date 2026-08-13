# UiComponentLibrary 靜態版

這個資料夾可直接複製到任何 ASP.NET Core 專案的 `wwwroot/lib/ui-components/`，不需要 NuGet、Razor Tag Helper 或 Vue。standalone 版只提供 `ui-components.css` 與 `ui-components.js`，不包含 Vue adapter 或 Vue 3 runtime；需要 Vue 3 時，請改用 RCL／NuGet 版本，並由應用程式自行提供本機 Vue 3 檔案。

1. 複製 `ui-components.css` 和 `ui-components.js` 到目標專案的 `wwwroot/lib/ui-components/`。
2. 在 `Views/Shared/_Layout.cshtml` 的 `<head>` 加入：

```html
<link rel="stylesheet" href="~/lib/ui-components/ui-components.css" />
```

3. 在 `</body>` 前加入：

```html
<script src="~/lib/ui-components/ui-components.js"></script>
```

4. 在展示器完成配色後，複製「HTML 程式碼」到 Razor View。表單資料使用原生欄位名稱讀取，例如 `Request.Form["country"]`；檔案使用 `Request.Form.Files`。

`ui-components.js` 必須在元件 HTML 後載入，或使用 `defer` 載入。

資料表可使用一般 HTML `<table>`，外層加上 `data-ui-data-table`、`data-ui-page-size` 與 `data-ui-page-size-options`，即可啟用排序、每頁筆數選擇與分離式分頁列；欄位可用 `data-ui-sortable="false"` 停用排序。
