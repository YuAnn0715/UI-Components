# UiComponentLibrary 靜態版

這個資料夾包含可直接複製到任何 ASP.NET Core 專案 `wwwroot/lib/ui-components/` 的靜態元件檔案。使用方式只需要 `ui-components.css`、`ui-components.js` 與元件 HTML。

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

`ui-tag-input` 可在 `data-ui-tag-input-input` 輸入文字後按 `Enter` 建立自訂 tag；元件會將自訂值加入具有 `name` 與 `multiple` 的 `data-ui-tag-input-values` 選單，隨表單送出。`ui-tag-select` 僅從 `data-ui-tag-select-menu` 選取既有項目。
