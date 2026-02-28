/**
 * @typedef {import('../../../types/controls/combobox.js').ComboboxEntity} ComboboxEntity
 * @typedef {import('../../../types/controls/combobox.js').ComboboxOption} ComboboxOption
 * @typedef {import('@inglorious/web').Api} Api
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref, repeat, when } from "@inglorious/web"

import { chipPrimitive } from "../../data-display/chip/index.js"
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
 * @param {ComboboxEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function render(entity, api) {
  const type = api.getType(entity.type)

  return html`<div
    class=${classMap({
      "iw-combobox": true,
      "iw-combobox-full-width": !!entity.fullWidth,
      [`iw-combobox-${entity.size}`]: entity.size !== "md",
    })}
  >
    ${entity.label
      ? html`<label class="iw-combobox-label">${entity.label}</label>`
      : null}
    ${type.renderControl?.(entity, api)}
    ${when(entity.isOpen, () => type.renderDropdown?.(entity, api))}
  </div>`
}

/**
 * Render trigger control.
 * @param {ComboboxEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function renderControl(entity, api) {
  const type = api.getType(entity.type)

  return html`<div
    class="iw-combobox-control ${classMap({
      "iw-combobox-control-open": entity.isOpen,
      "iw-combobox-control-disabled": entity.isDisabled,
      "iw-combobox-control-selection":
        entity.isMulti &&
        Array.isArray(entity.selectedValue) &&
        entity.selectedValue.length,
    })}"
    @click=${() => !entity.isDisabled && api.notify(`#${entity.id}:toggle`)}
  >
    ${when(
      entity.isMulti,
      () => type.renderMultiValue?.(entity, api),
      () => type.renderSingleValue?.(entity),
    )}
    ${when(
      entity.isClearable &&
        ((entity.isMulti &&
          Array.isArray(entity.selectedValue) &&
          entity.selectedValue.length) ||
          (!entity.isMulti && entity.selectedValue !== null)),
      () =>
        html`<button
          class="iw-combobox-clear"
          type="button"
          @click=${(event) => {
            event.stopPropagation()
            api.notify(`#${entity.id}:clear`)
          }}
        >
          ×
        </button>`,
    )}

    <div class="iw-combobox-arrow"><span>▼</span></div>
  </div>`
}

/**
 * Render single selected value.
 * @param {ComboboxEntity} entity
 * @returns {TemplateResult}
 */
export function renderSingleValue(entity) {
  if (entity.selectedValue === null) {
    return html`<span class="iw-combobox-placeholder"
      >${entity.placeholder}</span
    >`
  }

  const selectedOption = entity.options.find(
    (option) => getOptionValue(option) === entity.selectedValue,
  )

  return html`<span class="iw-combobox-value"
    >${selectedOption
      ? getOptionLabel(selectedOption)
      : String(entity.selectedValue)}</span
  >`
}

/**
 * Render multi selected value tags.
 * @param {ComboboxEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function renderMultiValue(entity, api) {
  const type = api.getType(entity.type)
  if (!Array.isArray(entity.selectedValue) || !entity.selectedValue.length) {
    return html`<span class="iw-combobox-placeholder"
      >${entity.placeholder}</span
    >`
  }

  return html`<div class="iw-combobox-multi-value">
    ${repeat(
      entity.selectedValue,
      (value) => value,
      (value) => type.renderMultiValueTag?.(entity, value, api),
    )}
  </div>`
}

/**
 * Render a selected multi-value tag.
 * @param {ComboboxEntity} entity
 * @param {string|number} value
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function renderMultiValueTag(entity, value, api) {
  const option = entity.options.find((opt) => getOptionValue(opt) === value)
  const tagId = `${entity.id}-tag-${String(value)}`
  const normalizedOption = option ?? { value }
  const chipSize = entity.size === "lg" ? "md" : "sm"
  const chipApi = createMultiValueChipApi(api, entity, tagId, normalizedOption)

  return html`<span
    class="iw-combobox-multi-value-tag"
    @click=${(event) => event.stopPropagation()}
  >
    ${chipPrimitive.render(
      {
        id: tagId,
        children: option ? getOptionLabel(option) : String(value),
        removable: true,
        size: chipSize,
        shape: "rounded",
      },
      chipApi,
    )}
  </span>`
}

/**
 * Render dropdown.
 * @param {ComboboxEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function renderDropdown(entity, api) {
  const type = api.getType(entity.type)
  const filteredOptions = filterOptions(entity.options, entity.searchTerm)

  return html`<div
    class="iw-combobox-dropdown"
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
    ${when(entity.isSearchable, () => type.renderSearchInput?.(entity, api))}
    ${when(entity.isLoading, () => type.renderLoading?.(entity))}
    ${when(!entity.isLoading && !filteredOptions.length, () =>
      type.renderNoOptions?.(entity),
    )}
    ${when(!entity.isLoading && filteredOptions.length, () =>
      type.renderOptions?.(entity, api),
    )}
  </div>`
}

/**
 * Render search input.
 * @param {ComboboxEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function renderSearchInput(entity, api) {
  return html`<input
    class="iw-combobox-dropdown-search"
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
 * @param {ComboboxEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function renderOptions(entity, api) {
  const filteredOptions = filterOptions(entity.options, entity.searchTerm)
  const type = api.getType?.(entity.type)

  return html`<div class="iw-combobox-dropdown-options">
    ${repeat(
      filteredOptions,
      (option) => getOptionValue(option),
      (option, index) => type.renderOption?.(entity, { option, index }, api),
    )}
  </div>`
}

/**
 * Render an option row.
 * @param {ComboboxEntity} entity
 * @param {{ option: ComboboxOption, index: number }} payload
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
    class="iw-combobox-dropdown-options-option ${classMap({
      "iw-combobox-dropdown-options-option-selected": isSelected,
      "iw-combobox-dropdown-options-option-focused": isFocused,
      "iw-combobox-dropdown-options-option-disabled": !!normalized.disabled,
    })}"
    @click=${() => {
      if (normalized.disabled) return
      api.notify(`#${entity.id}:optionSelect`, normalized)
    }}
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
 * @param {ComboboxEntity} entity
 * @returns {TemplateResult}
 */
export function renderLoading(entity) {
  return html`<div class="iw-combobox-loading">${entity.loadingMessage}</div>`
}

/**
 * Render no options state.
 * @param {ComboboxEntity} entity
 * @returns {TemplateResult}
 */
export function renderNoOptions(entity) {
  return html`<div class="iw-combobox-no-options">
    ${entity.noOptionsMessage}
  </div>`
}

/**
 * Handle key navigation.
 * @param {ComboboxEntity} entity
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

function createMultiValueChipApi(api, entity, tagId, option) {
  return {
    ...api,

    notify(event, payload) {
      if (event === `#${tagId}:remove`) {
        return api.notify(`#${entity.id}:optionSelect`, option)
      }

      return api.notify(event, payload)
    },
  }
}
