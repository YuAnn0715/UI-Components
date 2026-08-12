(function (global) {
  "use strict";

  function createUiComponentLibrary(Vue) {
    if (!Vue || !Vue.defineComponent || !Vue.h) {
      throw new Error("UiComponentLibraryVue requires Vue 3.");
    }

    const { computed, defineComponent, h, ref } = Vue;
    const optionValue = option => String(option?.value ?? option?.Value ?? option?.text ?? option?.Text ?? option ?? "");
    const optionText = option => String(option?.text ?? option?.Text ?? option?.label ?? option?.Label ?? optionValue(option));
    const safeDownloadUrl = value => {
      try {
        const url = new URL(value, window.location.origin);
        return ["http:", "https:"].includes(url.protocol) ? url.href : null;
      } catch {
        return null;
      }
    };
    const themeStyle = props => ({
      "--ui-border-color": props.borderColor || undefined,
      "--ui-focus-color": props.focusColor || undefined,
      "--ui-text-color": props.textColor || undefined,
      "--ui-background-color": props.backgroundColor || undefined,
      "--ui-tag-color": props.tagColor || undefined,
      "--ui-tag-text-color": props.tagTextColor || undefined
    });
    const fieldProps = {
      label: String,
      borderColor: String,
      focusColor: String,
      textColor: String,
      backgroundColor: String
    };
    const field = (name, renderControl) => defineComponent({
      name,
      props: { ...fieldProps, modelValue: [String, Number] },
      emits: ["update:modelValue"],
      setup(props, { emit, attrs }) {
        return () => h("div", { class: "ui-field", style: themeStyle(props) }, [
          props.label ? h("label", { class: "form-label ui-label" }, props.label) : null,
          renderControl(props, emit, attrs)
        ]);
      }
    });

    const textInput = field("UiTextInput", (props, emit, attrs) => h("input", {
      ...attrs,
      class: ["form-control", "ui-control", attrs.class],
      value: props.modelValue ?? "",
      onInput: event => emit("update:modelValue", event.target.value)
    }));

    const textarea = field("UiTextarea", (props, emit, attrs) => h("textarea", {
      ...attrs,
      class: ["form-control", "ui-control", attrs.class],
      value: props.modelValue ?? "",
      onInput: event => emit("update:modelValue", event.target.value)
    }));

    const select = defineComponent({
      name: "UiSelect",
      props: { ...fieldProps, modelValue: [String, Number], items: { type: Array, default: () => [] } },
      emits: ["update:modelValue"],
      setup(props, { emit, attrs }) {
        return () => h("div", { class: "ui-field", style: themeStyle(props) }, [
          props.label ? h("label", { class: "form-label ui-label" }, props.label) : null,
          h("select", { ...attrs, class: ["form-select", "ui-control", attrs.class], value: props.modelValue ?? "", onChange: event => emit("update:modelValue", event.target.value) },
            props.items.map(item => h("option", { value: optionValue(item) }, optionText(item)))
          )
        ]);
      }
    });

    const checkbox = defineComponent({
      name: "UiCheckbox",
      props: { ...fieldProps, modelValue: Boolean },
      emits: ["update:modelValue"],
      setup(props, { emit, attrs }) {
        return () => h("div", { class: "ui-field ui-check-field", style: themeStyle(props) }, h("div", { class: "form-check" }, [
          h("input", { ...attrs, class: ["form-check-input", "ui-check-control", attrs.class], type: "checkbox", checked: props.modelValue, onChange: event => emit("update:modelValue", event.target.checked) }),
          props.label ? h("label", { class: "form-check-label ui-label" }, props.label) : null
        ]));
      }
    });

    const radio = defineComponent({
      name: "UiRadio",
      props: { ...fieldProps, modelValue: [String, Number], value: { type: [String, Number], required: true } },
      emits: ["update:modelValue"],
      setup(props, { emit, attrs }) {
        return () => h("div", { class: "ui-field ui-check-field", style: themeStyle(props) }, h("div", { class: "form-check" }, [
          h("input", { ...attrs, class: ["form-check-input", "ui-check-control", attrs.class], type: "radio", value: props.value, checked: props.modelValue === props.value, onChange: () => emit("update:modelValue", props.value) }),
          props.label ? h("label", { class: "form-check-label ui-label" }, props.label) : null
        ]));
      }
    });

    const button = defineComponent({
      name: "UiButton",
      props: { type: { type: String, default: "button" }, backgroundColor: String, textColor: String, borderColor: String },
      emits: ["click"],
      setup(props, { emit, slots, attrs }) {
        return () => h("button", {
          ...attrs,
          type: props.type,
          class: ["btn", "ui-button", attrs.class],
          style: { "--ui-button-background": props.backgroundColor, "--ui-button-text": props.textColor, "--ui-button-border": props.borderColor },
          onClick: event => emit("click", event)
        }, slots.default?.());
      }
    });

    const tagSelect = defineComponent({
      name: "UiTagSelect",
      props: { ...fieldProps, modelValue: { type: Array, default: () => [] }, items: { type: Array, default: () => [] }, tagColor: String, tagTextColor: String, placeholder: { type: String, default: "選擇項目" } },
      emits: ["update:modelValue"],
      setup(props, { emit, attrs }) {
        const picker = ref("");
        const selected = computed(() => new Set(props.modelValue.map(String)));
        const add = value => {
          if (!value || selected.value.has(value)) return;
          emit("update:modelValue", [...props.modelValue, value]);
          picker.value = "";
        };
        const remove = value => emit("update:modelValue", props.modelValue.filter(item => String(item) !== value));
        return () => h("div", { class: "ui-field ui-tag-select-field", style: themeStyle(props) }, [
          props.label ? h("label", { class: "form-label ui-label" }, props.label) : null,
          h("div", { class: "ui-tag-select-control" }, [
            h("div", { class: "ui-tag-select-tags", "aria-live": "polite" }, props.modelValue.map(value => {
              const item = props.items.find(option => optionValue(option) === String(value));
              return h("span", { class: "ui-tag-select-tag", key: value }, [
                h("span", optionText(item ?? value)),
                h("button", { type: "button", class: "ui-tag-select-remove", "aria-label": `移除 ${optionText(item ?? value)}`, onClick: () => remove(String(value)) }, "×")
              ]);
            })),
            h("select", { ...attrs, class: ["ui-tag-select-menu", attrs.class], value: picker.value, onChange: event => { picker.value = event.target.value; add(event.target.value); } }, [
              h("option", { value: "" }, props.placeholder),
              ...props.items.map(item => h("option", { value: optionValue(item), disabled: selected.value.has(optionValue(item)) }, optionText(item)))
            ])
          ])
        ]);
      }
    });

    const fileUpload = defineComponent({
      name: "UiFileUpload",
      props: { label: String, modelValue: [Object, Array], accept: { type: String, default: ".pdf,.doc,.docx" }, maxSizeMb: { type: Number, default: 10 }, multiple: Boolean, borderColor: String, progressColor: String, buttonColor: String },
      emits: ["update:modelValue", "invalid"],
      setup(props, { emit, attrs }) {
        const files = ref([]);
        const input = ref(null);
        const dragging = ref(false);
        const formatSize = bytes => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
        const accepts = file => {
          const rules = props.accept.split(",").map(rule => rule.trim().toLowerCase()).filter(Boolean);
          return !rules.length || rules.some(rule => rule.startsWith(".") ? file.name.toLowerCase().endsWith(rule) : rule.endsWith("/*") ? file.type.startsWith(rule.slice(0, -1)) : file.type === rule);
        };
        const chooseFiles = selectedFiles => {
          const selected = [...selectedFiles];
          const valid = selected.filter(file => accepts(file) && file.size <= props.maxSizeMb * 1024 * 1024);
          const invalid = selected.filter(file => !valid.includes(file));
          if (invalid.length) emit("invalid", invalid);
          files.value = props.multiple ? valid : valid.slice(0, 1);
          emit("update:modelValue", props.multiple ? files.value : files.value[0] ?? null);
        };
        const choose = event => chooseFiles(event.target.files);
        const remove = index => {
          files.value = files.value.filter((_, fileIndex) => fileIndex !== index);
          emit("update:modelValue", props.multiple ? files.value : files.value[0] ?? null);
        };
        return () => h("div", { class: ["ui-field", "ui-file-upload"], style: { "--ui-upload-border-color": props.borderColor, "--ui-upload-progress-color": props.progressColor, "--ui-upload-button-color": props.buttonColor } }, [
          props.label ? h("label", { class: "form-label ui-label" }, props.label) : null,
          h("div", {
            class: ["ui-file-drop-zone", dragging.value && "is-dragging"], tabindex: "0", role: "button",
            onClick: () => input.value?.click(),
            onKeydown: event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); input.value?.click(); } },
            onDragover: event => { event.preventDefault(); dragging.value = true; },
            onDragleave: () => { dragging.value = false; },
            onDrop: event => { event.preventDefault(); dragging.value = false; chooseFiles(event.dataTransfer?.files || []); }
          }, [
            h("span", { class: "ui-file-upload-icon", "aria-hidden": "true" }, "↑"),
            h("strong", "拖放檔案到這裡"),
            h("span", { class: "ui-file-or" }, "或"),
            h("button", { type: "button", class: "ui-file-browse", onClick: event => { event.stopPropagation(); input.value?.click(); } }, "瀏覽檔案"),
            h("span", { class: "ui-file-hint" }, `支援 ${props.accept.replaceAll(",", "、")} · 上限 ${props.maxSizeMb} MB`)
          ]),
          h("input", { ...attrs, ref: input, class: ["ui-file-input", attrs.class], type: "file", accept: props.accept, multiple: props.multiple, onChange: choose }),
          h("div", { class: "ui-file-list", "aria-live": "polite" }, files.value.map((file, index) => h("article", { class: "ui-file-item is-complete", key: `${file.name}-${file.lastModified}` }, [
            h("span", { class: "ui-file-item-icon", "aria-hidden": "true" }, "↑"),
            h("div", [h("strong", file.name), h("small", `${formatSize(file.size)} · 已選取`), h("span", { class: "ui-file-progress" }, h("i"))]),
            h("button", { type: "button", "aria-label": `移除 ${file.name}`, onClick: () => remove(index) }, "×")
          ])))
        ]);
      }
    });

    const fileDownload = defineComponent({
      name: "UiFileDownload",
      props: { label: { type: String, default: "檔案下載" }, fileName: { type: String, default: "下載檔案.pdf" }, fileUrl: { type: String, default: "#" } },
      setup(props, { attrs }) {
        return () => {
          const url = safeDownloadUrl(props.fileUrl);
          return h("section", { ...attrs, class: ["ui-file-download", attrs.class] }, h("div", { class: "ui-download-card" }, [
            h("div", { class: "ui-download-copy" }, [h("strong", props.label), h("span", props.fileName)]),
            url
              ? h("a", { class: "btn btn-primary", href: url, target: "_blank", rel: "noopener" }, "下載檔案")
              : h("button", { type: "button", class: "btn btn-secondary", disabled: true }, "下載連結不可用")
          ]));
        };
      }
    });

    const dateInput = (name, type) => field(name, (props, emit, attrs) => h("input", { ...attrs, type, class: ["form-control", "ui-control", attrs.class], value: props.modelValue ?? "", onInput: event => emit("update:modelValue", event.target.value) }));
    const datePicker = dateInput("UiDatePicker", "date");
    const dateTimePicker = dateInput("UiDateTimePicker", "datetime-local");
    const timePicker = defineComponent({
      name: "UiTimePicker",
      props: { ...fieldProps, modelValue: String, controlColor: String, flipNumberColor: String, flipNumberBackgroundColor: String },
      emits: ["update:modelValue"],
      setup(props, { emit, attrs }) {
        const open = ref(false);
        const pending = ref({ hour: "09", minute: "00" });
        const parse = value => {
          const [hour = "09", minute = "00"] = String(value || "09:00").split(":");
          return { hour: hour.padStart(2, "0"), minute: minute.padStart(2, "0") };
        };
        const show = () => { pending.value = parse(props.modelValue); open.value = true; };
        const now = () => { const value = new Date(); pending.value = { hour: String(value.getHours()).padStart(2, "0"), minute: String(value.getMinutes()).padStart(2, "0") }; };
        const hours = Array.from({ length: 24 }, (_, value) => String(value).padStart(2, "0"));
        const minutes = Array.from({ length: 60 }, (_, value) => String(value).padStart(2, "0"));
        return () => h("div", { class: "ui-field", style: { ...themeStyle(props), "--ui-time-control-color": props.controlColor, "--ui-flip-number-color": props.flipNumberColor, "--ui-flip-number-background": props.flipNumberBackgroundColor } }, [
          props.label ? h("label", { class: "form-label ui-label" }, props.label) : null,
          h("button", { ...attrs, type: "button", class: ["form-control", "ui-control", "ui-time-trigger", attrs.class], onClick: show }, [
            h("span", { class: "ui-time-trigger-icon", "aria-hidden": "true" }, "◷"),
            h("span", { class: "ui-time-trigger-value" }, props.modelValue || "選擇時間")
          ]),
          open.value ? h("div", { class: "ui-premium-time-panel" }, [
            h("div", { class: "ui-premium-tabs" }, [h("button", { type: "button", onClick: now }, "現在時間")]),
            h("div", { class: "ui-vue-time-fields" }, [
              h("select", { class: "ui-vue-time-select", value: pending.value.hour, onChange: event => { pending.value = { ...pending.value, hour: event.target.value }; } }, hours.map(value => h("option", { value }, value))),
              h("span", { class: "ui-flip-colon" }, ":"),
              h("select", { class: "ui-vue-time-select", value: pending.value.minute, onChange: event => { pending.value = { ...pending.value, minute: event.target.value }; } }, minutes.map(value => h("option", { value }, value)))
            ]),
            h("div", { class: "ui-premium-actions" }, [
              h("button", { type: "button", onClick: () => { open.value = false; } }, "取消"),
              h("button", { type: "button", "data-ui-time-done": "", onClick: () => { emit("update:modelValue", `${pending.value.hour}:${pending.value.minute}`); open.value = false; } }, "確認")
            ])
          ]) : null
        ]);
      }
    });
    const dateRangePicker = defineComponent({
      name: "UiDateRangePicker",
      props: { ...fieldProps, modelValue: { type: Array, default: () => ["", ""] } },
      emits: ["update:modelValue"],
      setup(props, { emit, attrs }) {
        const update = (index, value) => { const next = [...props.modelValue]; next[index] = value; emit("update:modelValue", next); };
        return () => h("div", { class: "ui-field", style: themeStyle(props) }, [
          props.label ? h("label", { class: "form-label ui-label" }, props.label) : null,
          h("div", { class: "row g-2" }, [
            h("div", { class: "col" }, h("input", { ...attrs, type: "date", class: ["form-control", "ui-control", attrs.class], value: props.modelValue[0] ?? "", onInput: event => update(0, event.target.value) })),
            h("div", { class: "col" }, h("input", { type: "date", class: "form-control ui-control", value: props.modelValue[1] ?? "", onInput: event => update(1, event.target.value) }))
          ])
        ]);
      }
    });

    const components = {
      "ui-text-input": textInput,
      "ui-textarea": textarea,
      "ui-select": select,
      "ui-tag-select": tagSelect,
      "ui-checkbox": checkbox,
      "ui-radio": radio,
      "ui-button": button,
      "ui-file-upload": fileUpload,
      "ui-file-download": fileDownload,
      "ui-date-picker": datePicker,
      "ui-date-time-picker": dateTimePicker,
      "ui-time-picker": timePicker,
      "ui-date-range-picker": dateRangePicker
    };

    return { install(app) { Object.entries(components).forEach(([name, component]) => app.component(name, component)); } };
  }

  global.UiComponentLibraryVue = { createUiComponentLibrary };
})(window);
