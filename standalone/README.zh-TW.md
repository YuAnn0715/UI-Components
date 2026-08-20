# UiComponentLibrary 靜態版

這個資料夾包含可直接複製到任何 ASP.NET Core 專案 `wwwroot/lib/ui-components/` 的靜態元件檔案。使用方式需要 Bootstrap Icons、`ui-components.css`、`ui-components.js` 與元件 HTML。

1. 複製 `ui-components.css`、`ui-components.js` 和 `bootstrap-icons/` 資料夾到目標專案的 `wwwroot/lib/ui-components/`，並保留 `bootstrap-icons/font/fonts/` 內的字型檔。
2. 在 `Views/Shared/_Layout.cshtml` 的 `<head>` 加入：

```html
<link rel="stylesheet" href="~/lib/ui-components/bootstrap-icons/font/bootstrap-icons.min.css" />
<link rel="stylesheet" href="~/lib/ui-components/ui-components.css" />
```

3. 在 `</body>` 前加入：

```html
<script src="~/lib/ui-components/ui-components.js"></script>
```

4. 在展示器完成配色後，複製「HTML 程式碼」到 Razor View。表單資料使用原生欄位名稱讀取，例如 `Request.Form["country"]`；檔案使用 `Request.Form.Files`。

`ui-components.js` 必須在元件 HTML 後載入，或使用 `defer` 載入。

元件使用的 `<i class="bi bi-..."></i>` 圖示由 Bootstrap Icons 提供；若未載入圖示 CSS 與字型，圖示不會顯示。

標籤式 Input 與標籤式 Select 都會包含一個隱藏的 `<select multiple>` 作為表單資料欄位，請勿移除：標籤式 Input 的值可由 `Request.Form["Tags"].ToArray()` 取得；標籤式 Select 的值可由 `Request.Form["Skills"].ToArray()` 取得。

資料表可使用一般 HTML `<table>`，外層加上 `data-ui-data-table`、`data-ui-page-size` 與 `data-ui-page-size-options`，即可啟用排序、每頁筆數選擇與分離式分頁列；欄位可用 `data-ui-sortable="false"` 停用排序。

`ui-tag-input` 可在 `data-ui-tag-input-input` 輸入文字後按 `Enter` 建立自訂 tag；元件會將自訂值加入具有 `name` 與 `multiple` 的 `data-ui-tag-input-values` 選單，隨表單送出。`ui-tag-select` 僅從 `data-ui-tag-select-menu` 選取既有項目。

`ui-switch` 使用原生 `input[type="checkbox"]`，因此可直接放進表單並支援鍵盤操作。請將輸入框放在 `.ui-switch-track` 前面，並用同一個 `id`／`for` 連結滑塊；外層使用 `.ui-switch` 即可取得滑動動畫與狀態文字。開啟時顯示打勾，關閉時顯示 X。可用 `--ui-switch-on-color`、`--ui-switch-off-color` 與 `--ui-switch-thumb-color` 覆寫配色。

`ui-breadcrumb` 使用 Bootstrap 5 的 `breadcrumb` 與 `breadcrumb-item` 語意結構，提供首頁圖示、圖示分隔與目前頁面膠囊；連結項目請使用 `<a>`，目前頁面請加上 `aria-current="page"`。可用 `data-ui-breadcrumb-separator` 選擇 `chevron-right`、`arrow-right`、`caret-right-fill`、`slash-lg` 或 `dash-lg`，再由 `ui-components.js` 自動替換分隔圖示；也可用 `--ui-breadcrumb-accent` 等 CSS 變數覆寫配色。
