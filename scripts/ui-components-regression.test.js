const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

class FakeElement {
    constructor(tagName = "div", dataset = {}, selectors = {}) {
        this.tagName = tagName.toUpperCase();
        this.dataset = { ...dataset };
        this.selectors = selectors;
        this.children = [];
        this.parentElement = null;
        this.listeners = new Map();
        this.attributes = new Map();
        this.className = "";
        this.textContent = "";
        this.innerHTML = "";
        this.value = "";
        this.disabled = false;
        this.hidden = false;
        this.open = false;
        this.files = [];
        const styleValues = new Map();
        this.style = {
            setProperty: (name, value) => styleValues.set(name, String(value)),
            getPropertyValue: name => styleValues.get(name) ?? ""
        };
        this.classList = {
            add: (...tokens) => this.setClasses(tokens, true),
            remove: (...tokens) => this.setClasses(tokens, false),
            replace: (oldToken, newToken) => {
                this.setClasses([oldToken], false);
                this.setClasses([newToken], true);
            },
            toggle: (token, force) => {
                const present = this.classList.contains(token);
                const next = force === undefined ? !present : force;
                this.setClasses([token], next);
                return next;
            },
            contains: token => this.className.split(/\s+/).includes(token)
        };
    }

    setClasses(tokens, add) {
        const current = new Set(this.className.split(/\s+/).filter(Boolean));
        tokens.forEach(token => add ? current.add(token) : current.delete(token));
        this.className = [...current].join(" ");
    }

    addEventListener(type, handler) {
        this.listeners.set(type, handler);
    }

    dispatchEvent(event) {
        this.listeners.get(event.type)?.(event);
    }

    append(...nodes) {
        nodes.flat().filter(Boolean).forEach(node => {
            this.children.push(node);
            node.parentElement = this;
        });
    }

    appendChild(node) {
        this.append(node);
        return node;
    }

    prepend(...nodes) {
        const filtered = nodes.flat().filter(Boolean);
        filtered.forEach(node => { node.parentElement = this; });
        this.children.unshift(...filtered);
    }

    insertBefore(node, reference) {
        const index = this.children.indexOf(reference);
        if (index < 0) this.append(node);
        else {
            this.children.splice(index, 0, node);
            node.parentElement = this;
        }
    }

    replaceChildren(...nodes) {
        this.children.forEach(child => { child.parentElement = null; });
        this.children = [];
        this.append(...nodes);
    }

    remove() {
        this.parentElement?.children.splice(this.parentElement.children.indexOf(this), 1);
        this.parentElement = null;
    }

    setAttribute(name, value) {
        this.attributes.set(name, String(value));
    }

    insertAdjacentHTML() {}

    querySelector(selector) {
        if (Object.prototype.hasOwnProperty.call(this.selectors, selector)) return this.selectors[selector];
        return this.find(node => node.matches(selector));
    }

    querySelectorAll(selector) {
        if (Object.prototype.hasOwnProperty.call(this.selectors, selector)) return this.selectors[selector] ?? [];
        const matches = [];
        this.walk(node => { if (node.matches(selector)) matches.push(node); });
        return matches;
    }

    walk(callback) {
        this.children.forEach(child => {
            callback(child);
            child.walk(callback);
        });
    }

    find(predicate) {
        let result = null;
        this.walk(node => { if (!result && predicate(node)) result = node; });
        return result;
    }

    closest(selector) {
        let node = this;
        while (node) {
            if (node.matches(selector)) return node;
            node = node.parentElement;
        }
        return null;
    }

    matches(selector) {
        if (selector.includes(",")) return selector.split(",").some(part => this.matches(part.trim()));
        if (selector.startsWith(".")) return this.classList.contains(selector.slice(1));
        const attribute = selector.match(/^\[([^=\]]+)(?:=['"]?([^'\"]+)['"]?)?\]$/);
        if (attribute) {
            const key = attribute[1].replace(/^data-([a-z])/, (_, first) => first.toLowerCase()).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
            return Object.prototype.hasOwnProperty.call(this.dataset, key) && (attribute[2] === undefined || String(this.dataset[key]) === attribute[2]);
        }
        return this.tagName.toLowerCase() === selector.toLowerCase();
    }

    get rows() {
        return this.children.filter(child => child.tagName === "TR");
    }

    get options() {
        return this.children.filter(child => child.tagName === "OPTION");
    }

    add(option) {
        this.append(option);
    }

    get cells() {
        return this.children.filter(child => ["TD", "TH"].includes(child.tagName));
    }

    showModal() { this.open = true; }
    close() { this.open = false; }
}

class FakeEvent {
    constructor(type, init = {}) {
        this.type = type;
        Object.assign(this, init);
    }
}

function makeFixtures() {
    const makeTarget = (component, forName, styleValues = {}) => {
        const target = new FakeElement("div", { uiComponent: component, uiFor: forName });
        Object.entries(styleValues).forEach(([name, value]) => target.style.setProperty(name, value));
        return target;
    };
    const textTarget = makeTarget("text-input", "Name");
    const checkboxTarget = makeTarget("checkbox", "EmailUpdates", { "--ui-focus-color": "#ea580c" });
    const radioTarget = makeTarget("radio", "PreferredContact", { "--ui-focus-color": "#2563eb" });
    const secondRadioTarget = makeTarget("radio", "PreferredContact", { "--ui-focus-color": "#2563eb" });
    const breadcrumbIconOne = new FakeElement("i", { uiBreadcrumbSeparatorIcon: "" });
    breadcrumbIconOne.className = "bi bi-chevron-right";
    const breadcrumbIconTwo = new FakeElement("i", { uiBreadcrumbSeparatorIcon: "" });
    breadcrumbIconTwo.className = "bi bi-chevron-right";
    const breadcrumb = makeTarget("breadcrumb", "", {});
    breadcrumb.dataset.uiBreadcrumbSeparator = "chevron-right";
    breadcrumb.selectors["[data-ui-breadcrumb-separator-icon], .ui-breadcrumb-separator > .bi"] = [breadcrumbIconOne, breadcrumbIconTwo];
    const targets = [textTarget, checkboxTarget, radioTarget, secondRadioTarget, breadcrumb];

    const codeOutput = new FakeElement("code", { uiGeneratedCode: "" });
    const copyButton = new FakeElement("button", { uiCopy: "" });
    const colorInputs = [
        ["--ui-border-color", "#ced4da"],
        ["--ui-focus-color", "#86b7fe"],
        ["--ui-text-color", "#212529"],
        ["--ui-background-color", "#ffffff"]
    ].map(([variable, defaultValue]) => new FakeElement("input", { uiColor: variable, uiDefault: defaultValue }));
    const colorRows = colorInputs.map(input => {
        const row = new FakeElement("div", { uiColorRow: "" });
        row.append(input);
        return row;
    });
    const colorInput = colorInputs.find(input => input.dataset.uiColor === "--ui-focus-color");
    const colorControls = new FakeElement("div");
    colorControls.className = "ui-color-controls";
    colorControls.append(colorRows);
    const editor = new FakeElement("section", { uiThemeEditor: "" }, {
        "[data-ui-generated-code]": codeOutput,
        "[data-ui-color]": colorInputs,
        "[data-ui-color-row]": colorRows,
        "[data-ui-copy]": copyButton,
        ".ui-color-controls": [colorControls]
    });
    editor.append(colorControls);

    const guideButton = new FakeElement("button", { uiShowGuide: "" });
    const guide = new FakeElement("section", { uiGeneralGuide: "" });
    const previewSection = new FakeElement("section", { uiPreviewSection: "" });
    const componentDoc = new FakeElement("section", { uiComponentDoc: "" });
    const docTitle = new FakeElement("h2");
    const docSummary = new FakeElement("p");
    const docRazor = new FakeElement("code", { uiDocRazor: "" });
    const docData = new FakeElement("div", { uiDocData: "" });
    const previewTitle = new FakeElement("h2");
    const checkboxNav = new FakeElement("button", { uiShowKind: "checkbox" });
    const radioNav = new FakeElement("button", { uiShowKind: "radio" });
    const breadcrumbNav = new FakeElement("button", { uiShowKind: "breadcrumb" });
    const navButtons = [checkboxNav, radioNav, breadcrumbNav];
    const breadcrumbSettings = new FakeElement("div", { uiBreadcrumbSettings: "" });
    const breadcrumbSeparator = new FakeElement("select", { uiBreadcrumbSeparator: "" });
    breadcrumbSeparator.value = "chevron-right";

    const downloadStart = new FakeElement("button", { uiDownloadStart: "" });
    const download = new FakeElement("section", { uiComponent: "file-download" }, {
        "[data-ui-download-start]": downloadStart,
        "[data-ui-download-success]": null,
        "[data-ui-download-failure]": null
    });
    download.style.setProperty("--ui-download-progress-color", "#c026d3");

    const dateControls = ["date", "datetime", "range"].map(mode => {
        const control = new FakeElement("input", { uiDateControl: mode });
        const wrapper = new FakeElement("div", { uiComponent: `${mode}-picker` });
        wrapper.append(control);
        return control;
    });

    const timeControl = new FakeElement("input", { uiTimeControl: "true" });
    const timeWrapper = new FakeElement("div", { uiComponent: "time-picker" });
    timeWrapper.append(timeControl);

    const tagInputText = new FakeElement("input", { uiTagInputInput: "" });
    const tagInputTags = new FakeElement("div", { uiTagInputTags: "" });
    const tagInputValues = new FakeElement("select", { uiTagInputValues: "" });
    const existingTag = new FakeElement("option");
    existingTag.value = "existing";
    existingTag.text = "Existing";
    existingTag.selected = false;
    tagInputValues.append(existingTag);
    const tagInputControl = new FakeElement("div", { uiTagInputControl: "" });
    tagInputControl.append(tagInputTags, tagInputText);
    const tagInput = new FakeElement("div", { uiComponent: "tag-input" }, {
        "[data-ui-tag-input-input]": tagInputText,
        "[data-ui-tag-input-tags]": tagInputTags,
        "[data-ui-tag-input-values]": tagInputValues,
        "[data-ui-tag-input-control]": tagInputControl
    });

    const tagSelectMenu = new FakeElement("select", { uiTagSelectMenu: "" });
    const tagSelectPlaceholder = new FakeElement("option");
    tagSelectPlaceholder.value = "";
    tagSelectPlaceholder.text = "選擇技能";
    const tagSelectCsharp = new FakeElement("option");
    tagSelectCsharp.value = "csharp";
    tagSelectCsharp.text = "C#";
    const tagSelectAspNetCore = new FakeElement("option");
    tagSelectAspNetCore.value = "aspnet-core";
    tagSelectAspNetCore.text = "ASP.NET Core";
    tagSelectMenu.append(tagSelectPlaceholder, tagSelectCsharp, tagSelectAspNetCore);
    const tagSelectTags = new FakeElement("div", { uiTagSelectTags: "" });
    const tagSelectValues = new FakeElement("select", { uiTagSelectValues: "" });
    const tagSelectControl = new FakeElement("div", { uiTagSelectControl: "" });
    tagSelectControl.append(tagSelectTags, tagSelectMenu);
    const tagSelect = new FakeElement("div", { uiComponent: "tag-select" }, {
        "[data-ui-tag-select-menu]": tagSelectMenu,
        "[data-ui-tag-select-tags]": tagSelectTags,
        "[data-ui-tag-select-values]": tagSelectValues,
        "[data-ui-tag-select-control]": tagSelectControl
    });

    const uploadInput = new FakeElement("input", { uiFileInput: "" });
    uploadInput.accept = ".txt";
    const uploadDropZone = new FakeElement("div", { uiFileDropzone: "" });
    const uploadBrowse = new FakeElement("button", { uiFileBrowse: "" });
    const uploadList = new FakeElement("div", { uiFileList: "" });
    const upload = new FakeElement("div", { uiComponent: "file-upload", uiMaxSize: "10" }, {
        "[data-ui-file-input]": uploadInput,
        "[data-ui-file-dropzone]": uploadDropZone,
        "[data-ui-file-browse]": uploadBrowse,
        "[data-ui-file-list]": uploadList
    });

    const tableBody = new FakeElement("tbody");
    const rows = ["001", "002"].map(value => {
        const row = new FakeElement("tr");
        row.append(new FakeElement("td", { uiSortValue: value }));
        return row;
    });
    tableBody.append(...rows);
    const headerRow = new FakeElement("tr");
    headerRow.append(new FakeElement("th", { uiSortType: "number" }), new FakeElement("th"));
    const table = new FakeElement("table");
    table.tBodies = [tableBody];
    table.tHead = { rows: [headerRow] };
    const tableContainer = new FakeElement("div");
    tableContainer.append(table);
    const tableComponent = new FakeElement("div", {
        uiDataTable: "true",
        uiSortable: "true",
        uiPageSize: "10",
        uiPageSizeOptions: "10,25,50"
    }, { table });
    tableComponent.append(tableContainer);

    const selectorMap = new Map([
        ["[data-ui-component='file-download']", [download]],
        ["[data-ui-component='tag-input']", [tagInput]],
        ["[data-ui-component='tag-select']", [tagSelect]],
        ["[data-ui-premium-time-control]", []],
        ["[data-ui-date-control]", dateControls],
        ["[data-ui-component='file-upload']", [upload]],
        ["[data-ui-component='breadcrumb']", [breadcrumb]],
        ["[data-ui-time-control]", [timeControl]],
        ["[data-ui-data-table]", [tableComponent]]
    ]);

    const queryMap = new Map([
        ["[data-ui-theme-editor]", editor],
        ["[data-ui-show-guide]", guideButton],
        ["[data-ui-general-guide]", guide],
        ["[data-ui-preview-section]", previewSection],
        ["[data-ui-component-doc]", componentDoc],
        ["#component-doc-title", docTitle],
        ["[data-ui-doc-summary]", docSummary],
        ["[data-ui-doc-razor]", docRazor],
        ["[data-ui-doc-data]", docData],
        ["#component-preview-title", previewTitle],
        ["[data-ui-breadcrumb-settings]", breadcrumbSettings],
        ["[data-ui-breadcrumb-separator]", breadcrumbSeparator]
    ]);
    const document = {
        body: new FakeElement("body"),
        querySelector: selector => queryMap.get(selector) ?? null,
        querySelectorAll: selector => selector === "[data-ui-component]" ? targets : selector === "[data-ui-show-kind]" ? navButtons : selectorMap.get(selector) ?? [],
        createElement: tagName => new FakeElement(tagName),
        addEventListener: () => {}
    };
    const window = {
        location: { origin: "http://localhost" },
        clearInterval: () => {},
        setInterval: () => 1,
        clearTimeout: () => {},
        setTimeout: callback => callback()
    };
    return { document, window, downloadStart, download, dateControls, timeControl, tagInputText, tagInputValues, tagSelectMenu, tagSelectValues, tagSelectTags, uploadInput, uploadDropZone, tableComponent, colorInput, codeOutput, checkboxNav, radioNav, breadcrumbNav, breadcrumb, breadcrumbIconOne, breadcrumbIconTwo, breadcrumbSeparator, checkboxTarget, radioTarget, secondRadioTarget };
}

const source = fs.readFileSync("standalone/ui-components.js", "utf8");
const styles = fs.readFileSync("standalone/ui-components.css", "utf8");
const iconStyles = fs.readFileSync("standalone/bootstrap-icons/font/bootstrap-icons.min.css", "utf8");
const showcaseStyles = fs.readFileSync("UiComponentLibrary/wwwroot/css/showcase.css", "utf8");
const showcaseMarkup = fs.readFileSync("UiComponentLibrary/Views/Home/Index.cshtml", "utf8");
const fixtures = makeFixtures();
let thrown = null;
try {
    vm.runInNewContext(source, {
        document: fixtures.document,
        window: fixtures.window,
        Event: FakeEvent,
        Option: function Option(text, value, _defaultSelected, selected) {
            const option = new FakeElement("option");
            option.text = text;
            option.value = value;
            option.selected = Boolean(selected);
            return option;
        },
        URL,
         getComputedStyle: element => ({ getPropertyValue: name => element.style.getPropertyValue(name) }),
        console
    }, { filename: "standalone/ui-components.js" });
} catch (error) {
    thrown = error;
}

assert.equal(thrown, null, `ui-components.js initialization threw: ${thrown?.message}`);
const generatedCode = () => fixtures.codeOutput.children.map(child => child.textContent).join("");
fixtures.checkboxNav.dispatchEvent(new FakeEvent("click"));
assert.match(generatedCode(), /--ui-border-color:#ced4da/, "checkbox copy HTML omitted an available default theme setting");
fixtures.colorInput.value = "#123456";
fixtures.colorInput.dispatchEvent(new FakeEvent("input"));
assert.equal(fixtures.checkboxTarget.style.getPropertyValue("--ui-focus-color"), "#123456", "checkbox preview did not receive the selected theme");
assert.match(generatedCode(), /data-ui-component="checkbox"[\s\S]*style="[^"]*--ui-focus-color:#123456/, "checkbox copy HTML did not receive the selected theme");
fixtures.radioNav.dispatchEvent(new FakeEvent("click"));
fixtures.colorInput.value = "#0f766e";
fixtures.colorInput.dispatchEvent(new FakeEvent("input"));
assert.equal(fixtures.radioTarget.style.getPropertyValue("--ui-focus-color"), "#0f766e", "radio preview did not receive the selected theme");
assert.equal(fixtures.secondRadioTarget.style.getPropertyValue("--ui-focus-color"), "#0f766e", "radio group did not receive the selected theme");
assert.match(generatedCode(), /data-ui-component="radio"[\s\S]*style="[^"]*--ui-focus-color:#0f766e/, "radio copy HTML did not receive the selected theme");
fixtures.breadcrumbNav.dispatchEvent(new FakeEvent("click"));
assert.equal(fixtures.breadcrumbSeparator.value, "chevron-right", "breadcrumb separator selector did not load its default value");
fixtures.breadcrumbSeparator.value = "slash-lg";
fixtures.breadcrumbSeparator.dispatchEvent(new FakeEvent("change"));
assert.equal(fixtures.breadcrumb.dataset.uiBreadcrumbSeparator, "slash-lg", "breadcrumb preview did not receive the selected separator");
assert.equal(fixtures.breadcrumbIconOne.className, "bi bi-slash-lg", "breadcrumb preview icon did not update");
assert.match(generatedCode(), /data-ui-breadcrumb-separator="slash-lg"/, "breadcrumb copy HTML omitted the selected separator");
assert.match(generatedCode(), /bi bi-slash-lg/, "breadcrumb copy HTML omitted the selected separator icon");
fixtures.downloadStart.dispatchEvent(new FakeEvent("click"));
const downloadDialog = fixtures.document.body.children.find(child => child.className.startsWith("ui-download-dialog"));
assert.equal(downloadDialog?.style.getPropertyValue("--ui-download-progress-color"), "#c026d3", "download dialog did not receive the selected progress color");
assert.ok(fixtures.downloadStart.listeners.has("click"), "download start interaction was not initialized");
fixtures.dateControls.forEach(control => assert.ok(control.listeners.has("click"), `${control.dataset.uiDateControl} picker interaction was not initialized`));
assert.ok(fixtures.timeControl.listeners.has("click"), "time picker interaction was not initialized");
const dateDialog = fixtures.document.body.children.find(child => child.className === "ui-date-dialog");
fixtures.dateControls[0].value = "2026-08-20";
fixtures.dateControls[0].dispatchEvent(new FakeEvent("click"));
dateDialog.dispatchEvent(new FakeEvent("click", { target: new FakeElement("button", { uiDateConfirm: "" }) }));
assert.equal(fixtures.dateControls[0].value, "2026/08/20", "date picker did not use the default slash display format");
fixtures.dateControls[1].value = "2026/08/20 09:30";
fixtures.dateControls[1].dispatchEvent(new FakeEvent("click"));
dateDialog.dispatchEvent(new FakeEvent("click", { target: new FakeElement("button", { uiDateConfirm: "" }) }));
assert.equal(fixtures.dateControls[1].value, "2026/08/20 09:30", "date-time picker did not use the default slash display format");
assert.ok(fixtures.tagInputText.listeners.has("keydown"), "tag input Enter interaction was not initialized");
fixtures.tagInputText.value = "custom-tag";
fixtures.tagInputText.dispatchEvent(new FakeEvent("keydown", { key: "Enter", preventDefault: () => {} }));
assert.ok(fixtures.tagInputValues.options.some(option => option.value === "custom-tag" && option.selected), "tag input Enter did not create a selected tag");
fixtures.tagSelectMenu.value = "csharp";
fixtures.tagSelectMenu.dispatchEvent(new FakeEvent("change"));
assert.ok(fixtures.tagSelectValues.options.some(option => option.value === "csharp" && option.selected), "tag select did not sync the selected menu value");
assert.equal(fixtures.tagSelectTags.children[0]?.children[0]?.textContent, "C#", "tag select did not render the selected tag label");
assert.ok(fixtures.uploadInput.listeners.has("change"), "file upload interaction was not initialized");
assert.ok(fixtures.uploadDropZone.listeners.has("drop"), "file drop interaction was not initialized");
const tableHeader = fixtures.tableComponent.querySelector("table").tHead.rows[0].cells[0];
assert.ok(tableHeader.querySelector(".ui-data-table-sort-button")?.listeners.has("click"), "data table sorting was not initialized");
const tablePagination = fixtures.tableComponent.querySelector(".ui-data-table-pagination");
assert.ok(tablePagination, "data table pagination was not initialized");
assert.equal(tablePagination.children[0]?.textContent, "<", "data table previous-page button is missing");
assert.equal(tablePagination.children.at(-1)?.textContent, ">", "data table next-page button is missing");
assert.ok(tablePagination.children[0]?.listeners.has("click"), "data table previous-page interaction was not initialized");
assert.ok(tablePagination.children.at(-1)?.listeners.has("click"), "data table next-page interaction was not initialized");
assert.match(source, /"data-table": \[\[[\s\S]*data-ui-sortable[\s\S]*true[\s\S]*false/, "data table parameter notes do not explain data-ui-sortable true and false");
assert.match(source, /"data-table": \[\[[\s\S]*data-ui-data-table[\s\S]*data-ui-striped[\s\S]*data-ui-hover/, "data table parameter notes are missing table behavior attributes");
assert.match(source, /"data-table":\s*`[^`]*data-ui-striped="true"[^`]*data-ui-hover="true"/, "data table generated HTML is missing striped or hover settings");
const parameterNotesBlock = source.match(/const parameterNotes = \{([\s\S]*?)\n\s*\};/)?.[1] ?? "";
 ["data-ui-tag-input-control", "data-ui-tag-select-control", "data-ui-accept", "data-ui-file-dropzone", "data-ui-download-success", "data-ui-download-failure", "data-ui-sort-value", "data-ui-end-for", "data-ui-breadcrumb-separator-icon"].forEach(attribute => {
    assert.match(parameterNotesBlock, new RegExp(attribute.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${attribute} is missing from component parameter notes`);
});
assert.match(source, /const commonData = [\s\S]*data-ui-component[\s\S]*data-ui-for[\s\S]*data-ui-label/, "common data-ui guidance is missing from component documentation");
assert.match(source, /YYYY\/MM\/DD HH:mm/, "date-time picker documentation is missing the slash display format");
assert.match(source, /"date-picker": field\([\s\S]*data-ui-date-control="date" placeholder="YYYY\/MM\/DD"/, "default date picker copy code is missing its format placeholder");
assert.match(source, /"date-time-picker": field\([\s\S]*data-ui-date-control="datetime" placeholder="YYYY\/MM\/DD HH:mm"/, "default date-time picker copy code is missing its format placeholder");
assert.match(source, /"time-picker": field\([\s\S]*data-ui-time-control="true" placeholder="HH:mm"/, "default time picker copy code is missing its format placeholder");
assert.match(source, /data-ui-date-control="range" placeholder="YYYY\/MM\/DD 至 YYYY\/MM\/DD"[\s\S]*data-ui-range-start \/>[\s\S]*data-ui-range-end \/>/, "default date-range picker copy code is missing its format placeholder or has a default value");

const cssRule = selector => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return styles.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, "s"))?.[1] ?? "";
};
const textInputPreview = showcaseMarkup.match(/data-ui-preview-kind="text-input"[\s\S]*?data-ui-preview-kind="textarea"/)?.[0] ?? "";
assert.match(cssRule(".ui-control:focus"), /outline\s*:\s*(?:0|none)/i, "standalone ui-control focus keeps the browser default black outline");
assert.match(textInputPreview, /<input class="ui-control"/, "text input preview does not match the copied standalone HTML");
assert.doesNotMatch(textInputPreview, /form-control/, "text input preview depends on Bootstrap form-control instead of the standalone component style");
assert.match(textInputPreview, /autocomplete="name"/, "text input preview is missing autocomplete guidance for a person's name");
assert.match(source, /"text-input": field\([\s\S]*autocomplete="name"/, "generated text input HTML is missing autocomplete guidance for a person's name");
assert.match(parameterNotesBlock, /autocomplete/, "text input parameter notes do not explain the autocomplete attribute");
assert.match(cssRule(".ui-file-list"), /width:\s*100%/i, "file progress list is not constrained to the uploader width");
assert.match(cssRule(".ui-file-upload"), /width:\s*100%/i, "file uploader does not define its own width");
assert.match(cssRule(".ui-file-item"), /width:\s*100%/i, "file progress item is not constrained to the uploader width");
assert.match(cssRule(".ui-file-item"), /min-width:\s*0/i, "file progress item can overflow because its minimum width is not reset");
assert.match(cssRule(".ui-download-file-icon"), /var\(--ui-download-icon-color/i, "download file icon does not use a configurable theme color");
assert.match(cssRule(".ui-download-progress > i"), /var\(--ui-download-progress-color/i, "download progress does not use a configurable theme color");
assert.match(cssRule(".ui-data-table-page-button"), /transition:[^;]*transform/i, "data table pagination buttons have no hover transition");
assert.match(styles, /\.ui-data-table-page-button:not\(:disabled\):hover[\s\S]*transform:\s*translateY\(-2px\)/, "data table pagination buttons do not lift on hover");
assert.match(styles, /\.ui-data-table-page-button:not\(:disabled\):hover[\s\S]*box-shadow:/, "data table pagination buttons have no hover shadow");
assert.match(showcaseStyles, /\.ui-component-workspace\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s, "editor and preview are not stacked vertically");
assert.match(showcaseStyles, /\.ui-preview-card \[data-ui-preview-item\]\s*\{[^}]*width:\s*100%/s, "preview components do not fill the available width");
assert.match(showcaseStyles, /\.ui-preview-card \[data-ui-preview-item\]\s*\{[^}]*flex:\s*0 0 100%/s, "preview grid columns are not expanded to full width");
assert.match(showcaseStyles, /data-ui-preview-kind="button"|data-ui-preview-kind\\=\"button\\"/, "button width exception is missing");
assert.match(showcaseStyles, /\.ui-preview-card \[data-ui-preview-kind="button"\][^}]*\{[^}]*width:\s*auto/s, "button preview is still forced to full width");
assert.match(showcaseMarkup, /data-ui-show-kind="breadcrumb"/, "breadcrumb is missing from the showcase navigation");
assert.match(showcaseMarkup, /data-ui-show-kind="switch"/, "switch is missing from the showcase navigation");
assert.match(showcaseMarkup, /data-ui-preview-kind="switch"[\s\S]*ui-switch-input/, "switch showcase markup is missing the native checkbox input");
assert.doesNotMatch(showcaseMarkup, /data-ui-preview-kind="switch"[\s\S]*ui-switch-card/, "switch showcase is still wrapped in a card");
assert.match(showcaseMarkup, /data-ui-preview-kind="breadcrumb"[\s\S]*class="breadcrumb ui-breadcrumb-list"/, "breadcrumb showcase markup is missing Bootstrap breadcrumb semantics");
assert.match(showcaseMarkup, /data-ui-breadcrumb-settings[\s\S]*data-ui-breadcrumb-separator/, "breadcrumb separator selector is missing from the showcase editor");
assert.match(showcaseMarkup, /data-ui-breadcrumb-separator="chevron-right"/, "breadcrumb preview has no default separator setting");
assert.match(styles, /\.ui-breadcrumb-list[\s\S]*\.ui-breadcrumb-current/, "breadcrumb visual treatment is missing");
assert.match(source, /separatorIcons[\s\S]*slash-lg[\s\S]*dash-lg/, "breadcrumb separator icon choices are missing");
assert.match(source, /data-ui-breadcrumb-separator/, "breadcrumb generated HTML has no separator setting");
assert.match(source, /breadcrumb:\s*`<nav class="ui-breadcrumb"[\s\S]*aria-current="page"/, "breadcrumb generated HTML is missing accessible current-page markup");
assert.match(iconStyles, /@font-face[\s\S]*bootstrap-icons\.woff2/, "standalone package is missing the Bootstrap Icons font definition");
assert.ok(fs.existsSync("standalone/bootstrap-icons/font/fonts/bootstrap-icons.woff2"), "standalone package is missing the Bootstrap Icons woff2 font");
assert.match(showcaseMarkup, /bootstrap-icons\/font\/bootstrap-icons\.min\.css/, "showcase usage instructions do not explain how to load Bootstrap Icons");
assert.match(source, /"tag-input":\s*\{[\s\S]*?ui-tag-input-values[\s\S]*?Request\.Form[\s\S]*?tags/, "tag input documentation does not explain how to retrieve submitted tag values");
assert.match(source, /"tag-select":\s*\{[\s\S]*?ui-tag-select-values[\s\S]*?Request\.Form[\s\S]*?skills/, "tag select documentation does not explain how to retrieve submitted selected values");
assert.match(source, /"tag-input":\s*`[\s\S]*data-ui-tag-input-values/, "tag input generated HTML is missing its form value select");
assert.match(source, /"tag-select":\s*`[\s\S]*data-ui-tag-select-values/, "tag select generated HTML is missing its form value select");
const tagInputSnippet = source.match(/"tag-input":\s*`([\s\S]*?)`,\r?\n\s*"tag-select"/)?.[1] ?? "";
const tagSelectSnippet = source.match(/"tag-select":\s*`([\s\S]*?)`,\r?\n\s*checkbox:/)?.[1] ?? "";
const tagSelectValuesMarkup = tagSelectSnippet.match(/<select class="ui-tag-select-values"[\s\S]*?<\/select>/)?.[0] ?? "";
assert.doesNotMatch(tagInputSnippet, /<option\b/, "tag input generated HTML should not imply predefined options");
assert.match(tagSelectSnippet, /value="csharp">C#<\/option>[\s\S]*value="aspnet-core">ASP\.NET Core<\/option>/, "tag select generated HTML should use the documented C# and ASP.NET Core examples");
assert.doesNotMatch(tagSelectSnippet, /value="javascript"/, "tag select generated HTML still uses the old JavaScript example");
assert.doesNotMatch(tagSelectValuesMarkup, /<option\b/, "tag select generated hidden values should be populated by JavaScript instead of duplicating defaults");
assert.match(source, /switch:\s*`<div class="ui-switch"[\s\S]*ui-switch-input/, "switch generated HTML is missing");
assert.match(styles, /\.ui-switch-input:checked \+ \.ui-switch-track/, "switch checked state styling is missing");
assert.match(styles, /\.ui-switch-input:focus-visible \+ \.ui-switch-track/, "switch keyboard focus styling is missing");
assert.match(styles, /\.ui-switch-input:checked \+ \.ui-switch-track \.ui-switch-on-icon/, "switch checked state does not show the check icon");
assert.match(styles, /\.ui-switch-input:checked \+ \.ui-switch-track \.ui-switch-off-icon/, "switch checked state does not hide the X icon");
assert.match(source, /radio:\s*\["--ui-border-color", "--ui-focus-color", "--ui-text-color"\]/, "radio editor still exposes background color");

assert.match(source, /radio:\s*['"][\s\S]*name="preferredContact"[\s\S]*value="email"[\s\S]*name="preferredContact"[\s\S]*value="phone"/, "radio generated HTML should include two mutually exclusive contact options");
const expectedThemeVariables = [
    "--ui-border-color", "--ui-focus-color", "--ui-text-color", "--ui-background-color",
    "--ui-tag-color", "--ui-tag-text-color",
    "--ui-button-background", "--ui-button-text", "--ui-button-border",
    "--ui-confirm-color", "--ui-cancel-color", "--ui-range-endpoint-color", "--ui-range-fill-color",
    "--ui-time-control-color",
    "--ui-flip-number-color", "--ui-flip-number-background",
    "--ui-upload-border-color", "--ui-upload-progress-color", "--ui-upload-button-color", "--ui-download-icon-color", "--ui-download-progress-color",
    "--ui-table-header-background", "--ui-table-header-text", "--ui-table-border", "--ui-table-stripe", "--ui-table-accent",
    "--ui-breadcrumb-accent", "--ui-breadcrumb-accent-soft", "--ui-breadcrumb-text", "--ui-breadcrumb-current-background", "--ui-breadcrumb-current-text",
    "--ui-switch-on-color", "--ui-switch-off-color", "--ui-switch-thumb-color"
];
const escapedVariable = variable => variable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const allowedBlock = source.match(/const allowed = \{([\s\S]*?)\n\s*\};/)?.[1] ?? "";
expectedThemeVariables.forEach(variable => {
    assert.match(allowedBlock, new RegExp(escapedVariable(variable)), `${variable} is not mapped to a component theme`);
    assert.match(showcaseMarkup, new RegExp(`data-ui-color=["']${escapedVariable(variable)}["']`), `${variable} has no color editor control`);
});
assert.doesNotMatch(allowedBlock, /--ui-time-format-color|--ui-time-meridiem-color/, "time format and meridiem colors should not be configurable");
assert.doesNotMatch(showcaseMarkup, /data-ui-color=["']--ui-time-format-color["']|data-ui-color=["']--ui-time-meridiem-color["']/, "time format and meridiem controls should be removed");
assert.match(source, /getComputedStyle\(active\)[\s\S]*--ui-download-progress-color/, "download dialog does not inherit the selected progress color");
assert.match(source, /"file-download":\s*`[^`]*\$\{style\}/s, "download generated HTML does not include the selected icon color");
assert.match(source, /const themeSnippet = \(snippet, component\)[\s\S]*\$\{style\}/, "generated label snippets have no theme style adapter");
assert.match(source, /snippets\.checkbox = themeSnippet\(snippets\.checkbox, "checkbox"\)/, "checkbox generated HTML does not include the selected theme");
assert.match(source, /themeGroupSnippet[\s\S]*snippets\.radio = themeGroupSnippet\(snippets\.radio, "radio"\)/, "radio generated HTML does not include the selected theme");

console.log("PASS: theme synchronization and component initializers reached their interaction bindings");
