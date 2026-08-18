# UiComponentLibrary

ASP.NET Core MVC／Razor Pages 可直接使用的 Bootstrap 5 靜態表單元件包。

## 專案

- `UiComponentLibrary`：元件展示站與 HTML 程式碼產生器。
- `standalone`：可下載、複製到任何 ASP.NET Core 專案的靜態元件包。

本專案只維護 standalone 靜態檔案流程；使用者只需要下載元件包，再引用 `ui-components.css` 與 `ui-components.js`。

## 目前元件

文字與選單：`ui-text-input`、`ui-textarea`、`ui-select`、`ui-tag-input`、`ui-tag-select`、`ui-checkbox`、`ui-radio`、`ui-button`。

檔案與日期：`ui-file-upload`、`ui-file-download`、`ui-date-picker`、`ui-date-time-picker`、`ui-time-picker`、`ui-date-range-picker`。

導覽：`ui-breadcrumb`。

資料：`ui-data-table`。

## 使用方式

1. 從展示站下載 `UiComponentLibrary-static.zip`，或直接複製 `standalone` 中的 `ui-components.css`、`ui-components.js`。
2. 將兩個檔案放入目標網站的 `wwwroot/lib/ui-components/`。
3. 在 Layout 載入 CSS，並在元件 HTML 後載入 JavaScript：

```html
<link rel="stylesheet" href="~/lib/ui-components/ui-components.css" />
<script src="~/lib/ui-components/ui-components.js" defer></script>
```

4. 從展示站複製產生的原生 HTML 到 Razor View；表單欄位使用一般 HTML `name`、`value` 與 `multiple` 屬性送出。

`ui-tag-input` 支援在輸入框輸入文字後按 `Enter` 建立自訂 tag；`ui-tag-select` 則專門從既有選單選取項目。兩者的自訂或選取值都會加入 `multiple` 欄位並隨表單送出。
