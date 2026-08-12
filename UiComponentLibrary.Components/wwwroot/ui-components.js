(() => {
    const editor = document.querySelector("[data-ui-theme-editor]");
    if (!editor) return;

    const codeOutput = editor.querySelector("[data-ui-generated-code]");
    const colorInputs = [...editor.querySelectorAll("[data-ui-color]")];
    const colorRows = [...editor.querySelectorAll("[data-ui-color-row]")];
    const labels = {
        "text-input": "輸入框", textarea: "多行輸入框", select: "下拉選單", "tag-select": "標籤式 Select",
        checkbox: "核取方塊", radio: "單選按鈕", button: "按鈕",
        "date-picker": "日期選擇器", "date-time-picker": "日期＋時間", "time-picker": "時間選擇器", "date-range-picker": "日期區間"
    };
    labels["file-upload"] = "檔案上傳";
    labels["file-download"] = "檔案下載";
    const allowed = {
        button: ["--ui-button-background", "--ui-button-text", "--ui-button-border"],
        field: ["--ui-border-color", "--ui-focus-color", "--ui-text-color", "--ui-background-color"],
        date: ["--ui-border-color", "--ui-focus-color", "--ui-text-color", "--ui-background-color", "--ui-confirm-color", "--ui-cancel-color", "--ui-range-endpoint-color"],
        range: ["--ui-border-color", "--ui-focus-color", "--ui-text-color", "--ui-background-color", "--ui-confirm-color", "--ui-cancel-color", "--ui-range-endpoint-color", "--ui-range-fill-color"],
        time: ["--ui-border-color", "--ui-focus-color", "--ui-text-color", "--ui-background-color", "--ui-confirm-color", "--ui-cancel-color", "--ui-time-control-color", "--ui-flip-number-color", "--ui-flip-number-background"],
        upload: ["--ui-upload-border-color", "--ui-upload-progress-color", "--ui-upload-button-color"],
        download: ["--ui-button-background", "--ui-button-text", "--ui-button-border"],
        tagSelect: ["--ui-border-color", "--ui-focus-color", "--ui-text-color", "--ui-background-color", "--ui-tag-color", "--ui-tag-text-color"]
    };
    const attributes = {
        "--ui-border-color": "border-color", "--ui-focus-color": "focus-color",
        "--ui-text-color": "text-color", "--ui-background-color": "background-color",
        "--ui-button-background": "background-color", "--ui-button-text": "text-color", "--ui-button-border": "border-color",
        "--ui-confirm-color": "confirm-color", "--ui-cancel-color": "cancel-color",
        "--ui-range-endpoint-color": "endpoint-color", "--ui-range-fill-color": "range-color",
        "--ui-time-control-color": "control-color", "--ui-flip-number-color": "flip-number-color", "--ui-flip-number-background": "flip-number-background-color",
        "--ui-upload-border-color": "border-color", "--ui-upload-progress-color": "progress-color", "--ui-upload-button-color": "button-color",
        "--ui-tag-color": "tag-color", "--ui-tag-text-color": "tag-text-color"
    };

    const targets = [...document.querySelectorAll("[data-ui-component]")];
    const previewItems = [...document.querySelectorAll("[data-ui-preview-item]")];
    const navButtons = [...document.querySelectorAll("[data-ui-show-kind]")];
    const previewTitle = document.querySelector("#component-preview-title");
    const guideButton = document.querySelector("[data-ui-show-guide]");
    const navigationIcons = {
        "text-input": "input-cursor-text", textarea: "textarea-t", select: "menu-button-wide", "tag-select": "tags",
        checkbox: "check2-square", radio: "ui-radios", button: "cursor-fill", "file-upload": "cloud-arrow-up", "file-download": "file-earmark-arrow-down",
        "date-picker": "calendar3", "date-time-picker": "calendar2-week", "time-picker": "clock", "date-range-picker": "calendar-range"
    };
    guideButton?.insertAdjacentHTML("afterbegin", '<i class="bi bi-book" aria-hidden="true"></i>');
    navButtons.forEach(button => {
        const icon = navigationIcons[button.dataset.uiShowKind];
        if (icon) button.insertAdjacentHTML("afterbegin", `<i class="bi bi-${icon}" aria-hidden="true"></i>`);
    });
    const guide = document.querySelector("[data-ui-general-guide]");
    const previewSection = document.querySelector("[data-ui-preview-section]");
    const componentDoc = document.querySelector("[data-ui-component-doc]");
    const docTitle = document.querySelector("#component-doc-title");
    const docSummary = document.querySelector("[data-ui-doc-summary]");
    const docRazor = document.querySelector("[data-ui-doc-razor]");
    const docData = document.querySelector("[data-ui-doc-data]");
    const uploadSettings = document.querySelector("[data-ui-upload-settings]");
    const uploadAccept = document.querySelector("[data-ui-upload-accept]");
    const uploadMaxSize = document.querySelector("[data-ui-upload-max-size]");
    // 格式化 HTML 標記。
    const formatMarkup = source => String(source || "").replace(/<([A-Za-z][\w-]*)(\s[^<>]*?)(\/?)>/g, (match, tagName, rawAttributes, close) => {
        if (match.length <= 72) return match;
        const attributes = rawAttributes.trim().match(/[^\s=]+(?:=(?:"[^"]*"|'[^']*'|[^\s"'>]+))?/g) || [];
        if (attributes.length < 2) return match;
        return `<${tagName} ${attributes[0]}\n${attributes.slice(1).map(attribute => `  ${attribute}`).join("\n")}${close}>`;
    });
    // 顯示格式化程式碼。
    const formatCode = (element, source) => {
        element.replaceChildren();
        const lines = formatMarkup(source).split("\n");
        lines.forEach((line, index) => {
            const row = document.createElement("span");
            row.className = "ui-code-line";
            row.textContent = `${line || " "}${index < lines.length - 1 ? "\n" : ""}`;
            element.append(row);
        });
    };
    const docs = {
        "text-input": { title: "Text Input", summary: "文字、Email、密碼等單行欄位。", razor: `<ui-text-input asp-for="Name" label="姓名" type="text" placeholder="請輸入姓名" />`, data: `<p><code>asp-for</code> 綁定字串屬性，例如 <code>public string? Name { get; set; }</code>。</p><p>可設定：label、type、placeholder 與四種輸入框配色。</p>` },
        textarea: { title: "Textarea", summary: "用於多行備註或說明內容。", razor: `<ui-textarea asp-for="Notes" label="備註" rows="4" placeholder="可選填" />`, data: `<p><code>asp-for</code> 綁定字串屬性，例如 <code>public string? Notes { get; set; }</code>。</p><p>可設定：label、rows、placeholder 與四種輸入框配色。</p>` },
        select: {
            title: "Select", summary: "用於從伺服器提供的選項集合選擇一個值。", razor: `<ui-select asp-for="Country"
           label="國家／地區"
           items="Model.Countries"
           items-expression="Model.Countries" />`, data: `<p><code>asp-for</code> 綁定選取值；<code>items</code> 綁定 <code>IEnumerable&lt;SelectListItem&gt;</code>。</p><p><code>items-expression</code> 只供程式碼產生器保留資料來源名稱。</p>`
        },
        checkbox: { title: "Checkbox", summary: "用於單一 true／false 開關。", razor: `<ui-checkbox asp-for="EmailUpdates" label="我想收到產品更新" />`, data: `<p><code>asp-for</code> 綁定布林屬性，例如 <code>public bool EmailUpdates { get; set; }</code>。</p><p>可設定：label、邊框、焦點、文字與背景顏色。</p>` },
        radio: {
            title: "Radio", summary: "同一個欄位提供多個互斥選項。", razor: `<ui-radio asp-for="PreferredContact" value="Email" label="電子郵件" />
<ui-radio asp-for="PreferredContact" value="Phone" label="電話" />`, data: `<p>所有 Radio 使用相同的 <code>asp-for</code>，每個選項使用不同 <code>value</code>。</p><p>例如：<code>public string? PreferredContact { get; set; }</code>。</p>`
        },
        button: {
            title: "Button", summary: "提交表單或觸發頁面動作的按鈕。", razor: `<ui-button type="submit"
           background-color="#4f46e5"
           text-color="#ffffff"
           border-color="#312e81">儲存</ui-button>`, data: `<p>預設 <code>type</code> 是 <code>submit</code>；一般按鈕可設為 <code>type="button"</code>。</p><p>可分別設定背景、文字與外框顏色。</p>`
        },
        "date-picker": { title: "日期選擇器", summary: "選擇單一日期；可從月曆標題直接切換年份與月份。", razor: `<ui-date-picker asp-for="SelectedDate" label="預約日期" />`, data: `<p>建議使用 <code>DateOnly?</code>：<code>public DateOnly? SelectedDate { get; set; }</code>。</p><p>可設定輸入框、確認、取消與選取日期顏色。</p>` },
        "date-time-picker": { title: "日期＋時間", summary: "先選日期，再從較大的時／分控制區設定時間。", razor: `<ui-date-time-picker asp-for="SelectedDateTime" label="開始日期與時間" />`, data: `<p>建議使用 <code>DateTime?</code>：<code>public DateTime? SelectedDateTime { get; set; }</code>。</p><p>可設定輸入框、確認、取消與選取日期顏色。</p>` },
        "time-picker": {
            title: "時間選擇器", summary: "翻頁時鐘式的純時間輸入，支援 12／24 小時制與 AM／PM。", razor: `<ui-time-picker asp-for="SelectedTime"
                label="開始時間"
                confirm-color="#4f46e5"
                cancel-color="#64748b" />`, data: `<p>建議使用 <code>TimeOnly?</code>：<code>public TimeOnly? SelectedTime { get; set; }</code>。</p><p>可設定輸入框、確認、取消、翻頁、12／24 與 AM／PM 顏色。</p>`
        },
        "date-range-picker": {
            title: "日期區間", summary: "一次選擇起日與迄日；端點與中間區間可使用不同顏色。", razor: `<ui-date-range-picker asp-for-start="StartDate"
                      asp-for-end="EndDate"
                      label="住宿日期"
                      endpoint-color="#4f46e5"
                      range-color="#ddd6fe" />`, data: `<p>起日與迄日分別綁定兩個 <code>DateOnly?</code> 屬性。</p><p>例如：<code>public DateOnly? StartDate { get; set; }</code> 與 <code>public DateOnly? EndDate { get; set; }</code>。</p>`
        }
    };
    const parameterNotes = {
        "text-input": [["asp-for", "綁定 View Model 的字串屬性"], ["label", "欄位上方顯示的名稱"], ["type", "HTML 輸入型別，例如 text、email、password"], ["placeholder", "未輸入時顯示的提示文字"], ["border-color / focus-color", "輸入框一般／聚焦時的邊框色"]],
        textarea: [["asp-for", "綁定 View Model 的字串屬性"], ["label", "欄位上方顯示的名稱"], ["rows", "Textarea 的顯示行數"], ["placeholder", "未輸入時的提示文字"], ["border-color / focus-color", "輸入框一般／聚焦時的邊框色"]],
        select: [["asp-for", "綁定使用者選取的值"], ["items", "實際選項集合，型別為 IEnumerable&lt;SelectListItem&gt;"], ["items-expression", "供程式碼產生器保留資料來源名稱"], ["label", "欄位上方顯示的名稱"]],
        checkbox: [["asp-for", "綁定 bool 屬性"], ["label", "核取方塊右側的文字"], ["border-color / focus-color", "核取方塊一般／聚焦與勾選時的色彩基礎"]],
        radio: [["asp-for", "同一組 Radio 共用的模型屬性"], ["value", "此選項送出的實際值"], ["label", "此選項旁顯示的文字"], ["focus-color", "選取與聚焦時的主要顏色"]],
        button: [["type", "submit 送出表單；button 僅觸發前端動作"], ["background-color", "按鈕背景色"], ["text-color", "按鈕文字色"], ["border-color", "按鈕外框色"]],
        "date-picker": [["asp-for", "綁定 DateOnly? 日期屬性"], ["label", "日期欄位的名稱"], ["border-color / focus-color", "日期輸入框一般／聚焦時的邊框色"], ["confirm-color", "月曆中的確認按鈕顏色"], ["cancel-color", "月曆中的取消按鈕顏色"], ["endpoint-color", "目前選取日期的圓角方形顏色"]],
        "date-time-picker": [["asp-for", "綁定 DateTime? 日期時間屬性"], ["label", "日期時間欄位的名稱"], ["border-color / focus-color", "日期時間輸入框一般／聚焦時的邊框色"], ["confirm-color", "月曆中的確認按鈕顏色"], ["cancel-color", "月曆中的取消按鈕顏色"], ["endpoint-color", "目前選取日期的圓角方形顏色"]],
        "time-picker": [["asp-for", "綁定 TimeOnly? 時間屬性"], ["label", "時間欄位的名稱"], ["border-color / focus-color", "時間輸入框一般／聚焦時的邊框色"], ["confirm-color", "翻頁時鐘中的確認按鈕顏色"], ["cancel-color", "翻頁時鐘中的取消按鈕顏色"], ["control-color", "時與分上下翻頁按鈕、選取數字的顏色"], ["format-color", "12／24 小時制切換按鈕顏色"], ["meridiem-color", "AM／PM 切換按鈕顏色"]],
        "date-range-picker": [["asp-for-start", "綁定起始日期的 DateOnly? 屬性"], ["asp-for-end", "綁定結束日期的 DateOnly? 屬性"], ["label", "日期區間欄位的名稱"], ["border-color / focus-color", "日期區間輸入框一般／聚焦時的邊框色"], ["confirm-color", "月曆中的確認按鈕顏色"], ["cancel-color", "月曆中的取消按鈕顏色"], ["endpoint-color", "起日與迄日的圓角方形顏色"], ["range-color", "起日與迄日之間選取區間的顏色"]]
    };
    docs["tag-select"] = {
        title: "標籤式 Select",
        summary: "從選單選取多個項目，每個選取值會顯示在框內並可用右上角的 × 移除。",
        razor: "",
        data: `<p><code>asp-for</code> 綁定字串集合，例如 <code>List&lt;string&gt;</code>；<code>items</code> 提供 <code>IEnumerable&lt;SelectListItem&gt;</code> 選項。</p><p>在 View Model 建立選項集合，並把它傳給 <code>items</code>：</p><pre class="ui-doc-code"><code>public List&lt;string&gt; Skills { get; set; } = [];
public IReadOnlyList&lt;SelectListItem&gt; SkillOptions { get; set; } =
[
    new("C#", "csharp"),
    new("ASP.NET Core", "aspnet-core")
];</code></pre><p>選取與移除標籤會同步更新元件內的多選欄位，因此會隨一般表單 POST 送出。</p>`
    };
    docs["file-upload"] = {
        title: "檔案上傳",
        summary: "支援拖放與瀏覽檔案；前端會檢查格式與單一檔案大小，並顯示模擬進度與移除按鈕。",
        razor: "",
        data: "<p><code>asp-for</code> 綁定 <code>IFormFile?</code>；表單必須使用 <code>enctype=\"multipart/form-data\"</code>。</p><p><code>accept</code> 與 <code>max-size-mb</code> 僅為前端選檔限制，實際 POST 前仍須在伺服器驗證檔案格式與大小。元件顯示的進度為前端視覺效果，並不會自行上傳檔案。</p>"
    };
    docs["file-download"] = {
        title: "檔案下載",
        summary: "顯示下載進度視窗；完成後提供連往指定檔案 URL 的「開啟文件」連結。",
        razor: "",
        data: "<p><code>file-url</code> 會成為成功狀態中「開啟文件」連結的 <code>href</code>，可指向網站下載端點或完整 URL。</p><p>元件本身只模擬下載進度，不會自行請求或下載 <code>file-url</code>；實際檔案傳輸在使用者點選該連結後由瀏覽器處理。</p>"
    };
    parameterNotes["file-upload"] = [
        ["asp-for", "綁定 View Model 的 IFormFile? 屬性"],
        ["label", "上傳區塊上方的欄位名稱"],
        ["accept", "允許選擇的副檔名或 MIME 類型，例如 .pdf,.doc,.docx"],
        ["max-size-mb", "單一檔案的最大容量（MB）"],
        ["multiple", "允許一次選擇多個檔案"],
        ["border-color", "拖放區與外層卡片的外框色"],
        ["progress-color", "檔案上傳進度條色彩"],
        ["button-color", "瀏覽檔案按鈕色彩"]
    ];
    parameterNotes["file-download"] = [
        ["label", "下載項目的顯示名稱"],
        ["file-name", "卡片與下載狀態視窗中顯示的檔名"],
        ["file-url", "成功後「開啟文件」連結的 href，可使用網站內或完整 URL"]
    ];
    parameterNotes["tag-select"] = [
        ["asp-for", "綁定 List&lt;string&gt; 等多值集合"],
        ["items", "實際選項集合，型別為 IEnumerable&lt;SelectListItem&gt;"],
        ["items-expression", "供程式碼產生器保留資料來源名稱"],
        ["label", "欄位上方顯示的名稱"],
        ["border-color / focus-color", "選取框一般／焦點時的邊框色"],
        ["text-color / background-color", "選取框文字與背景色"],
        ["tag-color", "已選取標籤的背景色"],
        ["tag-text-color", "已選取標籤的文字與移除按鈕色"]
    ];
    const razorExamples = {
        "text-input": `<ui-text-input asp-for="Name"
               label="姓名"
               type="text"
               placeholder="請輸入姓名"
               border-color="#cbd5e1"
               focus-color="#4f46e5"
               text-color="#0f172a"
               background-color="#ffffff" />`,
        textarea: `<ui-textarea asp-for="Notes"
             label="備註"
             rows="4"
             placeholder="請輸入內容"
             border-color="#cbd5e1"
             focus-color="#4f46e5"
             text-color="#0f172a"
             background-color="#ffffff" />`,
        select: `<ui-select asp-for="Country"
           label="國家／地區"
           items="Model.Countries"
           items-expression="Model.Countries"
           border-color="#cbd5e1"
           focus-color="#4f46e5"
           text-color="#0f172a"
           background-color="#ffffff" />`,
        checkbox: `<ui-checkbox asp-for="EmailUpdates"
             label="接收電子報"
             border-color="#cbd5e1"
             focus-color="#4f46e5"
             text-color="#0f172a"
             background-color="#ffffff" />`,
        radio: `<ui-radio asp-for="PreferredContact"
          value="Email"
          label="電子郵件"
          border-color="#cbd5e1"
          focus-color="#4f46e5"
          text-color="#0f172a"
          background-color="#ffffff" />`,
        button: `<ui-button type="submit"
           background-color="#4f46e5"
           text-color="#ffffff"
           border-color="#312e81">送出</ui-button>`,
        "date-picker": `<ui-date-picker asp-for="SelectedDate"
                label="預約日期"
                border-color="#cbd5e1"
                focus-color="#4f46e5"
                text-color="#0f172a"
                background-color="#ffffff"
                confirm-color="#4f46e5"
                cancel-color="#64748b"
                endpoint-color="#4f46e5" />`,
        "date-time-picker": `<ui-date-time-picker asp-for="SelectedDateTime"
                     label="預約日期與時間"
                     border-color="#cbd5e1"
                     focus-color="#4f46e5"
                     text-color="#0f172a"
                     background-color="#ffffff"
                     confirm-color="#4f46e5"
                     cancel-color="#64748b"
                     endpoint-color="#4f46e5" />`,
        "time-picker": `<ui-time-picker asp-for="SelectedTime"
                label="預約時間"
                border-color="#cbd5e1"
                focus-color="#4f46e5"
                text-color="#0f172a"
                background-color="#ffffff"
                confirm-color="#4f46e5"
                cancel-color="#64748b"
                control-color="#0f172a"
                format-color="#4f46e5"
                meridiem-color="#4f46e5" />`,
        "date-range-picker": `<ui-date-range-picker asp-for-start="StartDate"
                      asp-for-end="EndDate"
                      label="旅行日期"
                      border-color="#cbd5e1"
                      focus-color="#4f46e5"
                      text-color="#0f172a"
                      background-color="#ffffff"
                      confirm-color="#4f46e5"
                      cancel-color="#64748b"
                      endpoint-color="#4f46e5"
                      range-color="#ddd6fe" />`
    };

    razorExamples["file-upload"] = `<form asp-action="Upload" method="post" enctype="multipart/form-data">
  <ui-file-upload asp-for="UploadFile"
                  label="附件"
                  accept=".pdf,.doc,.docx"
                  max-size-mb="10"
                  border-color="#8b5cf6"
                  progress-color="#4f46e5"
                  button-color="#4f46e5" />
  <button class="btn btn-primary" type="submit">上傳</button>
</form>`;
    razorExamples["file-download"] = `<ui-file-download label="年度報告"
                  file-name="年度報告.pdf"
                  file-url="/downloads/annual-report.pdf" />`;
    razorExamples["tag-select"] = `<ui-tag-select asp-for="Skills"
               label="技能標籤"
               items="Model.SkillOptions"
               items-expression="Model.SkillOptions"
               border-color="#cbd5e1"
               focus-color="#4f46e5"
               text-color="#0f172a"
               background-color="#ffffff"
               tag-color="#4f46e5"
               tag-text-color="#ffffff" />`;
    docs["time-picker"].summary = "使用 24 小時制的翻頁時鐘選擇時間，可按數字直接選取小時或分鐘。";
    parameterNotes["time-picker"] = parameterNotes["time-picker"].filter(([name]) => !["format-color", "meridiem-color"].includes(name));
    parameterNotes["time-picker"].push(["flip-number-color", "翻頁時鐘的數字顏色"], ["flip-number-background-color", "翻頁時鐘數字卡的底色"]);
    razorExamples["time-picker"] = `<ui-time-picker asp-for="SelectedTime"
                label="預約時間"
                border-color="#cbd5e1"
                focus-color="#4f46e5"
                text-color="#0f172a"
                background-color="#ffffff"
                confirm-color="#4f46e5"
                cancel-color="#64748b"
                control-color="#475569"
                flip-number-color="#ffffff"
                flip-number-background-color="#1e293b" />`;

    Object.assign(docs, {
        "text-input": { ...docs["text-input"], data: "<p>用原生 <code>name</code> 與 <code>value</code> 設定與取得資料，例如 <code>document.querySelector('[name=name]').value</code>。</p>" },
        textarea: { ...docs.textarea, data: "<p>用原生 <code>textarea[name=notes]</code> 設定與取得多行文字。</p>" },
        select: { ...docs.select, data: "<p>將選項直接寫成 <code>&lt;option value=\"...\"&gt;</code>；使用者選取值在 <code>select.value</code>，ASP.NET Core 可由 <code>Request.Form[\"country\"]</code> 取得。</p>" },
        checkbox: { ...docs.checkbox, data: "<p>使用 <code>checked</code> 設定初始值，並從 <code>input.checked</code> 取得狀態。</p>" },
        radio: { ...docs.radio, data: "<p>同一組 Radio 使用相同 <code>name</code>；從 <code>document.querySelector('[name=preferredContact]:checked').value</code> 取得值。</p>" },
        button: { ...docs.button, data: "<p>使用原生 <code>click</code> 事件；<code>type=\"submit\"</code> 可提交表單。</p>" },
        "date-picker": { ...docs["date-picker"], data: "<p>點選後元件會寫入 <code>input[name=selectedDate].value</code>，格式為 <code>YYYY-MM-DD</code>。</p>" },
        "date-time-picker": { ...docs["date-time-picker"], data: "<p>元件會寫入 <code>input[name=selectedDateTime].value</code>，格式為 <code>YYYY-MM-DD HH:mm</code>。</p>" },
        "time-picker": { ...docs["time-picker"], data: "<p>元件會寫入 <code>input[name=selectedTime].value</code>，格式為 <code>HH:mm</code>。</p>" },
        "date-range-picker": { ...docs["date-range-picker"], data: "<p>元件會分別寫入 <code>input[name=startDate]</code> 與 <code>input[name=endDate]</code>。</p>" }
    });
    docs["tag-select"].data = "<p>兩個 <code>select</code> 要放相同的選項：第一個是選擇選單，第二個具 <code>name=\"skills\" multiple</code>，實際選取值由它送出。可用 <code>[...document.querySelector('[name=skills]').selectedOptions].map(x =&gt; x.value)</code> 取得。</p>";
    docs["file-upload"].data = "<p>使用 <code>input[type=file][name=attachment]</code> 取得檔案；ASP.NET Core 使用 <code>Request.Form.Files</code>。<code>accept</code> 與容量限制只改善前端體驗，伺服器仍必須驗證檔案。</p>";
    docs["file-download"].data = "<p><code>data-ui-download-url</code> 會用於成功後的下載連結，僅接受網站相對路徑或 <code>http/https</code> URL。</p>";
    Object.assign(parameterNotes, {
        "text-input": [["name", "表單欄位名稱"], ["type / placeholder", "原生輸入型別與提示文字"], ["value", "初始值；可由 input.value 取得"], ["style", "配色編輯器產生的 CSS 變數"]],
        textarea: [["name", "表單欄位名稱"], ["rows / placeholder", "顯示行數與提示文字"], ["value", "由 textarea.value 取得"]],
        select: [["name", "表單欄位名稱"], ["option", "每個選項的顯示文字與 value"], ["selected", "預先選取的選項"], ["value", "由 select.value 取得"]],
        "tag-select": [["data-ui-tag-select-menu", "使用者選擇項目的選單"], ["name + multiple", "實際送出選取值的 select"], ["option", "兩個 select 都需具有相同 value 選項"], ["tag-color / tag-text-color", "標籤背景與文字色"]],
        checkbox: [["name", "表單欄位名稱"], ["value", "勾選後送出的值"], ["checked", "預設勾選；以 input.checked 取得狀態"]],
        radio: [["name", "同組選項使用相同名稱"], ["value", "選項送出的實際值"], ["checked", "預設選取；以 :checked 取得目前選項"]],
        button: [["type", "submit 提交表單；button 觸發前端動作"], ["style", "按鈕背景、文字與外框 CSS 變數"]],
        "file-upload": [["name", "檔案欄位名稱"], ["accept", "副檔名或 MIME 類型限制"], ["data-ui-max-size", "單一檔案容量上限（MB）"], ["multiple", "允許選擇多個檔案"], ["Request.Form.Files", "ASP.NET Core 取得檔案"]],
        "file-download": [["data-ui-download-name", "顯示於完成視窗的檔名"], ["data-ui-download-url", "相對路徑或 http/https 下載連結"], ["data-ui-download-start", "觸發下載效果的按鈕"], ["--ui-button-background / text / border", "下載按鈕背景、文字與外框配色"]],
        "date-picker": [["name", "表單欄位名稱"], ["data-ui-date-control=date", "啟用日期選擇器"], ["value", "YYYY-MM-DD 格式"]],
        "date-time-picker": [["name", "表單欄位名稱"], ["data-ui-date-control=datetime", "啟用日期與時間選擇器"], ["value", "YYYY-MM-DD HH:mm 格式"]],
        "time-picker": [["name", "表單欄位名稱"], ["data-ui-time-control", "啟用時間選擇器"], ["value", "HH:mm 格式"]],
        "date-range-picker": [["data-ui-range-start", "起日隱藏欄位"], ["data-ui-range-end", "迄日隱藏欄位"], ["name", "兩個欄位名稱"], ["value", "YYYY-MM-DD 格式"]]
    });

    targets.forEach((target, index) => {
        const id = `ui-preview-${index + 1}`;
        target.id = id;
        const kind = target.dataset.uiComponent;
    });

    let currentTarget = targets[0];
    // 取得目前元件。
    const selected = () => currentTarget;
    // 取得套用主題的元件。
    const themeTargets = target => target?.dataset.uiComponent === "radio"
        ? targets.filter(candidate => candidate.dataset.uiComponent === "radio" && candidate.dataset.uiFor === target.dataset.uiFor)
        : [target];
    // 取得可用樣式變數。
    const variablesFor = target => {
        if (target?.dataset.uiComponent === "button") return allowed.button;
        if (["date-picker", "date-time-picker"].includes(target?.dataset.uiComponent)) return allowed.date;
        if (target?.dataset.uiComponent === "time-picker") return allowed.time;
        if (target?.dataset.uiComponent === "date-range-picker") return allowed.range;
        if (target?.dataset.uiComponent === "file-upload") return allowed.upload;
        if (target?.dataset.uiComponent === "file-download") return allowed.download;
        if (target?.dataset.uiComponent === "tag-select") return allowed.tagSelect;
        return allowed.field;
    };

    // 更新編輯器設定。
    function updateEditor() {
        const target = selected();
        const variables = variablesFor(target);
        const isUpload = target?.dataset.uiComponent === "file-upload";
        if (uploadSettings) uploadSettings.hidden = !isUpload;
        if (isUpload) {
            uploadAccept.value = target.dataset.uiAccept || "";
            uploadMaxSize.value = target.dataset.uiMaxSize || "10";
        }
        colorInputs.forEach(input => {
            const variable = input.dataset.uiColor;
            const row = input.closest("[data-ui-color-row]");
            const visible = variables.includes(variable);
            row.hidden = !visible;
            if (visible) {
                const configured = target.style.getPropertyValue(variable).trim();
                input.value = /^#[0-9a-f]{6}$/i.test(configured) ? configured : input.dataset.uiDefault;
            }
        });
        editor.querySelectorAll(".ui-color-controls").forEach(group => {
            group.hidden = ![...group.querySelectorAll("[data-ui-color-row]")].some(row => !row.hidden);
        });
        updateCode();
    }

    // 產生元件程式碼。
    function updateCode() {
        const target = selected();
        if (!target) return;
        const kind = target.dataset.uiComponent;
        const cssVariables = variablesFor(target)
            .map(variable => `${variable}:${target.style.getPropertyValue(variable).trim()}`)
            .filter(variable => !variable.endsWith(":"))
            .join(";");
        const style = cssVariables ? ` style="${cssVariables}"` : "";
        // 建立欄位程式碼。
        const field = (label, content, component = kind) => `<div class="ui-field" data-ui-component="${component}"${style}>\n  <label class="ui-label" for="${component}-value">${label}</label>\n  ${content}\n</div>`;
        const snippets = {
            "text-input": field("姓名", '<input class="ui-control" id="text-input-value" name="name" type="text" placeholder="請輸入姓名" />'),
            textarea: field("備註", '<textarea class="ui-control" id="textarea-value" name="notes" rows="3" placeholder="可選填"></textarea>'),
            select: field("國家", '<select class="ui-control" id="select-value" name="country">\n    <option value="TW">台灣</option>\n    <option value="JP">日本</option>\n  </select>'),
            "tag-select": `<div class="ui-field" data-ui-component="tag-select"${style}>\n  <label class="ui-label" for="tag-select-menu">技能</label>\n  <div class="ui-tag-select-control" data-ui-tag-select-control>\n    <div class="ui-tag-select-tags" data-ui-tag-select-tags></div>\n    <select class="ui-tag-select-menu" id="tag-select-menu" data-ui-tag-select-menu>\n      <option value="">選擇技能</option>\n      <option value="csharp">C#</option>\n      <option value="javascript">JavaScript</option>\n    </select>\n  </div>\n  <select class="ui-tag-select-values" name="skills" multiple data-ui-tag-select-values>\n    <option value="csharp">C#</option>\n    <option value="javascript">JavaScript</option>\n  </select>\n</div>`,
            checkbox: '<label class="ui-field"><input class="ui-check-control" name="emailUpdates" type="checkbox" value="true" /> 我想收到產品更新</label>',
            radio: '<label class="ui-field"><input class="ui-check-control" name="preferredContact" type="radio" value="email" /> 電子郵件</label>',
            button: `<button class="ui-button" type="button"${style}>送出表單</button>`,
            "file-upload": `<div class="ui-file-upload" data-ui-component="file-upload" data-ui-accept=".pdf,.doc,.docx" data-ui-max-size="10"${style}>\n  <label class="ui-label" for="attachment">附件</label>\n  <div class="ui-file-drop-zone" data-ui-file-dropzone tabindex="0" role="button">\n    <span class="ui-file-upload-icon" aria-hidden="true">↑</span><strong>拖放檔案到這裡</strong><span class="ui-file-or">或</span><button class="ui-file-browse" type="button" data-ui-file-browse>瀏覽檔案</button><span class="ui-file-hint">支援 .pdf、.doc、.docx · 上限 10 MB</span>\n  </div>\n  <input class="ui-file-input" id="attachment" name="attachment" type="file" accept=".pdf,.doc,.docx" data-ui-file-input />\n  <div class="ui-file-list" data-ui-file-list aria-live="polite"></div>\n</div>`,
            "file-download": `<section class="ui-file-download" data-ui-component="file-download" data-ui-download-name="年度報告.pdf" data-ui-download-url="/files/annual-report.pdf"${style}>\n  <div class="ui-download-card"><div class="ui-download-file-icon" aria-hidden="true">↓</div><div class="ui-download-copy"><strong>年度報告</strong><span>年度報告.pdf</span></div><div class="ui-download-actions"><button class="ui-button" type="button" data-ui-download-start>下載檔案</button></div></div>\n</section>`,
            "date-picker": field("日期", '<input class="ui-control ui-date-control" id="date-picker-value" name="selectedDate" type="text" readonly autocomplete="off" data-ui-date-control="date" />'),
            "date-time-picker": field("日期與時間", '<input class="ui-control ui-date-control" id="date-time-picker-value" name="selectedDateTime" type="text" readonly autocomplete="off" data-ui-date-control="datetime" />'),
            "time-picker": field("時間", '<input class="ui-control ui-time-control" id="time-picker-value" name="selectedTime" type="text" readonly autocomplete="off" data-ui-time-control="true" />'),
            "date-range-picker": `<div class="ui-field" data-ui-component="date-range-picker"${style}>\n  <label class="ui-label" for="date-range-value">住宿日期</label>\n  <input class="ui-control ui-date-control" id="date-range-value" type="text" readonly autocomplete="off" data-ui-date-control="range" />\n  <input name="startDate" type="hidden" data-ui-range-start />\n  <input name="endDate" type="hidden" data-ui-range-end />\n</div>`
        };
        formatCode(codeOutput, snippets[kind] || "");
    }

    // 顯示元件文件。
    function renderDoc(kind) {
        const doc = docs[kind];
        if (!doc || !componentDoc) return;
        docTitle.textContent = `${doc.title} 設定`;
        docSummary.textContent = doc.summary;
        formatCode(docRazor, codeOutput.textContent || razorExamples[kind] || doc.razor);
        const parameters = parameterNotes[kind] || [];
        docData.innerHTML = `${doc.data}<h4 class="h6 mt-3">參數對照</h4><dl class="ui-doc-parameters">${parameters.map(([name, description]) => `<dt><code>${name}</code></dt><dd>${description}</dd>`).join("")}</dl>`;
    }

    colorInputs.forEach(input => input.addEventListener("input", () => {
        const target = selected();
        themeTargets(target).forEach(item => item.style.setProperty(input.dataset.uiColor, input.value));
        updateCode();
    }));

    // 更新上傳限制。
    function updateUploadSettings() {
        const target = selected();
        if (target?.dataset.uiComponent !== "file-upload") return;
        const accept = uploadAccept.value.trim();
        const maxSize = Math.min(2048, Math.max(1, Number(uploadMaxSize.value) || 1));
        uploadMaxSize.value = maxSize;
        target.dataset.uiAccept = accept;
        target.dataset.uiMaxSize = String(maxSize);
        target.querySelector("[data-ui-file-input]").accept = accept;
        target.querySelector(".ui-file-hint").textContent = `支援 ${accept.replaceAll(",", "、")} · 上限 ${maxSize} MB`;
        updateCode();
    }
    uploadAccept?.addEventListener("input", updateUploadSettings);
    uploadMaxSize?.addEventListener("input", updateUploadSettings);

    colorRows.forEach(row => {
        const input = row.querySelector("[data-ui-color]");
        row.tabIndex = 0;
        row.setAttribute("role", "button");
        row.addEventListener("click", event => {
            if (!input.contains(event.target)) input.click();
        });
        row.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                input.click();
            }
        });
    });

    editor.querySelector("[data-ui-copy]").addEventListener("click", async () => {
        const button = editor.querySelector("[data-ui-copy]");
        await navigator.clipboard.writeText(codeOutput.textContent);
        const original = button.textContent;
        button.textContent = "已複製";
        setTimeout(() => { button.textContent = original; }, 1500);
    });

    // 切換元件預覽。
    function showPreview(kind) {
        guide.hidden = true;
        editor.hidden = false;
        previewSection.hidden = false;
        componentDoc.hidden = false;
        guideButton.classList.remove("active");
        previewItems.forEach(item => { item.hidden = item.dataset.uiPreviewKind !== kind; });
        navButtons.forEach(button => {
            const active = button.dataset.uiShowKind === kind;
            button.classList.toggle("active", active);
            button.setAttribute("aria-current", active ? "page" : "false");
        });
        if (previewTitle) previewTitle.textContent = `${labels[kind] ?? kind} 預覽`;
        const firstTarget = targets.find(target => target.dataset.uiComponent === kind);
        if (firstTarget) currentTarget = firstTarget;
        updateEditor();
        renderDoc(kind);
    }

    navButtons.forEach(button => button.addEventListener("click", () => showPreview(button.dataset.uiShowKind)));
    guideButton.addEventListener("click", () => {
        guide.hidden = false;
        editor.hidden = true;
        previewSection.hidden = true;
        componentDoc.hidden = true;
        navButtons.forEach(button => button.classList.remove("active"));
        guideButton.classList.add("active");
    });
    showPreview("text-input");
})();

(() => {
    const tagSelects = [...document.querySelectorAll("[data-ui-component='tag-select']")];
    if (!tagSelects.length) return;

    tagSelects.forEach(tagSelect => {
        const menu = tagSelect.querySelector("[data-ui-tag-select-menu]");
        const values = tagSelect.querySelector("[data-ui-tag-select-values]");
        const tags = tagSelect.querySelector("[data-ui-tag-select-tags]");
        const control = tagSelect.querySelector("[data-ui-tag-select-control]");
        // 取得已選選項。
        const selected = () => [...values.options].filter(option => option.selected);
        // 依值查詢選項。
        const optionFor = value => [...values.options].find(option => option.value === value);

        // 顯示已選標籤。
        function render() {
            tags.replaceChildren();
            selected().forEach(option => {
                const tag = document.createElement("span");
                tag.className = "ui-tag-select-tag";
                const text = document.createElement("span");
                text.textContent = option.text;
                const remove = document.createElement("button");
                remove.type = "button";
                remove.className = "ui-tag-select-remove";
                remove.setAttribute("aria-label", `移除 ${option.text}`);
                remove.textContent = "×";
                remove.addEventListener("click", () => {
                    option.selected = false;
                    render();
                    values.dispatchEvent(new Event("change", { bubbles: true }));
                });
                tag.append(text, remove);
                tags.append(tag);
            });
            [...menu.options].forEach(option => {
                option.disabled = Boolean(option.value) && Boolean(optionFor(option.value)?.selected);
            });
        }

        menu.addEventListener("change", () => {
            if (!menu.value) return;
            const option = optionFor(menu.value);
            if (option) option.selected = true;
            menu.value = "";
            render();
            values.dispatchEvent(new Event("change", { bubbles: true }));
        });
        control.addEventListener("click", event => {
            if (!event.target.closest("button, select")) menu.focus();
        });
        render();
    });
})();

(() => {
    const downloads = [...document.querySelectorAll("[data-ui-component='file-download']")];
    if (!downloads.length) return;

    const dialog = document.createElement("dialog");
    dialog.className = "ui-download-dialog";
    document.body.append(dialog);
    let timer;
    let active;

    // 驗證下載網址。
    const safeDownloadUrl = value => {
        try {
            const url = new URL(value, window.location.origin);
            return ["http:", "https:"].includes(url.protocol) ? url.href : null;
        } catch {
            return null;
        }
    };

    // 顯示下載狀態。
    function render(state, progress = 0) {
        window.clearInterval(timer);
        const details = state === "success"
            ? { icon: "check-lg", heading: "下載完成", message: `${active.dataset.uiDownloadName} 已準備完成。` }
            : state === "failure"
                ? { icon: "x-lg", heading: "下載失敗", message: "檔案暫時無法下載，請稍後再試。" }
                : { icon: "arrow-down", heading: "正在下載", message: `正在準備 ${active.dataset.uiDownloadName}…` };
        dialog.className = `ui-download-dialog is-${state === "downloading" ? "downloading" : state}`;
        const content = document.createElement("div");
        content.className = "ui-download-dialog-content";
        const icon = document.createElement("div");
        icon.className = `ui-download-status-icon is-${state}`;
        icon.setAttribute("aria-hidden", "true");
        const iconGlyph = document.createElement("i");
        iconGlyph.className = `bi bi-${details.icon}`;
        icon.append(iconGlyph);
        const heading = document.createElement("h2");
        heading.textContent = details.heading;
        const message = document.createElement("p");
        message.textContent = details.message;
        const progressElement = document.createElement("div");
        progressElement.className = "ui-download-progress";
        progressElement.setAttribute("aria-label", "下載進度");
        const progressBar = document.createElement("i");
        progressBar.style.width = `${Math.max(0, Math.min(100, Number(progress) || 0))}%`;
        progressElement.append(progressBar);
        const actions = document.createElement("div");
        actions.className = "ui-download-dialog-actions";
        if (state === "success") {
            const url = safeDownloadUrl(active.dataset.uiDownloadUrl);
            if (url) {
                const openLink = document.createElement("a");
                openLink.className = "btn btn-success";
                openLink.href = url;
                openLink.target = "_blank";
                openLink.rel = "noopener";
                const openIcon = document.createElement("i");
                openIcon.className = "bi bi-box-arrow-up-right";
                openIcon.setAttribute("aria-hidden", "true");
                openLink.append(openIcon, "開啟文件");
                actions.append(openLink);
            }
        }
        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.className = "btn btn-outline-secondary";
        closeButton.dataset.uiDownloadClose = "";
        closeButton.textContent = "關閉";
        actions.append(closeButton);
        content.append(icon, heading, message, progressElement, actions);
        dialog.replaceChildren(content);
    }

    // 開啟下載視窗。
    function open(state) {
        render("downloading", 8);
        if (!dialog.open) dialog.showModal();
        let progress = 8;
        timer = window.setInterval(() => {
            progress = Math.min(100, progress + 14 + Math.round(Math.random() * 12));
            dialog.querySelector(".ui-download-progress i").style.width = `${progress}%`;
            if (progress === 100) { window.clearInterval(timer); window.setTimeout(() => render(state, 100), 180); }
        }, 170);
    }

    downloads.forEach(download => {
        download.querySelector("[data-ui-download-start]").addEventListener("click", () => { active = download; open("success"); });
        download.querySelector("[data-ui-download-success]").addEventListener("click", () => { active = download; open("success"); });
        download.querySelector("[data-ui-download-failure]").addEventListener("click", () => { active = download; open("failure"); });
    });
    dialog.addEventListener("click", event => { if (event.target === dialog || event.target.closest("[data-ui-download-close]")) { window.clearInterval(timer); dialog.close(); } });
})();

(() => {
    const controls = [...document.querySelectorAll("[data-ui-premium-time-control]")];
    if (!controls.length) return;
    let state;

    // 補齊兩位數字。
    const two = value => String(value).padStart(2, "0");
    // 計算循環索引。
    const modulo = (value, max) => (value + max) % max;
    // 取得顯示小時。
    const displayHour = () => state.is12Hour ? (state.hour % 12 || 12) : state.hour;
    // 取得上午或下午。
    const period = () => state.hour >= 12 ? "PM" : "AM";
    // 格式化顯示時間。
    const format = () => state.is12Hour ? `${two(displayHour())}:${two(state.minute)} ${period()}` : `${two(state.hour)}:${two(state.minute)}`;
    // 取得相鄰時間值。
    const around = (value, max) => [-2, -1, 0, 1, 2].map(offset => modulo(value + offset, max));

    // 關閉時間選擇器。
    function close() {
        state?.panel?.remove();
        if (state?.control) state.control.setAttribute("aria-expanded", "false");
        state = null;
    }

    // 繪製時間選擇器。
    function render() {
        const hourValues = around(state.is12Hour ? displayHour() - 1 : state.hour, state.is12Hour ? 12 : 24)
            .map(value => state.is12Hour ? value + 1 : value);
        const minuteValues = around(state.minute, 60);
        // 建立時間滾輪項目。
        const rows = (values, unit, selected) => values.map(value => `<button type="button" class="ui-premium-wheel-item${value === selected ? " is-selected" : ""}" data-ui-time-wheel="${unit}" data-ui-time-number="${value}">${two(value)}</button>`).join("");
        const panel = document.createElement("section");
        panel.className = "ui-premium-time-panel";
        panel.setAttribute("role", "dialog");
        panel.setAttribute("aria-label", "選擇時間");
        const periodWheel = state.is12Hour ? `<div class="ui-premium-period"><button type="button" class="${period() === "AM" ? "is-active" : ""}" data-ui-time-period="AM">AM</button><button type="button" class="${period() === "PM" ? "is-active" : ""}" data-ui-time-period="PM">PM</button></div>` : "";
        panel.innerHTML = `
      <div class="ui-premium-tabs"><button type="button" class="is-active" data-ui-time-tab="time">◷ Time</button><button type="button" data-ui-time-now>☼ Now</button><button type="button" data-ui-time-format>${state.is12Hour ? "12H" : "24H"}</button></div>
      <div class="ui-premium-wheels${state.is12Hour ? "" : " is-24-hour"}">
        <div class="ui-premium-wheel">${rows(hourValues, "hour", displayHour())}</div>
        <div class="ui-premium-wheel">${rows(minuteValues, "minute", state.minute)}</div>
        ${periodWheel}
      </div>
      <div class="ui-premium-actions"><button type="button" data-ui-time-cancel>Cancel</button><button type="button" data-ui-time-done>Done</button></div>`;
        state.panel?.replaceWith(panel);
        state.panel = panel;
    }

    // 開啟時間選擇器。
    function open(control) {
        if (state?.control === control) { close(); return; }
        close();
        const valueInput = control.closest("[data-ui-component]").querySelector("[data-ui-time-value]");
        const [hour = 9, minute = 0] = (valueInput.value || "09:00").split(":").map(Number);
        state = { control, valueInput, hour, minute, is12Hour: false, panel: null };
        control.setAttribute("aria-expanded", "true");
        render();
    }

    controls.forEach(control => control.addEventListener("click", event => { event.stopPropagation(); open(control); }));
    document.addEventListener("click", event => {
        if (state && !state.control.closest("[data-ui-component]").contains(event.target)) close();
    });
    document.addEventListener("keydown", event => { if (event.key === "Escape" && state) close(); });

    document.addEventListener("click", event => {
        if (!state || !state.panel.contains(event.target)) return;
        const wheel = event.target.closest("[data-ui-time-wheel]");
        if (wheel) {
            const value = Number(wheel.dataset.uiTimeNumber);
            if (wheel.dataset.uiTimeWheel === "hour") state.hour = state.is12Hour ? (state.hour >= 12 ? 12 : 0) + (value % 12) : value;
            else state.minute = value;
            render();
            return;
        }
        if (event.target.matches("[data-ui-time-period]")) {
            const pm = event.target.dataset.uiTimePeriod === "PM";
            if (pm !== (state.hour >= 12)) state.hour = (state.hour + 12) % 24;
            render();
            return;
        }
        if (event.target.matches("[data-ui-time-now]")) {
            const now = new Date(); state.hour = now.getHours(); state.minute = now.getMinutes(); render(); return;
        }
        if (event.target.matches("[data-ui-time-format]")) { state.is12Hour = !state.is12Hour; render(); return; }
        if (event.target.matches("[data-ui-time-cancel]")) { close(); return; }
        if (event.target.matches("[data-ui-time-done]")) {
            state.valueInput.value = `${two(state.hour)}:${two(state.minute)}`;
            state.control.querySelector(".ui-time-trigger-value").textContent = format();
            state.control.querySelector(".ui-time-trigger-period").textContent = state.is12Hour ? period() : "24H";
            state.valueInput.dispatchEvent(new Event("change", { bubbles: true }));
            close();
        }
    });
})();

(() => {
    const controls = [...document.querySelectorAll("[data-ui-date-control]")];
    if (!controls.length) return;

    const dialog = document.createElement("dialog");
    dialog.className = "ui-date-dialog";
    document.body.append(dialog);
    let state;

    // 轉為 ISO 日期。
    const iso = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    // 解析 ISO 日期。
    const parse = value => value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : null;
    // 比較是否同一天。
    const same = (left, right) => left && right && iso(left) === iso(right);
    // 判斷日期是否在區間內。
    const between = (value, start, end) => start && end && value > start && value < end;

    // 套用日期主題。
    function copyTheme(control) {
        const wrapper = control.closest("[data-ui-component]");
        const computed = getComputedStyle(wrapper);
        ["--ui-confirm-color", "--ui-cancel-color", "--ui-range-endpoint-color", "--ui-range-fill-color"].forEach(variable => {
            dialog.style.setProperty(variable, computed.getPropertyValue(variable).trim());
        });
    }

    // 開啟日期選擇器。
    function open(control) {
        const mode = control.dataset.uiDateControl;
        const wrapper = control.closest("[data-ui-component]");
        const startInput = wrapper.querySelector("[data-ui-range-start]");
        const endInput = wrapper.querySelector("[data-ui-range-end]");
        const singleValue = mode === "datetime" ? control.value.slice(0, 10) : control.value;
        const initial = mode === "range" ? parse(startInput?.value) : parse(singleValue);
        state = {
            mode, control, wrapper, startInput, endInput,
            start: mode === "range" ? parse(startInput?.value) : initial,
            end: mode === "range" ? parse(endInput?.value) : null,
            selected: initial,
            time: mode === "datetime" && control.value.length >= 16 ? control.value.slice(11, 16) : "09:00",
            month: initial ?? parse(startInput?.value) ?? new Date(),
            panel: "calendar"
        };
        state.month = new Date(state.month.getFullYear(), state.month.getMonth(), 1, 12);
        copyTheme(control);
        render();
        if (!dialog.open) dialog.showModal();
    }

    const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
    // 建立時間選項。
    const options = (count, selected) => Array.from({ length: count }, (_, value) => `<option value="${String(value).padStart(2, "0")}"${Number(selected) === value ? " selected" : ""}>${String(value).padStart(2, "0")}</option>`).join("");

    // 繪製日期選擇器。
    function render() {
        const { month, mode, panel = "calendar" } = state;
        let header;
        let body;
        if (panel === "year") {
            const firstYear = Math.floor(month.getFullYear() / 12) * 12;
            header = `<div class="ui-date-dialog-header"><button type="button" class="ui-date-nav" data-ui-date-prev aria-label="前十二年">‹</button><strong>${firstYear}–${firstYear + 11}</strong><button type="button" class="ui-date-nav" data-ui-date-next aria-label="後十二年">›</button></div>`;
            body = `<div class="ui-year-grid">${Array.from({ length: 12 }, (_, index) => { const year = firstYear + index; return `<button type="button" class="ui-year-option${year === month.getFullYear() ? " is-selected" : ""}" data-ui-year="${year}">${year}</button>`; }).join("")}</div>`;
        } else if (panel === "month") {
            header = `<div class="ui-date-dialog-header"><button type="button" class="ui-date-nav" data-ui-date-prev aria-label="上一年">‹</button><button type="button" class="ui-date-title" data-ui-date-title>${month.getFullYear()} 年</button><button type="button" class="ui-date-nav" data-ui-date-next aria-label="下一年">›</button></div>`;
            body = `<div class="ui-month-grid">${monthNames.map((name, index) => `<button type="button" class="ui-month-option${index === month.getMonth() ? " is-selected" : ""}" data-ui-month="${index}">${name}</button>`).join("")}</div>`;
        } else {
            const firstDay = (month.getDay() + 6) % 7;
            const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
            const cells = Array.from({ length: firstDay + lastDay }, (_, index) => {
                if (index < firstDay) return '<span class="ui-date-empty"></span>';
                const date = new Date(month.getFullYear(), month.getMonth(), index - firstDay + 1, 12);
                const selected = mode === "range" ? same(date, state.start) || same(date, state.end) : same(date, state.selected);
                const range = mode === "range" && between(date, state.start, state.end);
                return `<button type="button" class="ui-date-day${selected ? " is-selected" : ""}${range ? " is-in-range" : ""}" data-ui-date="${iso(date)}">${date.getDate()}</button>`;
            }).join("");
            header = `<div class="ui-date-dialog-header"><button type="button" class="ui-date-nav" data-ui-date-prev aria-label="上個月">‹</button><button type="button" class="ui-date-title" data-ui-date-title>${month.getFullYear()} 年 ${monthNames[month.getMonth()]}</button><button type="button" class="ui-date-nav" data-ui-date-next aria-label="下個月">›</button></div>`;
            body = `<div class="ui-date-weekdays"><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span></div><div class="ui-date-grid">${cells}</div>`;
        }
        const [hour, minute] = state.time.split(":").map(Number);
        const timeControl = mode === "datetime" ? `<div class="ui-date-time-panel"><span>選擇時間</span><div><select data-ui-date-hour aria-label="小時">${options(24, hour)}</select><b>:</b><select data-ui-date-minute aria-label="分鐘">${options(60, minute)}</select></div></div>` : "";
        dialog.innerHTML = `${header}${body}${timeControl}<div class="ui-date-actions"><button type="button" class="btn ui-date-cancel" data-ui-date-cancel>取消</button><button type="button" class="btn ui-date-confirm" data-ui-date-confirm>確認</button></div>`;
    }

    dialog.addEventListener("click", event => {
        if (event.target === dialog) { dialog.close(); return; }
        if (event.target.matches("[data-ui-date-prev]")) {
            const delta = state.panel === "year" ? -12 : state.panel === "month" ? -1 : 0;
            state.month = state.panel === "calendar" ? new Date(state.month.getFullYear(), state.month.getMonth() - 1, 1, 12) : new Date(state.month.getFullYear() + delta, state.month.getMonth(), 1, 12); render(); return;
        }
        if (event.target.matches("[data-ui-date-next]")) {
            const delta = state.panel === "year" ? 12 : state.panel === "month" ? 1 : 0;
            state.month = state.panel === "calendar" ? new Date(state.month.getFullYear(), state.month.getMonth() + 1, 1, 12) : new Date(state.month.getFullYear() + delta, state.month.getMonth(), 1, 12); render(); return;
        }
        if (event.target.matches("[data-ui-date-title]")) { state.panel = state.panel === "calendar" ? "month" : "year"; render(); return; }
        if (event.target.matches("[data-ui-year]")) { state.month = new Date(Number(event.target.dataset.uiYear), state.month.getMonth(), 1, 12); state.panel = "month"; render(); return; }
        if (event.target.matches("[data-ui-month]")) { state.month = new Date(state.month.getFullYear(), Number(event.target.dataset.uiMonth), 1, 12); state.panel = "calendar"; render(); return; }
        const day = event.target.closest("[data-ui-date]");
        if (day) {
            const value = parse(day.dataset.uiDate);
            if (state.mode === "range") {
                if (!state.start || state.end) { state.start = value; state.end = null; }
                else if (value < state.start) { state.end = state.start; state.start = value; }
                else { state.end = value; }
            } else state.selected = value;
            render();
            return;
        }
        if (event.target.matches("[data-ui-date-cancel]")) { dialog.close(); return; }
        if (event.target.matches("[data-ui-date-confirm]")) {
            if (state.mode === "range") {
                if (!state.start || !state.end) return;
                state.startInput.value = iso(state.start);
                state.endInput.value = iso(state.end);
                state.control.value = `${iso(state.start)} 至 ${iso(state.end)}`;
            } else if (state.selected) {
                state.control.value = state.mode === "datetime" ? `${iso(state.selected)} ${state.time}` : iso(state.selected);
            }
            state.control.dispatchEvent(new Event("change", { bubbles: true }));
            dialog.close();
        }
    });

    dialog.addEventListener("change", event => {
        if (event.target.matches("[data-ui-date-hour], [data-ui-date-minute]")) {
            const hour = dialog.querySelector("[data-ui-date-hour]").value;
            const minute = dialog.querySelector("[data-ui-date-minute]").value;
            state.time = `${hour}:${minute}`;
        }
    });
    controls.forEach(control => control.addEventListener("click", () => open(control)));
})();

(() => {
    const uploads = [...document.querySelectorAll("[data-ui-component='file-upload']")];
    if (!uploads.length) return;

    // 格式化檔案大小。
    const formatSize = bytes => bytes < 1024 * 1024
        ? `${Math.max(1, Math.round(bytes / 1024))} KB`
        : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    uploads.forEach(upload => {
        const input = upload.querySelector("[data-ui-file-input]");
        const dropZone = upload.querySelector("[data-ui-file-dropzone]");
        const browse = upload.querySelector("[data-ui-file-browse]");
        const list = upload.querySelector("[data-ui-file-list]");
        // 取得檔案大小上限。
        const maxBytes = () => Number(upload.dataset.uiMaxSize || 10) * 1024 * 1024;
        // 檢查檔案類型。
        const accepts = file => {
            const accepted = (input.accept || "").split(",").map(value => value.trim().toLowerCase()).filter(Boolean);
            return !accepted.length || accepted.some(rule => rule.startsWith(".")
                ? file.name.toLowerCase().endsWith(rule)
                : rule.endsWith("/*") ? file.type.startsWith(rule.slice(0, -1)) : file.type === rule);
        };

        // 加入上傳檔案。
        const addFile = file => {
            const item = document.createElement("article");
            item.className = "ui-file-item is-uploading";
            const validType = accepts(file);
            const validSize = file.size <= maxBytes();
            const icon = document.createElement("span");
            icon.className = "ui-file-item-icon";
            icon.setAttribute("aria-hidden", "true");
            const content = document.createElement("div");
            const name = document.createElement("strong");
            name.textContent = file.name;
            const description = document.createElement("small");
            const remove = document.createElement("button");
            remove.type = "button";
            remove.setAttribute("aria-label", "移除檔案");
            remove.textContent = "×";
            remove.addEventListener("click", () => item.remove());
            if (!validType || !validSize) {
                const reason = !validType ? `僅允許 ${input.accept.replaceAll(",", "、")} 檔案。` : `檔案不可超過 ${upload.dataset.uiMaxSize} MB。`;
                item.classList.add("is-error");
                icon.textContent = "!";
                description.textContent = reason;
                content.append(name, description);
                item.append(icon, content, remove);
                list.append(item);
                return;
            }
            icon.textContent = "⇧";
            description.textContent = `${formatSize(file.size)} · 正在上傳`;
            const progressTrack = document.createElement("span");
            progressTrack.className = "ui-file-progress";
            const bar = document.createElement("i");
            progressTrack.append(bar);
            content.append(name, description, progressTrack);
            item.append(icon, content, remove);
            list.append(item);
            let progress = 0;
            const timer = window.setInterval(() => {
                progress = Math.min(100, progress + 10 + Math.round(Math.random() * 16));
                bar.style.width = `${progress}%`;
                if (progress === 100) {
                    window.clearInterval(timer);
                    item.classList.replace("is-uploading", "is-complete");
                    item.querySelector("small").textContent = `${formatSize(file.size)} · 已準備上傳`;
                }
            }, 95);
        };
        // 處理選取檔案。
        const handleFiles = files => {
            const values = [...files];
            if (!upload.dataset.uiMultiple) list.replaceChildren();
            values.slice(0, upload.dataset.uiMultiple ? values.length : 1).forEach(addFile);
        };

        input.addEventListener("change", () => handleFiles(input.files));
        browse.addEventListener("click", event => { event.stopPropagation(); input.click(); });
        dropZone.addEventListener("click", () => input.click());
        dropZone.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") { event.preventDefault(); input.click(); }
        });
        ["dragenter", "dragover"].forEach(eventName => dropZone.addEventListener(eventName, event => {
            event.preventDefault();
            dropZone.classList.add("is-dragging");
        }));
        ["dragleave", "drop"].forEach(eventName => dropZone.addEventListener(eventName, event => {
            event.preventDefault();
            dropZone.classList.remove("is-dragging");
        }));
        dropZone.addEventListener("drop", event => {
            const files = event.dataTransfer?.files;
            if (!files?.length) return;
            try {
                const transfer = new DataTransfer();
                [...files].slice(0, upload.dataset.uiMultiple ? files.length : 1).forEach(file => transfer.items.add(file));
                input.files = transfer.files;
            } catch { /* Some browser policies prevent assigning dropped files; the preview still works. */ }
            handleFiles(files);
        });
    });
})();

(() => {
    const controls = [...document.querySelectorAll("[data-ui-time-control]")];
    if (!controls.length) return;

    const dialog = document.createElement("dialog");
    dialog.className = "ui-time-dialog";
    document.body.append(dialog);
    let state;

    // 補齊兩位數字。
    const twoDigits = value => String(value).padStart(2, "0");
    // 計算循環數值。
    const wrap = (value, limit) => (value + limit) % limit;

    // 套用時間主題。
    function copyTheme(control) {
        const computed = getComputedStyle(control.closest("[data-ui-component]"));
        ["--ui-confirm-color", "--ui-cancel-color", "--ui-time-control-color", "--ui-flip-number-color", "--ui-flip-number-background"].forEach(variable => dialog.style.setProperty(variable, computed.getPropertyValue(variable).trim()));
    }

    // 繪製翻頁時鐘。
    function render(flipUnit) {
        const values = state.quickUnit === "hour"
            ? Array.from({ length: 24 }, (_, index) => index)
            : Array.from({ length: 60 }, (_, index) => index);
        const quickPanel = state.quickUnit ? `<div class="ui-time-quick-panel"><div class="ui-time-quick-title"><span>直接選擇${state.quickUnit === "hour" ? "小時" : "分鐘"}</span><button type="button" data-ui-time-close-quick aria-label="關閉">×</button></div><div class="ui-time-quick-grid">${values.map(value => `<button type="button" data-ui-time-value="${value}">${twoDigits(value)}</button>`).join("")}</div></div>` : "";
        dialog.innerHTML = `
      <div class="ui-time-header"><span>選擇時間</span></div>
      <div class="ui-flip-clock">
        <div class="ui-flip-unit"><button type="button" data-ui-time-adjust="hour" data-ui-time-step="1" aria-label="增加小時"><i class="bi bi-chevron-up" aria-hidden="true"></i></button><button type="button" class="ui-flip-number${flipUnit === "hour" ? " is-flipping" : ""}" data-ui-time-quick="hour" aria-label="直接選擇小時"><span class="ui-flip-value">${twoDigits(state.hour)}</span></button><button type="button" data-ui-time-adjust="hour" data-ui-time-step="-1" aria-label="減少小時"><i class="bi bi-chevron-down" aria-hidden="true"></i></button></div>
        <span class="ui-flip-colon">:</span>
        <div class="ui-flip-unit"><button type="button" data-ui-time-adjust="minute" data-ui-time-step="1" aria-label="增加分鐘"><i class="bi bi-chevron-up" aria-hidden="true"></i></button><button type="button" class="ui-flip-number${flipUnit === "minute" ? " is-flipping" : ""}" data-ui-time-quick="minute" aria-label="直接選擇分鐘"><span class="ui-flip-value">${twoDigits(state.minute)}</span></button><button type="button" data-ui-time-adjust="minute" data-ui-time-step="-1" aria-label="減少分鐘"><i class="bi bi-chevron-down" aria-hidden="true"></i></button></div>
      </div>
      ${quickPanel}
      <div class="ui-date-actions"><button type="button" class="btn ui-date-cancel" data-ui-time-cancel>取消</button><button type="button" class="btn ui-date-confirm" data-ui-time-confirm>確認</button></div>`;
    }

    // 開啟翻頁時鐘。
    function open(control) {
        const [hour = 9, minute = 0] = (control.value || "09:00").split(":").map(Number);
        state = { control, hour, minute, quickUnit: null };
        copyTheme(control);
        render();
        if (!dialog.open) dialog.showModal();
    }

    dialog.addEventListener("click", event => {
        if (event.target === dialog) { dialog.close(); return; }
        const adjust = event.target.closest("[data-ui-time-adjust]");
        if (adjust) {
            const unit = adjust.dataset.uiTimeAdjust;
            const step = Number(adjust.dataset.uiTimeStep);
            state[unit] = wrap(state[unit] + step, unit === "hour" ? 24 : 60);
            render(unit);
            return;
        }
        const quickButton = event.target.closest("[data-ui-time-quick]");
        if (quickButton) { state.quickUnit = quickButton.dataset.uiTimeQuick; render(); return; }
        if (event.target.matches("[data-ui-time-close-quick]")) { state.quickUnit = null; render(); return; }
        if (event.target.matches("[data-ui-time-value]")) {
            const value = Number(event.target.dataset.uiTimeValue);
            if (state.quickUnit === "hour") state.hour = value;
            else state.minute = value;
            const unit = state.quickUnit;
            state.quickUnit = null;
            render(unit);
            return;
        }
        if (event.target.matches("[data-ui-time-cancel]")) { dialog.close(); return; }
        if (event.target.matches("[data-ui-time-confirm]")) {
            state.control.value = `${twoDigits(state.hour)}:${twoDigits(state.minute)}`;
            state.control.dispatchEvent(new Event("change", { bubbles: true }));
            dialog.close();
        }
    });

    controls.forEach(control => control.addEventListener("click", () => open(control)));
})();
