# UiComponentLibrary 繁中使用指南

UiComponentLibrary 是目標框架為 `net10.0` 的 Razor Class Library（RCL）。.NET 網站必須同樣使用 `net10.0`，並可選擇使用 Razor Tag Helper 或 Vue 3 adapter；兩種方式共用同一份 CSS。

## 1. 將元件庫引用至 .NET 網站

開發元件庫時，建議在 MVC 或 Razor Pages 網站專案加入 Project Reference：

```bash
dotnet add YourWebApp reference ../UiComponentLibrary.Components/UiComponentLibrary.Components.csproj
```

發佈為 NuGet 套件後，先建立套件與本機來源，再由網站專案安裝：

```bash
dotnet pack UiComponentLibrary.Components/UiComponentLibrary.Components.csproj -c Release -o local-nuget
dotnet nuget add source ./local-nuget --name UiComponentLibraryLocal
dotnet add YourWebApp package UiComponentLibrary.Components --version 0.1.0 --source ./local-nuget
```

網站啟動程式必須映射靜態資產，RCL 的 CSS 與 JavaScript 才能從 `/_content/UiComponentLibrary.Components/` 提供。`net10.0` 專案請在 `UseDefaultFiles()` 後呼叫 `MapStaticAssets()`：

```csharp
var app = builder.Build();

app.UseDefaultFiles();
app.MapStaticAssets();
app.UseStaticFiles();
app.UseRouting();
```

## 2. Razor Tag Helper 整合

只在使用 Razor Tag Helper 時，於 MVC 的 `Views/_ViewImports.cshtml` 或 Razor Pages 的 `Pages/_ViewImports.cshtml` 加入：

```cshtml
@addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers
@addTagHelper *, UiComponentLibrary.Components
```

在共用 Layout 的 `<head>` 載入 Bootstrap、Icons 與元件 CSS；在 `</body>` 前載入互動腳本：

```cshtml
<link rel="stylesheet" href="~/lib/bootstrap/css/bootstrap.min.css" asp-append-version="true" />
<link rel="stylesheet" href="~/lib/bootstrap-icons/font/bootstrap-icons.min.css" asp-append-version="true" />
<link rel="stylesheet" href="~/_content/UiComponentLibrary.Components/ui-components.css" asp-append-version="true" />

<script src="~/_content/UiComponentLibrary.Components/ui-components.js" asp-append-version="true"></script>
```

此路徑使用 `asp-for`、`items` 等 Tag Helper 屬性，適合 Razor View 或 Razor Page 的伺服器端模型繫結。

## 3. Vue 3 Adapter 整合

Vue 3 adapter 不使用 `asp-for`。在承載 Vue 的 Razor Layout 或 View 中，先載入 CSS、Vue 3 與 adapter，再建立 Vue app。`~` 路徑由 Razor 處理；若是獨立 HTML，請改用絕對路徑 `/_content/...`。

```cshtml
@* _Layout.cshtml 的 <head> *@
<link rel="stylesheet" href="~/_content/UiComponentLibrary.Components/ui-components.css" asp-append-version="true" />

@* Razor View 或 Layout 的 <body> *@
<div id="app">
  <ui-select v-model="country" :items="countries" label="國家／地區"></ui-select>
</div>

<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script src="~/_content/UiComponentLibrary.Components/ui-components-vue.js" asp-append-version="true"></script>
<script>
  const app = Vue.createApp({
    data: () => ({
      country: "TW",
      countries: [
        { text: "台灣", value: "TW" },
        { text: "日本", value: "JP" }
      ]
    })
  });

  app.use(UiComponentLibraryVue.createUiComponentLibrary(Vue));
  app.mount("#app");
</script>
```

`:items` 使用 `{ text, value }` 陣列；`text` 是畫面文字，`value` 是 `v-model` 儲存與送出的值。各元件下方的展示站設定卡會列出對應的 `v-model` 型別與範例。

## 檔案上傳：`ui-file-upload`

此元件產生檔案輸入欄位，提供拖放、瀏覽檔案、檔案清單與前端進度視覺效果。`asp-for` 是必要參數；表單必須設定 `enctype="multipart/form-data"`，檔案才會隨 POST 要求送至伺服器。

### 單一檔案範例

View Model：

```csharp
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

public sealed class UploadViewModel
{
    public IFormFile? Attachment { get; set; }
}
```

Razor View：

```cshtml
@model UploadViewModel

<form asp-action="Upload" method="post" enctype="multipart/form-data">
    <ui-file-upload asp-for="Attachment"
                    label="附件"
                    accept=".pdf,.doc,.docx"
                    max-size-mb="10"
                    border-color="#8b5cf6"
                    progress-color="#4f46e5"
                    button-color="#4f46e5" />
    <button class="btn btn-primary" type="submit">上傳</button>
</form>
```

### 多檔案範例

```cshtml
<ui-file-upload asp-for="Attachments"
                label="圖片附件"
                accept="image/png,image/jpeg"
                max-size-mb="5"
                multiple="true"
                border-color="#0d6efd"
                progress-color="#198754"
                button-color="#0d6efd" />
```

搭配 `multiple="true"` 時，模型屬性可使用 `List<IFormFile>` 或其他可由 ASP.NET Core 繫結的 `IFormFile` 集合，例如：

```csharp
public List<IFormFile> Attachments { get; set; } = [];
```

### 參數

| 參數 | 預設值 | 用途 |
| --- | --- | --- |
| `asp-for` | 必填 | 綁定檔案模型屬性，並用其產生 HTML 的 `name` 與 `id`。 |
| `label` | 模型顯示名稱或屬性名稱 | 上傳區塊上方的欄位名稱。 |
| `accept` | `.pdf,.doc,.docx` | 傳給檔案輸入欄位的接受規則；可用副檔名或 MIME 類型，以逗號分隔。 |
| `max-size-mb` | `10` | 前端對每個檔案套用的大小上限，單位為 MB。 |
| `multiple` | `false` | 設為 `true` 時，允許選取與顯示多個檔案。 |
| `border-color` | 未設定 | 拖放區外框的自訂色彩。 |
| `progress-color` | 未設定 | 檔案清單中進度條的自訂色彩。 |
| `button-color` | 未設定 | 「瀏覽檔案」按鈕的自訂色彩。 |

### 上傳限制與伺服器端驗證

`accept` 和 `max-size-mb` 只在瀏覽器端協助使用者選檔與顯示錯誤訊息。瀏覽器端的進度是視覺模擬，不會自行把檔案上傳到伺服器；實際傳送發生在表單 POST 時。因此伺服器端仍必須依應用程式需求驗證檔案大小、內容類型與檔名，並安全地儲存檔案。

## 檔案下載：`ui-file-download`

此元件顯示檔案資訊與下載狀態視窗。使用者按下下載按鈕後，元件會先播放前端下載進度，完成時顯示「開啟文件」連結。它不會自行向 `file-url` 發送下載請求；`file-url` 是成功狀態中「開啟文件」錨點的 `href`。

```cshtml
<ui-file-download label="年度報告"
                  file-name="年度報告.pdf"
                  file-url="/downloads/annual-report.pdf" />
```

### 參數

| 參數 | 預設值 | 用途 |
| --- | --- | --- |
| `label` | `檔案下載` | 卡片上顯示的下載項目名稱。 |
| `file-name` | `下載檔案.pdf` | 卡片與下載狀態視窗顯示的檔名。 |
| `file-url` | `#` | 下載完成後「開啟文件」連結的目標 URL，可設定網站內下載端點或完整 URL。 |

請讓 `file-url` 指向由應用程式授權與回傳檔案的端點。例如 MVC action 可使用 `File(...)` 回傳檔案，並以適當的授權、檔案存在檢查與 Content-Type 處理實際下載。

## 標籤式選單：`ui-tag-select`

`ui-tag-select` 將使用者選取的多個項目顯示為選取框內的標籤。每個標籤右上角的 × 可移除該值；元件會同步更新供表單送出的多選欄位。

```csharp
using Microsoft.AspNetCore.Mvc.Rendering;

public List<string> Skills { get; set; } = ["csharp"];
public IReadOnlyList<SelectListItem> SkillOptions { get; set; } =
[
    new("C#", "csharp"),
    new("ASP.NET Core", "aspnet-core"),
    new("TypeScript", "typescript")
];
```

`items="Model.SkillOptions"` 會讀取這個選項集合；第一個字串是使用者看見的文字，第二個字串是送出表單與儲存在 `Skills` 的值。`Skills` 中已有的值會在初次載入時顯示為標籤。

```cshtml
<ui-tag-select asp-for="Skills"
               label="技能標籤"
               items="Model.SkillOptions"
               items-expression="Model.SkillOptions"
               border-color="#cbd5e1"
               focus-color="#4f46e5"
               text-color="#0f172a"
               background-color="#ffffff"
               tag-color="#4f46e5"
               tag-text-color="#ffffff" />
```

| 參數 | 用途 |
| --- | --- |
| `asp-for` | 綁定 `List<string>` 等可多值繫結的模型屬性。 |
| `items` | `IEnumerable<SelectListItem>` 選項集合。 |
| `items-expression` | 供展示站程式碼產生器保留選項集合名稱。 |
| `label` | 欄位上方顯示的名稱。 |
| `border-color`、`focus-color`、`text-color`、`background-color` | 選取框的邊框、焦點、文字與背景色。 |
| `tag-color`、`tag-text-color` | 標籤背景及標籤文字與移除按鈕色。 |

## 建置 NuGet 套件

## Data Table：`ui-data-table`

`ui-data-table` 會將一般 HTML `<table>` 增強為可排序、可分頁的資料表；每頁筆數選擇器、資料摘要與頁籤會獨立顯示在表格下方。

```cshtml
<ui-data-table page-size="10"
               page-size-options="10,25,50"
               header-background-color="#f7e9ea"
               accent-color="#a78bb0">
    <table>
        <thead>
            <tr>
                <th data-ui-sort-type="number">單位代號</th>
                <th>單位</th>
                <th data-ui-sort-type="number">員編</th>
                <th>姓名</th>
                <th>職稱</th>
                <th data-ui-sortable="false">講師身份</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>147</td><td>虎尾分行</td><td>067378</td><td>黃＊＊</td><td>高級襄理</td><td>是</td></tr>
        </tbody>
    </table>
</ui-data-table>
```

`page-size` 設定預設筆數；`page-size-options` 設定選單；`page-size-label` 與 `pagination-label` 可自訂控制項文字；`sortable="false"` 可關閉所有排序；個別欄位可用 `data-ui-sortable="false"` 停用排序，並用 `data-ui-sort-type="number|date|text"` 指定比較方式。可自訂 `header-background-color`、`header-text-color`、`table-border-color`、`stripe-background-color` 與 `accent-color`。

```bash
dotnet pack UiComponentLibrary.Components/UiComponentLibrary.Components.csproj -c Release -o local-nuget
```
