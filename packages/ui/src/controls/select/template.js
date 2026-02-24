/**
 * @typedef {import('../../../types/controls/select').SelectEntity} SelectEntity
 * @typedef {import('../../../types/controls/select').SelectOption} SelectOption
 * @typedef {import('@inglorious/web').Api} Api
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref, repeat, when } from "@inglorious/web"
import { applyElementProps } from "../../shared/applyElementProps.js"

import {
  filterOptions,
  formatOption,
  getOptionLabel,
  getOptionValue,
  isOptionSelected,
} from "./helpers.js"

const NO_FOCUSED_INDEX = -1

/**
 * Select control render function.
 * @param {SelectEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function render(entity, api) {
  const type = api.getType?.(entity.type)
  const normalized = ensureDefaults(entity)

  return html`<div
    class=${classMap({
      "iw-select": true,
      "iw-select-full-width": !!normalized.fullWidth,
      [`iw-select-${normalized.size}`]: normalized.size !== "md",
    })}
  >
    ${normalized.label
      ? html`<label class="iw-select-label">${normalized.label}</label>`
      : null}
    ${type?.renderControl?.(normalized, api) ?? renderControl(normalized, api)}
    ${when(
      normalized.isOpen,
      () =>
        type?.renderDropdown?.(normalized, api) ??
        renderDropdown(normalized, api),
    )}
  </div>`
}

/**
 * Render trigger control.
 * @param {SelectEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function renderControl(entity, api) {
  const type = api.getType?.(entity.type)

  return html`<div
    class="iw-select-control ${classMap({
      "iw-select-control-open": entity.isOpen,
      "iw-select-control-disabled": entity.isDisabled,
      "iw-select-control-selection":
        entity.isMulti &&
        Array.isArray(entity.selectedValue) &&
        entity.selectedValue.length,
    })}"
    @click=${() => !entity.isDisabled && api.notify(`#${entity.id}:toggle`)}
    ${ref((element) => applyElementProps(element, entity.controlProps ?? {}))}
  >
    ${when(
      entity.isMulti,
      () =>
        type?.renderMultiValue?.(entity, api) ?? renderMultiValue(entity, api),
      () => type?.renderSingleValue?.(entity) ?? renderSingleValue(entity),
    )}
    ${when(
      entity.isClearable &&
        ((entity.isMulti &&
          Array.isArray(entity.selectedValue) &&
          entity.selectedValue.length) ||
          (!entity.isMulti && entity.selectedValue !== null)),
      () =>
        html`<button
          class="iw-select-clear"
          type="button"
          @click=${(event) => {
            event.stopPropagation()
            api.notify(`#${entity.id}:clear`)
          }}
        >
          ×
        </button>`,
    )}

    <div class="iw-select-arrow"><span>▼</span></div>
  </div>`
}

/**
 * Render single selected value.
 * @param {SelectEntity} entity
 * @returns {TemplateResult}
 */
export function renderSingleValue(entity) {
  if (entity.selectedValue === null) {
    return html`<span class="iw-select-placeholder"
      >${entity.placeholder}</span
    >`
  }

  const selectedOption = entity.options.find(
    (option) => getOptionValue(option) === entity.selectedValue,
  )

  return html`<span class="iw-select-value"
    >${selectedOption
      ? getOptionLabel(selectedOption)
      : String(entity.selectedValue)}</span
  >`
}

/**
 * Render multi selected value tags.
 * @param {SelectEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function renderMultiValue(entity, api) {
  const type = api.getType?.(entity.type)
  if (!Array.isArray(entity.selectedValue) || !entity.selectedValue.length) {
    return html`<span class="iw-select-placeholder"
      >${entity.placeholder}</span
    >`
  }

  return html`<div class="iw-select-multi-value">
    ${repeat(
      entity.selectedValue,
      (value) => value,
      (value) =>
        type?.renderMultiValueTag?.(entity, value, api) ??
        renderMultiValueTag(entity, value, api),
    )}
  </div>`
}

/**
 * Render a selected multi-value tag.
 * @param {SelectEntity} entity
 * @param {string|number} value
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function renderMultiValueTag(entity, value, api) {
  const option = entity.options.find((opt) => getOptionValue(opt) === value)

  return html`<div
    class="iw-select-multi-value-tag"
    @click=${(event) => {
      event.stopPropagation()
      api.notify(`#${entity.id}:optionSelect`, option || { value })
    }}
  >
    <span class="iw-select-multi-value-tag-label"
      >${option ? getOptionLabel(option) : String(value)}</span
    >
    <span class="iw-select-multi-value-remove">×</span>
  </div>`
}

/**
 * Render dropdown.
 * @param {SelectEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function renderDropdown(entity, api) {
  const type = api.getType?.(entity.type)
  const filteredOptions = filterOptions(entity.options, entity.searchTerm)

  return html`<div
    class="iw-select-dropdown"
    ${ref((el) => {
      if (el) {
        setTimeout(() => {
          document.addEventListener(
            "click",
            (event) => {
              if (!el.contains(event.target)) {
                api.notify(`#${entity.id}:close`)
              }
            },
            { once: true },
          )
        })
      }
    })}
  >
    ${when(
      entity.isSearchable,
      () =>
        type?.renderSearchInput?.(entity, api) ??
        renderSearchInput(entity, api),
    )}
    ${when(
      entity.isLoading,
      () => type?.renderLoading?.(entity) ?? renderLoading(entity),
    )}
    ${when(
      !entity.isLoading && !filteredOptions.length,
      () => type?.renderNoOptions?.(entity) ?? renderNoOptions(entity),
    )}
    ${when(
      !entity.isLoading && filteredOptions.length,
      () => type?.renderOptions?.(entity, api) ?? renderOptions(entity, api),
    )}
  </div>`
}

/**
 * Render search input.
 * @param {SelectEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function renderSearchInput(entity, api) {
  return html`<input
    class="iw-select-dropdown-search"
    type="text"
    placeholder="Search..."
    .value=${entity.searchTerm ?? ""}
    @input=${(event) =>
      api.notify(`#${entity.id}:searchChange`, event.target.value)}
    @keydown=${(event) => handleKeyDown(entity, event, api)}
    ${ref((el) => {
      if (el && entity.isOpen) queueMicrotask(() => el.focus())
    })}
  />`
}

/**
 * Render options list.
 * @param {SelectEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function renderOptions(entity, api) {
  const filteredOptions = filterOptions(entity.options, entity.searchTerm)
  const type = api.getType?.(entity.type)

  return html`<div class="iw-select-dropdown-options">
    ${repeat(
      filteredOptions,
      (option) => getOptionValue(option),
      (option, index) =>
        type?.renderOption?.(entity, { option, index }, api) ??
        renderOption(entity, { option, index }, api),
    )}
  </div>`
}

/**
 * Render an option row.
 * @param {SelectEntity} entity
 * @param {{ option: SelectOption, index: number }} payload
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function renderOption(entity, { option, index }, api) {
  const normalized = formatOption(option)
  const isSelected = isOptionSelected(
    option,
    entity.selectedValue,
    entity.isMulti,
  )
  const isFocused = index === entity.focusedIndex

  return html`<div
    class="iw-select-dropdown-options-option ${classMap({
      "iw-select-dropdown-options-option-selected": isSelected,
      "iw-select-dropdown-options-option-focused": isFocused,
      "iw-select-dropdown-options-option-disabled": !!normalized.disabled,
    })}"
    @click=${() =>
      !normalized.disabled &&
      api.notify(`#${entity.id}:optionSelect`, normalized)}
    @mouseenter=${() => api.notify(`#${entity.id}:focusSet`, index)}
  >
    ${when(
      entity.isMulti,
      () =>
        html`<input
          type="checkbox"
          .checked=${isSelected}
          ?disabled=${!!normalized.disabled}
        />`,
    )}
    <span>${getOptionLabel(normalized)}</span>
  </div>`
}

/**
 * Render loading state.
 * @param {SelectEntity} entity
 * @returns {TemplateResult}
 */
export function renderLoading(entity) {
  return html`<div class="iw-select-loading">${entity.loadingMessage}</div>`
}

/**
 * Render no options state.
 * @param {SelectEntity} entity
 * @returns {TemplateResult}
 */
export function renderNoOptions(entity) {
  return html`<div class="iw-select-no-options">
    ${entity.noOptionsMessage}
  </div>`
}

/**
 * Handle key navigation.
 * @param {SelectEntity} entity
 * @param {KeyboardEvent} event
 * @param {Api} api
 */
function handleKeyDown(entity, event, api) {
  const filteredOptions = filterOptions(entity.options, entity.searchTerm)

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault()
      api.notify(`#${entity.id}:focusNext`)
      break
    case "ArrowUp":
      event.preventDefault()
      api.notify(`#${entity.id}:focusPrev`)
      break
    case "Enter":
      event.preventDefault()
      if (
        entity.focusedIndex > NO_FOCUSED_INDEX &&
        filteredOptions[entity.focusedIndex]
      ) {
        const option = formatOption(filteredOptions[entity.focusedIndex])
        if (!option.disabled) {
          api.notify(`#${entity.id}:optionSelect`, option)
        }
      }
      break
    case "Escape":
      event.preventDefault()
      api.notify(`#${entity.id}:close`)
      break
    case "Home":
      event.preventDefault()
      api.notify(`#${entity.id}:focusFirst`)
      break
    case "End":
      event.preventDefault()
      api.notify(`#${entity.id}:focusLast`)
      break
    default:
      break
  }
}

/**
 * @param {SelectEntity} entity
 * @returns {SelectEntity}
 */
function ensureDefaults(entity) {
  const isMulti = entity.isMulti ?? false
  const controlProps = Object.fromEntries(
    Object.entries(entity).filter(([key]) => !KNOWN_SELECT_KEYS.has(key)),
  )

  return {
    ...entity,
    options: (entity.options ?? []).map(formatOption),
    isOpen: entity.isOpen ?? false,
    searchTerm: entity.searchTerm ?? "",
    focusedIndex: entity.focusedIndex ?? NO_FOCUSED_INDEX,
    isMulti,
    selectedValue: entity.selectedValue ?? (isMulti ? [] : null),
    isLoading: entity.isLoading ?? false,
    isDisabled: entity.isDisabled ?? false,
    isSearchable: entity.isSearchable ?? true,
    isClearable: entity.isClearable ?? true,
    placeholder: entity.placeholder ?? "Select...",
    noOptionsMessage: entity.noOptionsMessage ?? "No options",
    loadingMessage: entity.loadingMessage ?? "Loading...",
    size: entity.size ?? "md",
    fullWidth: entity.fullWidth ?? false,
    label: entity.label ?? "",
    controlProps,
  }
}

const KNOWN_SELECT_KEYS = new Set([
  "id",
  "type",
  "label",
  "options",
  "isOpen",
  "searchTerm",
  "focusedIndex",
  "isMulti",
  "selectedValue",
  "isLoading",
  "isDisabled",
  "isSearchable",
  "isClearable",
  "placeholder",
  "noOptionsMessage",
  "loadingMessage",
  "fullWidth",
  "size",
  "controlProps",
])
