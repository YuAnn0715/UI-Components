# UiComponentLibrary 繁中使用指南

UiComponentLibrary 現在只提供 standalone 靜態元件包。請從展示站下載 `UiComponentLibrary-static.zip`，解壓縮後把 `ui-components.css` 與 `ui-components.js` 複製到目標 ASP.NET Core 網站的 `wwwroot/lib/ui-components/`。

## 1. 在 Layout 載入靜態檔案

在共用 Layout 的 `<head>` 載入 CSS，並在元件 HTML 後載入 JavaScript；使用 `defer` 也可以：

```cshtml
<link rel="stylesheet" href="~/lib/ui-components/ui-components.css" asp-append-version="true" />

<script src="~/lib/ui-components/ui-components.js" asp-append-version="true"></script>
```

## 2. 從展示站取得元件 HTML

展示站可調整配色並產生原生 HTML。將「可複製的 HTML 程式碼」貼到 Razor View 後，使用一般表單欄位讀取資料：

```csharp
var country = Request.Form["country"];
var skills = Request.Form["skills"];
var attachment = Request.Form.Files.GetFile("attachment");
```

目前提供：

- 文字與選單：`ui-text-input`、`ui-textarea`、`ui-select`、`ui-tag-input`、`ui-tag-select`、`ui-checkbox`、`ui-radio`、`ui-button`
- 檔案與日期：`ui-file-upload`、`ui-file-download`、`ui-date-picker`、`ui-date-time-picker`、`ui-time-picker`、`ui-date-range-picker`
- 資料：`ui-data-table`

## 3. 標籤式輸入：`ui-tag-input`

`ui-tag-input` 專門處理自由文字 tag。輸入文字後按 `Enter` 建立 tag，每個 tag 的 × 按鈕可以移除值；實際送出的值放在具有 `name` 與 `multiple` 的隱藏 `select`。

```html
<div class="ui-field ui-tag-input-field"
     data-ui-component="tag-input"
     data-ui-for="Tags"
     data-ui-label="標籤">
  <label class="form-label ui-label" for="Tags_input">標籤</label>
  <div class="ui-tag-input-control" data-ui-tag-input-control>
    <div class="ui-tag-input-tags" data-ui-tag-input-tags aria-live="polite"></div>
    <input class="ui-tag-input-input"
           id="Tags_input"
           type="text"
           placeholder="輸入文字後按 Enter 新增"
           data-ui-tag-input-input
           autocomplete="off" />
  </div>
  <select class="ui-tag-input-values" id="Tags" name="Tags" multiple data-ui-tag-input-values>
    <option value="csharp">C#</option>
    <option value="aspnet-core">ASP.NET Core</option>
  </select>
</div>
```

按下 `Enter` 後，輸入文字會被 trim；空白與重複值不會建立 tag。自訂值會動態加入 `data-ui-tag-input-values`，因此可直接由 ASP.NET Core 的 `Request.Form["Tags"]` 取得。

## 4. 標籤式選單：`ui-tag-select`

`ui-tag-select` 只從既有選單選取多個項目。每個 tag 的 × 按鈕可以移除值；實際送出的值放在具有 `name` 與 `multiple` 的隱藏 `select`。

```html
<div class="ui-field ui-tag-select-field"
     data-ui-component="tag-select"
     data-ui-for="Skills"
     data-ui-label="技能標籤">
  <label class="form-label ui-label" for="Skills_options">技能標籤</label>
  <div class="ui-tag-select-control" data-ui-tag-select-control>
    <div class="ui-tag-select-tags" data-ui-tag-select-tags aria-live="polite"></div>
    <select class="ui-tag-select-menu" id="Skills_options" data-ui-tag-select-menu>
      <option value="">選擇項目</option>
      <option value="csharp">C#</option>
      <option value="aspnet-core">ASP.NET Core</option>
    </select>
  </div>
  <select class="ui-tag-select-values" id="Skills" name="Skills" multiple data-ui-tag-select-values>
    <option value="csharp">C#</option>
    <option value="aspnet-core">ASP.NET Core</option>
  </select>
</div>
```

選取選單項目後會建立 tag，選取值會同步寫入 `data-ui-tag-select-values`，因此可直接由 ASP.NET Core 的 `Request.Form["Skills"]` 取得。

## 5. 檔案上傳

檔案上傳仍使用一般 HTML 表單，並設定 `enctype`：

```html
<form method="post" enctype="multipart/form-data">
  <!-- 從展示站複製 ui-file-upload 的 HTML -->
  <button type="submit">上傳</button>
</form>
```

`accept` 與檔案大小限制只改善前端體驗，伺服器仍必須驗證檔案格式、大小與內容。

## 6. standalone 檔案

`standalone` 資料夾包含：

- `ui-components.css`：元件樣式
- `ui-components.js`：互動行為、展示站程式碼產生器與標籤式輸入功能
- `UiComponentLibrary-static.zip`：可直接下載的三檔元件包
