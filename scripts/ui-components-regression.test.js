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
        this.style = {
            setProperty: () => {},
            getPropertyValue: () => ""
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
    const downloadStart = new FakeElement("button", { uiDownloadStart: "" });
    const download = new FakeElement("section", { uiComponent: "file-download" }, {
        "[data-ui-download-start]": downloadStart,
        "[data-ui-download-success]": null,
        "[data-ui-download-failure]": null
    });

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
        ["[data-ui-component='tag-select']", []],
        ["[data-ui-premium-time-control]", []],
        ["[data-ui-date-control]", dateControls],
        ["[data-ui-component='file-upload']", [upload]],
        ["[data-ui-time-control]", [timeControl]],
        ["[data-ui-data-table]", [tableComponent]]
    ]);

    const document = {
        body: new FakeElement("body"),
        querySelector: selector => selector === "[data-ui-theme-editor]" ? null : null,
        querySelectorAll: selector => selectorMap.get(selector) ?? [],
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
    return { document, window, downloadStart, dateControls, timeControl, tagInputText, tagInputValues, uploadInput, uploadDropZone, tableComponent };
}

const source = fs.readFileSync("standalone/ui-components.js", "utf8");
const styles = fs.readFileSync("standalone/ui-components.css", "utf8");
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
        getComputedStyle: () => ({ getPropertyValue: () => "" }),
        console
    }, { filename: "standalone/ui-components.js" });
} catch (error) {
    thrown = error;
}

assert.equal(thrown, null, `ui-components.js initialization threw: ${thrown?.message}`);
assert.ok(fixtures.downloadStart.listeners.has("click"), "download start interaction was not initialized");
fixtures.dateControls.forEach(control => assert.ok(control.listeners.has("click"), `${control.dataset.uiDateControl} picker interaction was not initialized`));
assert.ok(fixtures.timeControl.listeners.has("click"), "time picker interaction was not initialized");
assert.ok(fixtures.tagInputText.listeners.has("keydown"), "tag input Enter interaction was not initialized");
fixtures.tagInputText.value = "custom-tag";
fixtures.tagInputText.dispatchEvent(new FakeEvent("keydown", { key: "Enter", preventDefault: () => {} }));
assert.ok(fixtures.tagInputValues.options.some(option => option.value === "custom-tag" && option.selected), "tag input Enter did not create a selected tag");
assert.ok(fixtures.uploadInput.listeners.has("change"), "file upload interaction was not initialized");
assert.ok(fixtures.uploadDropZone.listeners.has("drop"), "file drop interaction was not initialized");
const tableHeader = fixtures.tableComponent.querySelector("table").tHead.rows[0].cells[0];
assert.ok(tableHeader.querySelector(".ui-data-table-sort-button")?.listeners.has("click"), "data table sorting was not initialized");
assert.ok(fixtures.tableComponent.querySelector(".ui-data-table-pagination"), "data table pagination was not initialized");

const cssRule = selector => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return styles.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, "s"))?.[1] ?? "";
};
assert.match(cssRule(".ui-file-list"), /width:\s*100%/i, "file progress list is not constrained to the uploader width");
assert.match(cssRule(".ui-file-upload"), /width:\s*100%/i, "file uploader does not define its own width");
assert.match(cssRule(".ui-file-item"), /width:\s*100%/i, "file progress item is not constrained to the uploader width");
assert.match(cssRule(".ui-file-item"), /min-width:\s*0/i, "file progress item can overflow because its minimum width is not reset");

console.log("PASS: all component initializers reached their interaction bindings");
