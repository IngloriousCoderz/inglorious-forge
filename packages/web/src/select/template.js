/**
 * @typedef {import('../../types/select.js').SelectEntity} SelectEntity
 * @typedef {import('../../types/select.js').SelectOption} SelectOption
 * @typedef {import('../../types/mount.js').Api} Api
 * @typedef {import('lit-html').TemplateResult} TemplateResult
 */

import { html } from "lit-html"
import { classMap } from "lit-html/directives/class-map.js"
import { ref } from "lit-html/directives/ref.js"
import { repeat } from "lit-html/directives/repeat.js"
import { when } from "lit-html/directives/when.js"

import {
  filterOptions,
  getOptionLabel,
  getOptionValue,
  isOptionSelected,
} from "./helpers.js"

/**
 * Main render function.
 * @param {SelectEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function render(entity, api) {
  const type = api.getType(entity.type)

  return html`<div class="iw-select">
    ${type.renderControl(entity, api)}
    ${when(entity.isOpen, () => type.renderDropdown(entity, api))}
  </div>`
}

/**
 * Render the control (input/button that opens the select).
 * @param {SelectEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function renderControl(entity, api) {
  const type = api.getType(entity.type)

  return html`<div
    class="iw-select-control ${classMap({
      "iw-select-control-open": entity.isOpen,
      "iw-select-control-disabled": entity.isDisabled,
      "iw-select-control-selection":
        entity.isMulti && entity.selectedValue.length,
    })}"
    @click=${() => !entity.isDisabled && api.notify(`#${entity.id}:toggle`)}
  >
    ${when(
      entity.isMulti,
      () => type.renderMultiValue(entity, api),
      () => type.renderSingleValue(entity, api),
    )}
    ${when(
      entity.isClearable &&
        ((entity.isMulti && entity.selectedValue.length) ||
          (!entity.isMulti && entity.selectedValue !== null)),
      () =>
        html`<div
          class="iw-select-clear"
          @click=${(event) => {
            event.stopPropagation()
            api.notify(`#${entity.id}:clear`)
          }}
        >
          <span>×</span>
        </div>`,
    )}

    <div class="iw-select-arrow"><span>▼</span></div>
  </div>`
}

/**
 * Render the selected value (single).
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
    (opt) => getOptionValue(opt) === entity.selectedValue,
  )

  return html`<span class="iw-select-value"
    >${selectedOption
      ? getOptionLabel(selectedOption)
      : entity.selectedValue}</span
  >`
}

/**
 * Render the selected values (multi-select).
 * @param {SelectEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function renderMultiValue(entity, api) {
  const type = api.getType(entity.type)

  if (!Array.isArray(entity.selectedValue) || !entity.selectedValue.length) {
    return html`<span class="iw-select-placeholder"
      >${entity.placeholder}</span
    >`
  }

  return html`<div class="iw-select-multi-value">
    ${repeat(
      entity.selectedValue,
      (value) => value,
      (value) => type.renderMultiValueTag(entity, value, api),
    )}
  </div>`
}

/**
 * Render a tag for a selected value in multi-select mode.
 * @param {SelectEntity} entity
 * @param {string|number} value
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function renderMultiValueTag(entity, value, api) {
  const option = entity.options.find((opt) => getOptionValue(opt) === value)
  const label = option ? getOptionLabel(option) : String(value)

  return html`<div
    class="iw-select-multi-value-tag"
    @click=${(event) => {
      event.stopPropagation()
      api.notify(`#${entity.id}:optionSelect`, option || { value })
    }}
  >
    <span class="iw-select-multi-value-tag-label">${label}</span>
    <span class="iw-select-multi-value-remove"> × </span>
  </div>`
}

/**
 * Render the dropdown.
 * @param {SelectEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function renderDropdown(entity, api) {
  const type = api.getType(entity.type)

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
    ${when(entity.isSearchable, () => type.renderSearchInput(entity, api))}
    ${when(entity.isLoading, () => type.renderLoading(entity, api))}
    ${when(!entity.isLoading && !filteredOptions.length, () =>
      type.renderNoOptions(entity, api),
    )}
    ${when(!entity.isLoading && filteredOptions.length, () =>
      type.renderOptions(entity, api),
    )}
  </div>`
}

/**
 * Render the search input.
 * @param {SelectEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function renderSearchInput(entity, api) {
  return html`<input
    class="iw-select-dropdown-search"
    type="text"
    placeholder="Search..."
    .value=${entity.searchTerm}
    @input=${(event) =>
      api.notify(`#${entity.id}:searchChange`, event.target.value)}
    @keydown=${(event) => handleKeyDown(entity, event, api)}
    ${ref((el) => {
      if (el && entity.isOpen) {
        // Focus input when dropdown opens
        queueMicrotask(() => el.focus())
      }
    })}
  />`
}

/**
 * Render the list of options.
 * @param {SelectEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function renderOptions(entity, api) {
  const type = api.getType(entity.type)

  const filteredOptions = filterOptions(entity.options, entity.searchTerm)

  return html`<div class="iw-select-dropdown-options">
    ${repeat(
      filteredOptions,
      (option) => getOptionValue(option),
      (option, index) => type.renderOption(entity, { option, index }, api),
    )}
  </div>`
}

/**
 * Render an individual option.
 * @param {SelectEntity} entity
 * @param {SelectOption} option
 * @param {number} index
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function renderOption(entity, { option, index }, api) {
  const optionLabel = getOptionLabel(option)
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
      "iw-select-dropdown-options-option-disabled": option.isDisabled,
    })}"
    @click=${() =>
      !option.isDisabled && api.notify(`#${entity.id}:optionSelect`, option)}
    @mouseenter=${() => (entity.focusedIndex = index)}
  >
    ${when(
      entity.isMulti,
      () =>
        html`<input
          type="checkbox"
          .checked=${isSelected}
          ?disabled=${option.isDisabled}
        />`,
    )}
    <span>${optionLabel}</span>
  </div>`
}

/**
 * Render the loading state.
 * @param {SelectEntity} entity
 * @returns {TemplateResult}
 */
export function renderLoading(entity) {
  return html`<div class="iw-select-loading">${entity.loadingMessage}</div>`
}

/**
 * Render when there are no options.
 * @param {SelectEntity} entity
 * @returns {TemplateResult}
 */
export function renderNoOptions(entity) {
  return html`<div class="iw-select-no-options">
    ${entity.noOptionsMessage}
  </div>`
}

/**
 * Keyboard navigation handler.
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
        entity.focusedIndex &&
        !filteredOptions[entity.focusedIndex].isDisabled
      ) {
        if (!entity.isMulti) {
          // trigger the outside click listener to consume it
          setTimeout(() => document.body.click())
        }
        api.notify(
          `#${entity.id}:optionSelect`,
          filteredOptions[entity.focusedIndex],
        )
      }
      break

    case "Escape":
      event.preventDefault()
      // trigger the outside click listener to consume it
      setTimeout(() => document.body.click())
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
