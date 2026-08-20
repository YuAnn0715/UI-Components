(() => {
    const editor = document.querySelector("[data-ui-theme-editor]");
    if (!editor) return;

    const codeOutput = editor.querySelector("[data-ui-generated-code]");
    const colorInputs = [...editor.querySelectorAll("[data-ui-color]")];
    const colorRows = [...editor.querySelectorAll("[data-ui-color-row]")];
    const labels = {
        "text-input": "輸入框", textarea: "多行輸入框", select: "下拉選單", "tag-input": "標籤式 Input", "tag-select": "標籤式 Select",
        checkbox: "核取方塊", switch: "Switch", radio: "單選按鈕", button: "按鈕",
        "date-picker": "日期選擇器", "date-time-picker": "日期＋時間", "time-picker": "時間選擇器", "date-range-picker": "日期區間"
    };
    labels["file-upload"] = "檔案上傳";
    labels["file-download"] = "檔案下載";
    labels["data-table"] = "Data Table";
    labels["breadcrumb"] = "麵包屑";
    const allowed = {
        button: ["--ui-button-background", "--ui-button-text", "--ui-button-border"],
        field: ["--ui-border-color", "--ui-focus-color", "--ui-text-color", "--ui-background-color"],
        radio: ["--ui-border-color", "--ui-focus-color", "--ui-text-color"],
        date: ["--ui-border-color", "--ui-focus-color", "--ui-text-color", "--ui-background-color", "--ui-confirm-color", "--ui-cancel-color", "--ui-range-endpoint-color"],
        range: ["--ui-border-color", "--ui-focus-color", "--ui-text-color", "--ui-background-color", "--ui-confirm-color", "--ui-cancel-color", "--ui-range-endpoint-color", "--ui-range-fill-color"],
        time: ["--ui-border-color", "--ui-focus-color", "--ui-text-color", "--ui-background-color", "--ui-confirm-color", "--ui-cancel-color", "--ui-time-control-color", "--ui-flip-number-color", "--ui-flip-number-background"],
        upload: ["--ui-upload-border-color", "--ui-upload-progress-color", "--ui-upload-button-color"],
        download: ["--ui-button-background", "--ui-button-text", "--ui-button-border", "--ui-download-icon-color", "--ui-download-progress-color"],
        tagSelect: ["--ui-border-color", "--ui-focus-color", "--ui-text-color", "--ui-background-color", "--ui-tag-color", "--ui-tag-text-color"],
        switch: ["--ui-switch-on-color", "--ui-switch-off-color", "--ui-switch-thumb-color"],
        table: ["--ui-table-header-background", "--ui-table-header-text", "--ui-table-border", "--ui-table-stripe", "--ui-table-accent"],
        breadcrumb: ["--ui-breadcrumb-accent", "--ui-breadcrumb-accent-soft", "--ui-breadcrumb-text", "--ui-breadcrumb-current-background", "--ui-breadcrumb-current-text"]
    };
    const attributes = {
        "--ui-border-color": "border-color", "--ui-focus-color": "focus-color",
        "--ui-text-color": "text-color", "--ui-background-color": "background-color",
        "--ui-button-background": "background-color", "--ui-button-text": "text-color", "--ui-button-border": "border-color",
        "--ui-confirm-color": "confirm-color", "--ui-cancel-color": "cancel-color",
        "--ui-range-endpoint-color": "endpoint-color", "--ui-range-fill-color": "range-color",
        "--ui-time-control-color": "control-color", "--ui-flip-number-color": "flip-number-color", "--ui-flip-number-background": "flip-number-background-color",
        "--ui-upload-border-color": "border-color", "--ui-upload-progress-color": "progress-color", "--ui-upload-button-color": "button-color",
        "--ui-download-icon-color": "icon-color", "--ui-download-progress-color": "progress-color",
        "--ui-tag-color": "tag-color", "--ui-tag-text-color": "tag-text-color",
        "--ui-switch-on-color": "switch-on-color", "--ui-switch-off-color": "switch-off-color", "--ui-switch-thumb-color": "switch-thumb-color",
        "--ui-table-header-background": "header-background-color", "--ui-table-header-text": "header-text-color",
        "--ui-table-border": "table-border-color", "--ui-table-stripe": "stripe-background-color", "--ui-table-accent": "accent-color",
        "--ui-breadcrumb-accent": "accent-color", "--ui-breadcrumb-accent-soft": "accent-soft-color", "--ui-breadcrumb-text": "text-color",
        "--ui-breadcrumb-current-background": "current-background-color", "--ui-breadcrumb-current-text": "current-text-color"
    };

    const targets = [...document.querySelectorAll("[data-ui-component]")];
    const previewItems = [...document.querySelectorAll("[data-ui-preview-item]")];
    const navButtons = [...document.querySelectorAll("[data-ui-show-kind]")];
    const previewTitle = document.querySelector("#component-preview-title");
    const guideButton = document.querySelector("[data-ui-show-guide]");
    const navigationIcons = {
        "text-input": "input-cursor-text", textarea: "textarea-t", select: "menu-button-wide", "tag-input": "tag", "tag-select": "tags",
        checkbox: "check2-square", switch: "toggle-on", radio: "ui-radios", button: "cursor-fill", "file-upload": "cloud-arrow-up", "file-download": "file-earmark-arrow-down",
        "date-picker": "calendar3", "date-time-picker": "calendar2-week", "time-picker": "clock", "date-range-picker": "calendar-range", "data-table": "table", breadcrumb: "signpost-split"
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
    const breadcrumbSettings = document.querySelector("[data-ui-breadcrumb-settings]");
    const breadcrumbSeparator = document.querySelector("[data-ui-breadcrumb-separator]");

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
        "text-input": { title: "Text Input", summary: "文字、Email、密碼等單行欄位。", data: "<p>使用原生 <code>input</code>，以 <code>name</code> 與 <code>value</code> 設定和取得資料。</p><p>可設定輸入型別、提示文字與四種輸入框配色。</p>" },
        textarea: { title: "Textarea", summary: "用於多行備註或說明內容。", data: "<p>使用原生 <code>textarea</code>，以 <code>name</code> 取得多行文字。</p><p>可設定顯示行數、提示文字與輸入框配色。</p>" },
        select: { title: "Select", summary: "從 option 選項中選擇一個值。", data: "<p>直接在 <code>select</code> 中加入 <code>option</code>；使用者選取值可由 <code>select.value</code> 或表單欄位取得。</p>" },
        checkbox: { title: "Checkbox", summary: "用於單一 true／false 開關。", data: "<p>使用原生 checkbox；以 <code>checked</code> 設定初始值，並從 <code>input.checked</code> 取得狀態。</p>" },
        switch: { title: "Switch", summary: "把單一 true／false 設定變成清楚、好操作的滑動開關。", data: "<p>保留原生 <code>input[type=checkbox]</code>，因此可以直接放進表單；以 <code>checked</code> 設定初始狀態。</p><p>可用三個 <code>--ui-switch-*</code> CSS 變數調整開啟、關閉與滑塊配色。</p>" },
        radio: { title: "Radio", summary: "同一個欄位提供多個互斥選項。", data: "<p>同一組 Radio 使用相同 <code>name</code>，每個選項使用不同 <code>value</code>。</p><p>ASP.NET Core 可用 <code>Request.Form[\"preferredContact\"]</code> 取得目前選取值。</p>" },
        button: { title: "Button", summary: "提交表單或觸發頁面動作的按鈕。", data: "<p>使用原生 <code>button</code>；<code>type=\"submit\"</code> 可提交表單，<code>type=\"button\"</code> 可觸發前端動作。</p>" },
        "date-picker": { title: "日期選擇器", summary: "選擇單一日期。", data: "<p>元件會寫入 <code>input[name=selectedDate].value</code>，格式為 <code>YYYY/MM/DD</code>。</p>" },
        "date-time-picker": { title: "日期＋時間", summary: "選擇日期與時間。", data: "<p>元件會寫入 <code>input[name=selectedDateTime].value</code>，格式為 <code>YYYY/MM/DD HH:mm</code>。</p>" },
        "time-picker": { title: "時間選擇器", summary: "使用翻頁時鐘選擇時間。", data: "<p>元件會寫入 <code>input[name=selectedTime].value</code>，格式為 <code>HH:mm</code>。</p>" },
        "date-range-picker": { title: "日期區間", summary: "一次選擇起日與迄日。", data: "<p>元件會分別寫入 <code>input[name=startDate]</code> 與 <code>input[name=endDate]</code>。</p>" },
        "data-table": { title: "Data Table", summary: "可排序、可分頁的資料表。", data: "<p>一般 HTML <code>table</code> 加上 <code>data-ui-data-table=\"true\"</code> 後，即可啟用排序、每頁筆數選擇與分頁。</p><p>可用 <code>data-ui-striped</code> 開關斑馬紋、用 <code>data-ui-hover</code> 開關滑入列高亮；排序欄位可在標題上使用 <code>data-ui-sortable=\"true\"</code> 或 <code>data-ui-sortable=\"false\"</code>。</p>" },
        "tag-input": { title: "標籤式 Input", summary: "輸入文字後按 Enter 建立自訂標籤。", data: `<p>在 <code>data-ui-tag-input-input</code> 輸入文字後按 <kbd>Enter</kbd> 建立 tag。<code>data-ui-tag-input-values</code> 是隱藏的原生 <code>select multiple</code>，不是第二個可見元件；它會保存自訂 tag，並作為表單實際送出的欄位。</p><p>ASP.NET Core 可用 <code>var tags = Request.Form["tags"].ToArray();</code> 取得所有 tag 值；前端可讀取 <code>data-ui-tag-input-values</code> 的 <code>selectedOptions</code>。</p>` },
        "tag-select": { title: "標籤式 Select", summary: "從選單選取多個項目並顯示為標籤。", data: `<p>使用 <code>data-ui-tag-select-menu</code> 選擇既有項目；<code>data-ui-tag-select-values</code> 是隱藏的原生 <code>select multiple</code>，會保存已選項目並作為表單實際送出的欄位。</p><p>ASP.NET Core 可用 <code>var skills = Request.Form["skills"].ToArray();</code> 取得所有選取值；前端可讀取 <code>data-ui-tag-select-values</code> 的 <code>selectedOptions</code>。</p>` },
        "file-upload": { title: "檔案上傳", summary: "支援拖放與瀏覽檔案。", data: "<p>使用 <code>input[type=file]</code> 取得檔案；前端會檢查格式與大小並顯示清單，伺服器仍必須驗證檔案。</p>" },
        "file-download": { title: "檔案下載", summary: "顯示下載進度並提供檔案連結。", data: "<p><code>data-ui-download-url</code> 會用於完成後的下載連結；實際檔案傳輸由瀏覽器處理。</p>" },
        breadcrumb: { title: "麵包屑", summary: "以圖示、色彩與目前位置膠囊，讓頁面層級更容易掃讀。", data: "<p>使用 Bootstrap 5 的 <code>breadcrumb</code> 與 <code>breadcrumb-item</code> 語意結構，搭配 UI Component Library 的視覺樣式。</p><p>連結項目使用 <code>a</code>，目前頁面使用 <code>aria-current=\"page\"</code>；分隔圖示可由 <code>data-ui-breadcrumb-separator</code> 選擇。</p>" }
    };
    const parameterNotes = {
        "text-input": [["name", "表單欄位名稱"], ["type / placeholder", "原生輸入型別與提示文字"], ["value", "初始值"], ["autocomplete", "瀏覽器自動填入提示，例如 name、email、username"]],
        textarea: [["name", "表單欄位名稱"], ["rows / placeholder", "顯示行數與提示文字"]],
        select: [["name", "表單欄位名稱"], ["option", "選項顯示文字與 value"], ["value", "目前選取值"]],
        checkbox: [["name / value", "勾選後送出的欄位與值"], ["checked", "預設勾選狀態"]],
        switch: [["name / value", "開啟後送出的欄位與值"], ["checked", "預設開啟狀態"], ["disabled", "停用切換"]],
        radio: [["name", "同組選項使用相同名稱"], ["value", "選項送出的值"]],
        button: [["type", "submit 提交表單；button 觸發前端動作"], ["style", "按鈕配色"]],
        "tag-input": [["data-ui-tag-input-control", "標籤輸入控制區，請保留此屬性"], ["data-ui-tag-input-tags", "顯示目前標籤的容器，請保留此屬性"], ["data-ui-tag-input-input", "輸入文字後按 Enter 建立自訂標籤"], ["name + multiple", "表單實際送出的 tag 欄位；ASP.NET Core 可用 Request.Form[\"tags\"].ToArray() 取得"], ["data-ui-tag-input-values", "隱藏的資料 select，請保留；元件會在這裡同步自訂 tag"]],
        "tag-select": [["data-ui-tag-select-control", "標籤選擇控制區，請保留此屬性"], ["data-ui-tag-select-tags", "顯示目前標籤的容器，請保留此屬性"], ["data-ui-tag-select-menu", "使用者操作的既有項目選單"], ["name + multiple", "表單實際送出的選取欄位；ASP.NET Core 可用 Request.Form[\"skills\"].ToArray() 取得"], ["data-ui-tag-select-values", "隱藏的資料 select，請保留；元件會在這裡同步已選項目"]],
        "file-upload": [["name", "檔案欄位名稱"], ["accept / data-ui-accept", "副檔名或 MIME 類型限制；兩者應保持一致"], ["data-ui-max-size", "單一檔案容量上限（MB）"], ["data-ui-file-dropzone", "拖放檔案區，請保留此屬性"], ["data-ui-file-browse", "觸發檔案選擇器的按鈕，請保留此屬性"], ["data-ui-file-input", "原生檔案 input 的初始化 hook，請保留此屬性"], ["data-ui-file-list", "顯示檔案與上傳進度的容器，請保留此屬性"], ["multiple", "允許選擇多個檔案"]],
        "file-download": [["data-ui-download-name", "顯示的檔名"], ["data-ui-download-url", "完成後的下載連結"], ["data-ui-download-start", "觸發下載效果的按鈕"], ["data-ui-download-success", "展示頁專用的成功效果示範按鈕"], ["data-ui-download-failure", "展示頁專用的失敗效果示範按鈕"]],
        "data-table": [["data-ui-data-table", "使用 true 啟用資料表排序、分頁與筆數控制"], ["data-ui-page-size", "預設每頁顯示筆數"], ["data-ui-page-size-options", "每頁筆數選項，例如 1,10,25,50"], ["data-ui-sortable", "外層使用 true／false 開關排序；標題 th 也可用 true／false 控制個別欄位"], ["data-ui-sort-type", "標題欄位排序型別，例如 number、date 或 text"], ["data-ui-sort-value", "指定與畫面文字不同的實際排序值"], ["data-ui-striped", "使用 true 顯示斑馬紋列，使用 false 關閉"], ["data-ui-hover", "使用 true 顯示滑入列高亮，使用 false 關閉"]],
        "date-picker": [["name", "表單欄位名稱"], ["data-ui-date-control=date", "啟用日期選擇器"], ["value", "YYYY/MM/DD 格式"]],
        "date-time-picker": [["name", "表單欄位名稱"], ["data-ui-date-control=datetime", "啟用日期與時間選擇器"], ["value", "YYYY/MM/DD HH:mm 格式"]],
        "time-picker": [["name", "表單欄位名稱"], ["data-ui-time-control", "啟用時間選擇器"], ["value", "HH:mm 格式"]],
        "date-range-picker": [["data-ui-end-for", "指定迄日欄位的 data-ui-for 值"], ["data-ui-range-start", "起日隱藏欄位"], ["data-ui-range-end", "迄日隱藏欄位"], ["name", "起日與迄日欄位名稱"]],
        breadcrumb: [["aria-label", "描述目前導覽位置"], ["data-ui-breadcrumb-separator", "選擇中間分隔圖示"], ["data-ui-breadcrumb-separator-icon", "分隔圖示的初始化 hook，請保留此屬性"], ["breadcrumb-item", "每一層的語意項目"], ["aria-current=page", "標示目前所在頁面"]]
    };    targets.forEach((target, index) => {
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
        if (["tag-input", "tag-select"].includes(target?.dataset.uiComponent)) return allowed.tagSelect;
        if (target?.dataset.uiComponent === "switch") return allowed.switch;
        if (target?.dataset.uiComponent === "radio") return allowed.radio;
        if (target?.dataset.uiComponent === "data-table") return allowed.table;
        if (target?.dataset.uiComponent === "breadcrumb") return allowed.breadcrumb;
        return allowed.field;
    };

    // 更新編輯器設定。
    function updateEditor() {
        const target = selected();
        const variables = variablesFor(target);
        const isUpload = target?.dataset.uiComponent === "file-upload";
        const isBreadcrumb = target?.dataset.uiComponent === "breadcrumb";
        if (uploadSettings) uploadSettings.hidden = !isUpload;
        if (breadcrumbSettings) breadcrumbSettings.hidden = !isBreadcrumb;
        if (isUpload) {
            uploadAccept.value = target.dataset.uiAccept || "";
            uploadMaxSize.value = target.dataset.uiMaxSize || "10";
        }
        if (isBreadcrumb && breadcrumbSeparator) {
            breadcrumbSeparator.value = target.dataset.uiBreadcrumbSeparator || "chevron-right";
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
        const separator = target.dataset.uiBreadcrumbSeparator || "chevron-right";
        const separatorIcon = window.UiComponentLibrary?.breadcrumbSeparatorIcons?.[separator] || "chevron-right";
        const cssVariables = variablesFor(target)
            .map(variable => {
                const configured = target.style.getPropertyValue(variable).trim();
                if (configured) return `${variable}:${configured}`;
                const input = colorInputs.find(candidate => candidate.dataset.uiColor === variable);
                const fallback = input?.value || input?.dataset.uiDefault || "";
                return fallback ? `${variable}:${fallback}` : "";
            })
            .filter(Boolean)
            .join(";");
        const style = cssVariables ? ` style="${cssVariables}"` : "";
        // 建立欄位程式碼。
        const field = (label, content, component = kind) => `<div class="ui-field" data-ui-component="${component}"${style}>\n  <label class="ui-label" for="${component}-value">${label}</label>\n  ${content}\n</div>`;
        const snippets = {
            "text-input": field("姓名", '<input class="ui-control" id="text-input-value" name="name" type="text" placeholder="請輸入姓名" autocomplete="name" />'),
            textarea: field("備註", '<textarea class="ui-control" id="textarea-value" name="notes" rows="3" placeholder="可選填"></textarea>'),
            select: field("國家", '<select class="ui-control" id="select-value" name="country">\n    <option value="TW">台灣</option>\n    <option value="JP">日本</option>\n  </select>'),
            "tag-input": `<div class="ui-field" data-ui-component="tag-input"${style}>\n  <label class="ui-label" for="tag-input-input">標籤</label>\n  <div class="ui-tag-input-control" data-ui-tag-input-control>\n    <div class="ui-tag-input-tags" data-ui-tag-input-tags></div>\n    <input class="ui-tag-input-input" id="tag-input-input" type="text" placeholder="輸入文字後按 Enter 新增" data-ui-tag-input-input autocomplete="off" />\n  </div>\n  <select class="ui-tag-input-values" name="tags" multiple data-ui-tag-input-values>\n    <!-- JavaScript 會將輸入的自訂 tag 加入此欄位；請保留以送出表單資料。 -->\n  </select>\n</div>`,
            "tag-select": `<div class="ui-field" data-ui-component="tag-select"${style}>\n  <label class="ui-label" for="tag-select-menu">技能</label>\n  <div class="ui-tag-select-control" data-ui-tag-select-control>\n    <div class="ui-tag-select-tags" data-ui-tag-select-tags></div>\n    <select class="ui-tag-select-menu" id="tag-select-menu" data-ui-tag-select-menu>\n      <option value="">選擇技能</option>\n      <option value="csharp">C#</option>\n      <option value="aspnet-core">ASP.NET Core</option>\n    </select>\n  </div>\n  <select class="ui-tag-select-values" name="skills" multiple data-ui-tag-select-values>\n    <!-- JavaScript 會將選取的項目加入此欄位；請保留以送出表單資料。 -->\n  </select>\n</div>`,
            checkbox: '<label class="ui-field"><input class="ui-check-control" name="emailUpdates" type="checkbox" value="true" /> 我想收到產品更新</label>',
            switch: `<div class="ui-switch" data-ui-component="switch"${style}>\n  <input class="ui-switch-input" id="notifications-switch" name="notifications" type="checkbox" value="true" />\n  <label class="ui-switch-track" for="notifications-switch" aria-label="切換產品更新通知"><span class="ui-switch-thumb" aria-hidden="true"><i class="bi bi-check-lg ui-switch-on-icon"></i><i class="bi bi-x-lg ui-switch-off-icon"></i></span></label>\n  <span class="ui-switch-state" aria-hidden="true"><span class="ui-switch-on-text">已開啟</span><span class="ui-switch-off-text">已關閉</span></span>\n</div>`,
            radio: '<div class="ui-field" role="group" aria-labelledby="preferred-contact-label">\n  <span class="ui-label" id="preferred-contact-label">偏好的聯絡方式</span>\n  <label class="ui-radio-option"><input class="ui-check-control" id="preferred-contact-email" name="preferredContact" type="radio" value="email" /> 電子郵件</label>\n  <label class="ui-radio-option"><input class="ui-check-control" id="preferred-contact-phone" name="preferredContact" type="radio" value="phone" /> 電話</label>\n</div>',
            button: `<button class="ui-button" type="button"${style}>送出表單</button>`,
            "file-upload": `<div class="ui-file-upload" data-ui-component="file-upload" data-ui-accept=".pdf,.doc,.docx" data-ui-max-size="10"${style}>\n  <label class="ui-label" for="attachment">附件</label>\n  <div class="ui-file-drop-zone" data-ui-file-dropzone tabindex="0" role="button">\n    <span class="ui-file-upload-icon" aria-hidden="true"><i class="bi bi-cloud-arrow-up"></i></span><strong>拖放檔案到這裡</strong><span class="ui-file-or">或</span><button class="ui-file-browse" type="button" data-ui-file-browse>瀏覽檔案</button><span class="ui-file-hint">支援 .pdf、.doc、.docx · 上限 10 MB</span>\n  </div>\n  <input class="ui-file-input" id="attachment" name="attachment" type="file" accept=".pdf,.doc,.docx" data-ui-file-input />\n  <div class="ui-file-list" data-ui-file-list aria-live="polite"></div>\n</div>`,
            "file-download": `<section class="ui-file-download" data-ui-component="file-download" data-ui-download-name="年度報告.pdf" data-ui-download-url="/files/annual-report.pdf"${style}>\n  <div class="ui-download-card"><div class="ui-download-file-icon" aria-hidden="true"><i class="bi bi-file-earmark-arrow-down"></i></div><div class="ui-download-copy"><strong>年度報告</strong><span>年度報告.pdf</span></div><div class="ui-download-actions"><button class="ui-button" type="button" data-ui-download-start><i class="bi bi-download" aria-hidden="true"></i>下載檔案</button></div></div>\n  <div class="ui-download-demo-actions"><span>效果示範</span><button type="button" class="btn btn-outline-success" data-ui-download-success>顯示成功</button><button type="button" class="btn btn-outline-danger" data-ui-download-failure>顯示失敗</button></div>\n</section>`,
            "data-table": `<div class="ui-data-table" data-ui-component="data-table" data-ui-data-table="true" data-ui-page-size="10" data-ui-page-size-options="1,10,25,50" data-ui-sortable="true" data-ui-striped="true" data-ui-hover="true"${style}>\n  <table class="ui-data-table-grid">\n    <thead><tr><th data-ui-sort-type="number">單位代號</th><th>單位</th><th data-ui-sort-type="number">員編</th><th>姓名</th><th>職稱</th><th data-ui-sortable="false">講師身份</th></tr></thead>\n    <tbody><tr><td>147</td><td>虎尾分行</td><td>067378</td><td>黃＊＊</td><td>高級襄理</td><td>是</td></tr></tbody>\n  </table>\n</div>`,
            breadcrumb: `<nav class="ui-breadcrumb" data-ui-component="breadcrumb" aria-label="目前位置"${style}>\n  <ol class="breadcrumb ui-breadcrumb-list">\n    <li class="breadcrumb-item ui-breadcrumb-item"><a class="ui-breadcrumb-link" href="/"><span class="ui-breadcrumb-home" aria-hidden="true"><i class="bi bi-house-door-fill"></i></span><span>首頁</span></a></li>\n    <li class="ui-breadcrumb-separator" aria-hidden="true"><i class="bi bi-chevron-right"></i></li>\n    <li class="breadcrumb-item ui-breadcrumb-item"><a class="ui-breadcrumb-link" href="/components"><span>元件</span></a></li>\n    <li class="ui-breadcrumb-separator" aria-hidden="true"><i class="bi bi-chevron-right"></i></li>\n    <li class="breadcrumb-item ui-breadcrumb-item"><span class="ui-breadcrumb-current" aria-current="page"><i class="bi bi-grid-1x2-fill" aria-hidden="true"></i><span>元件總覽</span></span></li>\n  </ol>\n</nav>`,
            "date-picker": field("日期", '<input class="ui-control ui-date-control" id="date-picker-value" name="selectedDate" type="text" readonly autocomplete="off" data-ui-date-control="date" placeholder="YYYY/MM/DD" />'),
            "date-time-picker": field("日期與時間", '<input class="ui-control ui-date-control" id="date-time-picker-value" name="selectedDateTime" type="text" readonly autocomplete="off" data-ui-date-control="datetime" placeholder="YYYY/MM/DD HH:mm" />'),
            "time-picker": field("時間", '<input class="ui-control ui-time-control" id="time-picker-value" name="selectedTime" type="text" readonly autocomplete="off" data-ui-time-control="true" placeholder="HH:mm" />'),
            "date-range-picker": `<div class="ui-field" data-ui-component="date-range-picker" data-ui-end-for="EndDate"${style}>\n  <label class="ui-label" for="date-range-value">住宿日期</label>\n  <input class="ui-control ui-date-control" id="date-range-value" type="text" readonly autocomplete="off" data-ui-date-control="range" placeholder="YYYY/MM/DD 至 YYYY/MM/DD" />\n  <input name="startDate" type="hidden" data-ui-range-start />\n  <input name="endDate" type="hidden" data-ui-range-end />\n</div>`
        };
        snippets.breadcrumb = snippets.breadcrumb
            .replace('data-ui-component="breadcrumb"', `data-ui-component="breadcrumb" data-ui-breadcrumb-separator="${separator}"`)
            .replaceAll('class="bi bi-chevron-right"', `class="bi bi-${separatorIcon}" data-ui-breadcrumb-separator-icon`);
        const themeSnippet = (snippet, component) => snippet.replace(
            '<label class="ui-field">',
            `<label class="ui-field" data-ui-component="${component}"${style}>`
        );
        const themeGroupSnippet = (snippet, component) => snippet.replace(
            '<div class="ui-field" role="group"',
            "<div class=\"ui-field\" data-ui-component=\"" + component + "\"" + style + " role=\"group\""
        );
        snippets.checkbox = themeSnippet(snippets.checkbox, "checkbox");
        snippets.radio = themeGroupSnippet(snippets.radio, "radio");
        formatCode(codeOutput, snippets[kind] || "");
    }

    // 顯示元件文件。
    function renderDoc(kind) {
        const doc = docs[kind];
        if (!doc || !componentDoc) return;
        docTitle.textContent = `${doc.title} 設定`;
        docSummary.textContent = doc.summary;
        formatCode(docRazor, codeOutput.textContent || "");
        const parameters = parameterNotes[kind] || [];
        const commonData = "<p><code>data-ui-component</code> 請保留並設定為目前元件類型，讓元件初始化與展示器正確辨識。展示頁預覽用的 <code>data-ui-for</code> 與 <code>data-ui-label</code> 僅供配色編輯器使用，複製到一般頁面時可省略。</p>";
        docData.innerHTML = `${doc.data}${commonData}<h4 class="h6 mt-3">參數對照</h4><dl class="ui-doc-parameters">${parameters.map(([name, description]) => `<dt><code>${name}</code></dt><dd>${description}</dd>`).join("")}</dl>`;
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

    breadcrumbSeparator?.addEventListener("change", () => {
        const target = selected();
        if (target?.dataset.uiComponent !== "breadcrumb") return;
        target.dataset.uiBreadcrumbSeparator = breadcrumbSeparator.value;
        window.UiComponentLibrary?.setBreadcrumbSeparator(target, breadcrumbSeparator.value);
        updateCode();
    });

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
    const separatorIcons = Object.freeze({
        "chevron-right": "chevron-right",
        "arrow-right": "arrow-right",
        "caret-right-fill": "caret-right-fill",
        "slash-lg": "slash-lg",
        "dash-lg": "dash-lg"
    });
    const setBreadcrumbSeparator = (breadcrumb, value) => {
        if (!breadcrumb) return;
        const separator = separatorIcons[value] ? value : "chevron-right";
        breadcrumb.dataset.uiBreadcrumbSeparator = separator;
        breadcrumb.querySelectorAll("[data-ui-breadcrumb-separator-icon], .ui-breadcrumb-separator > .bi").forEach(icon => {
            icon.className = `bi bi-${separatorIcons[separator]}`;
        });
    };
    window.UiComponentLibrary = window.UiComponentLibrary || {};
    window.UiComponentLibrary.breadcrumbSeparatorIcons = separatorIcons;
    window.UiComponentLibrary.setBreadcrumbSeparator = setBreadcrumbSeparator;
    document.querySelectorAll("[data-ui-component='breadcrumb']").forEach(breadcrumb => {
        if (breadcrumb.dataset.uiBreadcrumbSeparator) setBreadcrumbSeparator(breadcrumb, breadcrumb.dataset.uiBreadcrumbSeparator);
    });
})();

(() => {
    const tagInputs = [...document.querySelectorAll("[data-ui-component='tag-input']")];
    if (!tagInputs.length) return;

    tagInputs.forEach(tagInput => {
        const input = tagInput.querySelector("[data-ui-tag-input-input]");
        const values = tagInput.querySelector("[data-ui-tag-input-values]");
        const tags = tagInput.querySelector("[data-ui-tag-input-tags]");
        const control = tagInput.querySelector("[data-ui-tag-input-control]");
        const selected = () => [...values.options].filter(option => option.selected);
        const optionFor = value => [...values.options].find(option => option.value === value);

        function render() {
            tags.replaceChildren();
            selected().forEach(option => {
                const tag = document.createElement("span");
                tag.className = "ui-tag-input-tag";
                const text = document.createElement("span");
                text.textContent = option.text;
                const remove = document.createElement("button");
                remove.type = "button";
                remove.className = "ui-tag-input-remove";
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
        }

        input?.addEventListener("keydown", event => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            const value = input.value.trim();
            if (!value || optionFor(value)) {
                input.value = "";
                return;
            }
            values.add(new Option(value, value, false, true));
            render();
            values.dispatchEvent(new Event("change", { bubbles: true }));
            input.value = "";
        });
        control?.addEventListener("click", event => {
            if (!event.target.closest("button, input")) input?.focus();
        });
        render();
    });
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
            const menuOption = [...menu.options].find(option => option.value === menu.value);
            let option = optionFor(menu.value);
            if (!option) {
                option = new Option(menuOption?.text || menu.value, menu.value, false, true);
                values.add(option);
            } else {
                option.selected = true;
            }
            menu.value = "";
            render();
            values.dispatchEvent(new Event("change", { bubbles: true }));
        });
        control.addEventListener("click", event => {
            if (!event.target.closest("button, select")) menu?.focus();
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
    function copyTheme() {
        const computed = getComputedStyle(active);
        dialog.style.setProperty("--ui-download-progress-color", computed.getPropertyValue("--ui-download-progress-color").trim());
    }

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
        copyTheme();
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
        download.querySelector("[data-ui-download-success]")?.addEventListener("click", () => { active = download; open("success"); });
        download.querySelector("[data-ui-download-failure]")?.addEventListener("click", () => { active = download; open("failure"); });
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

    // 轉為內部使用的 ISO 日期。
    const iso = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    // 轉為日期欄位的顯示格式。
    const displayDate = date => iso(date).replace(/-/g, "/");
    // 解析日期欄位，並相容舊的 ISO 日期格式。
    const parse = value => {
        const normalized = String(value || "").replace(/\//g, "-");
        return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? new Date(`${normalized}T12:00:00`) : null;
    };
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
                state.control.value = `${displayDate(state.start)} 至 ${displayDate(state.end)}`;
            } else if (state.selected) {
                state.control.value = state.mode === "datetime" ? `${displayDate(state.selected)} ${state.time}` : displayDate(state.selected);
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
            const uploadIcon = document.createElement("i");
            uploadIcon.className = "bi bi-cloud-arrow-up";
            uploadIcon.setAttribute("aria-hidden", "true");
            icon.append(uploadIcon);
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

(() => {
  const components = [...document.querySelectorAll("[data-ui-data-table]")];
  if (!components.length) return;

  // 解析每頁筆數選項。
  const parsePageSizes = value => [...new Set(String(value || "10").split(",").map(Number).filter(number => number > 0))].sort((left, right) => left - right);

  // 將文字轉成排序值。
  const cellValue = (row, index) => row.cells[index]?.dataset.uiSortValue ?? row.cells[index]?.textContent?.trim() ?? "";

  // 依欄位型別比較資料。
  const compareCells = (left, right, type) => {
    if (type === "number") return (Number(left.replaceAll(",", "")) || 0) - (Number(right.replaceAll(",", "")) || 0);
    if (type === "date") return (Date.parse(left) || 0) - (Date.parse(right) || 0);
    return left.localeCompare(right, "zh-Hant", { numeric: true, sensitivity: "base" });
  };

  // 建立資料表分頁按鈕。
  const pageButton = (label, page, active = false) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `ui-data-table-page-button${active ? " is-active" : ""}`;
    button.textContent = label;
    button.dataset.uiPage = String(page);
    if (active) button.setAttribute("aria-current", "page");
    return button;
  };

  // 建立頁碼範圍。
  const pageRange = (current, total) => {
    if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
    const values = [1];
    if (current > 3) values.push("…");
    for (let page = Math.max(2, current - 1); page <= Math.min(total - 1, current + 1); page += 1) values.push(page);
    if (current < total - 2) values.push("…");
    values.push(total);
    return values;
  };

  components.forEach(component => {
    if (component.dataset.uiDataTableReady === "true") return;
    const table = component.querySelector("table");
    const body = table?.tBodies[0];
    if (!table || !body) return;
    component.dataset.uiDataTableReady = "true";
    table.classList.add("ui-data-table-grid");
    const tableWrap = document.createElement("div");
    tableWrap.className = "ui-data-table-grid-wrap";
    table.parentElement?.insertBefore(tableWrap, table);
    tableWrap.append(table);

    const rows = [...body.rows];
    const headers = [...(table.tHead?.rows[0]?.cells ?? [])];
    const state = {
      page: 1,
      pageSize: Number(component.dataset.uiPageSize) || 10,
      sortIndex: null,
      sortDirection: 1
    };
    const pageSizes = parsePageSizes(component.dataset.uiPageSizeOptions);
    if (!pageSizes.includes(state.pageSize)) pageSizes.push(state.pageSize);
    pageSizes.sort((left, right) => left - right);

    // 更新排序按鈕狀態。
    function updateSortState() {
      headers.forEach(header => {
        const button = header.querySelector(".ui-data-table-sort-button");
        if (!button) return;
        const active = Number(button.dataset.uiSortIndex) === state.sortIndex;
        button.setAttribute("aria-sort", active ? (state.sortDirection === 1 ? "ascending" : "descending") : "none");
        const icon = button.querySelector(".ui-data-table-sort-icon");
        if (icon) icon.textContent = active ? (state.sortDirection === 1 ? "▲" : "▼") : "↕";
      });
    }

    // 取得排序後的資料列。
    function sortedRows() {
      const sorted = [...rows];
      if (state.sortIndex === null) return sorted;
      const header = headers[state.sortIndex];
      const type = header?.dataset.uiSortType || "text";
      return sorted.sort((left, right) => state.sortDirection * compareCells(cellValue(left, state.sortIndex), cellValue(right, state.sortIndex), type));
    }

    // 建立排序表頭。
    function prepareHeader(header, index) {
      const enabled = component.dataset.uiSortable !== "false" && header.dataset.uiSortable !== "false";
      if (!enabled || header.querySelector(".ui-data-table-sort-button")) return;
      const label = header.textContent.trim();
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ui-data-table-sort-button";
      button.dataset.uiSortIndex = String(index);
      button.setAttribute("aria-sort", "none");
      button.setAttribute("aria-label", `依${label}排序`);
      const text = document.createElement("span");
      text.className = "ui-data-table-sort-label";
      text.textContent = label;
      const icon = document.createElement("span");
      icon.className = "ui-data-table-sort-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "↕";
      button.append(text, icon);
      header.replaceChildren(button);
      button.addEventListener("click", () => {
        if (state.sortIndex === index) state.sortDirection *= -1;
        else { state.sortIndex = index; state.sortDirection = 1; }
        state.page = 1;
        render();
      });
    }

    // 繪製資料表內容與分頁。
    function render() {
      const orderedRows = sortedRows();
      const totalPages = Math.max(1, Math.ceil(orderedRows.length / state.pageSize));
      state.page = Math.min(state.page, totalPages);
      const start = (state.page - 1) * state.pageSize;
      const visibleRows = orderedRows.slice(start, start + state.pageSize);
      body.replaceChildren(...visibleRows);
      if (!visibleRows.length) {
        const emptyRow = document.createElement("tr");
        const emptyCell = document.createElement("td");
        emptyCell.className = "ui-data-table-empty";
        emptyCell.colSpan = Math.max(1, headers.length);
        emptyCell.textContent = "目前沒有資料";
        emptyRow.append(emptyCell);
        body.append(emptyRow);
      }
      updateSortState();
      summary.textContent = orderedRows.length ? `顯示 ${start + 1}–${Math.min(start + state.pageSize, orderedRows.length)} 筆，共 ${orderedRows.length} 筆` : "目前沒有資料";
      previous.disabled = state.page <= 1;
      next.disabled = state.page >= totalPages;
      pagination.replaceChildren(previous);
      pageRange(state.page, totalPages).forEach(page => {
        if (page === "…") {
          const ellipsis = document.createElement("span");
          ellipsis.className = "ui-data-table-page-ellipsis";
          ellipsis.textContent = page;
          pagination.append(ellipsis);
          return;
        }
        const button = pageButton(String(page), page, page === state.page);
        button.addEventListener("click", () => { state.page = page; render(); });
        pagination.append(button);
      });
      pagination.append(next);
    }

    headers.forEach(prepareHeader);
    const footer = document.createElement("div");
    footer.className = "ui-data-table-footer";
    const pageSizeControl = document.createElement("label");
    pageSizeControl.className = "ui-data-table-page-size";
    const pageSizeSelect = document.createElement("select");
    pageSizeSelect.setAttribute("aria-label", "每頁顯示筆數");
    pageSizes.forEach(size => {
      const option = document.createElement("option");
      option.value = String(size);
      option.textContent = String(size);
      option.selected = size === state.pageSize;
      pageSizeSelect.append(option);
    });
    const pageSizeLabel = document.createElement("span");
    pageSizeLabel.textContent = component.dataset.uiPageSizeLabel || "筆／頁";
    pageSizeControl.append(pageSizeSelect, pageSizeLabel);
    const summary = document.createElement("span");
    summary.className = "ui-data-table-summary";
    const pagination = document.createElement("nav");
    pagination.className = "ui-data-table-pagination";
    pagination.setAttribute("aria-label", component.dataset.uiPaginationLabel || "資料表分頁");
    const previous = pageButton("<", 0);
    previous.setAttribute("aria-label", "上一頁");
    const next = pageButton(">", 0);
    next.setAttribute("aria-label", "下一頁");
    previous.addEventListener("click", () => { state.page -= 1; render(); });
    next.addEventListener("click", () => { state.page += 1; render(); });
    pagination.prepend(previous);
    pagination.append(next);
    pageSizeSelect.addEventListener("change", () => { state.pageSize = Number(pageSizeSelect.value); state.page = 1; render(); });
    footer.append(pageSizeControl, summary, pagination);
    component.append(footer);
    render();
  });
})();
