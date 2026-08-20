# UiComponentLibrary 繁中使用指南

UiComponentLibrary 現在只提供 standalone 靜態元件包。請從展示站下載 `UiComponentLibrary-static.zip`，解壓縮後把 `ui-components.css`、`ui-components.js` 與 `bootstrap-icons/` 資料夾複製到目標 ASP.NET Core 網站的 `wwwroot/lib/ui-components/`，並保留圖示字型的目錄結構。

## 1. 在 Layout 載入靜態檔案

在共用 Layout 的 `<head>` 載入 CSS，並在元件 HTML 後載入 JavaScript；使用 `defer` 也可以：

```cshtml
<link rel="stylesheet" href="~/lib/ui-components/bootstrap-icons/font/bootstrap-icons.min.css" asp-append-version="true" />

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

- 文字與選單：`ui-text-input`、`ui-textarea`、`ui-select`、`ui-tag-input`、`ui-tag-select`、`ui-checkbox`、`ui-switch`、`ui-radio`、`ui-button`
- 檔案與日期：`ui-file-upload`、`ui-file-download`、`ui-date-picker`、`ui-date-time-picker`、`ui-time-picker`、`ui-date-range-picker`
- 導覽：`ui-breadcrumb`
- 資料：`ui-data-table`

## 3. 美化麵包屑：`ui-breadcrumb`

麵包屑使用 Bootstrap 5 的 `breadcrumb` 語意結構，但把單純的 `/` 分隔改成圖示、柔和底色與目前頁面膠囊。連結項目請使用 `a`，目前頁面請加上 `aria-current="page"`：

```html
<nav class="ui-breadcrumb" data-ui-component="breadcrumb" data-ui-breadcrumb-separator="chevron-right" aria-label="目前位置">
  <ol class="breadcrumb ui-breadcrumb-list">
    <li class="breadcrumb-item ui-breadcrumb-item">
      <a class="ui-breadcrumb-link" href="/">
        <span class="ui-breadcrumb-home" aria-hidden="true">
          <i class="bi bi-house-door-fill"></i>
        </span>
        <span>首頁</span>
      </a>
    </li>
    <li class="ui-breadcrumb-separator" aria-hidden="true">
      <i class="bi bi-chevron-right" data-ui-breadcrumb-separator-icon></i>
    </li>
    <li class="breadcrumb-item ui-breadcrumb-item">
      <a class="ui-breadcrumb-link" href="/components">元件</a>
    </li>
    <li class="ui-breadcrumb-separator" aria-hidden="true">
      <i class="bi bi-chevron-right" data-ui-breadcrumb-separator-icon></i>
    </li>
    <li class="breadcrumb-item ui-breadcrumb-item">
      <span class="ui-breadcrumb-current" aria-current="page">
        <i class="bi bi-grid-1x2-fill" aria-hidden="true"></i>
        <span>元件總覽</span>
      </span>
    </li>
  </ol>
</nav>
```

元件不依賴 JavaScript；可用 `data-ui-breadcrumb-separator` 選擇 `chevron-right`、`arrow-right`、`caret-right-fill`、`slash-lg` 或 `dash-lg`，並用 `--ui-breadcrumb-accent`、`--ui-breadcrumb-accent-soft`、`--ui-breadcrumb-text`、`--ui-breadcrumb-current-background` 與 `--ui-breadcrumb-current-text` 覆寫配色。載入 `ui-components.js` 時，元件會依屬性自動替換分隔圖示。

## 4. 標籤式輸入：`ui-tag-input`

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

`data-ui-tag-input-values` 是隱藏的原生 `<select multiple>`，不是第二個可見元件；請保留它，讓 tag 能隨表單送出：

```csharp
var tags = Request.Form["Tags"].ToArray();
```

## 5. 標籤式選單：`ui-tag-select`

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
    <!-- JavaScript 會將選取的項目加入此欄位；請保留以送出表單資料。 -->
  </select>
</div>
```

選取選單項目後會建立 tag，選取值會同步寫入 `data-ui-tag-select-values`，因此可直接由 ASP.NET Core 的 `Request.Form["Skills"]` 取得。

`data-ui-tag-select-values` 是保存已選項目的隱藏 `<select multiple>`；可用下列方式取得所有選取值：

```csharp
var skills = Request.Form["Skills"].ToArray();
```

## 6. 檔案上傳

檔案上傳仍使用一般 HTML 表單，並設定 `enctype`：

```html
<form method="post" enctype="multipart/form-data">
  <!-- 從展示站複製 ui-file-upload 的 HTML -->
  <button type="submit">上傳</button>
</form>
```

`accept` 與檔案大小限制只改善前端體驗，伺服器仍必須驗證檔案格式、大小與內容。

## 7. standalone 檔案

`standalone` 資料夾包含：

- `bootstrap-icons/font/`：Bootstrap Icons 的 CSS 與字型檔，供元件中的 `bi bi-*` 圖示使用
- `ui-components.css`：元件樣式
- `ui-components.js`：互動行為、展示站程式碼產生器與標籤式輸入功能
- `UiComponentLibrary-static.zip`：包含上述元件檔案與 Bootstrap Icons 資源的下載包
