/**
 * @typedef {import('../../../types/controls/combobox.js').ComboboxProps} ComboboxProps
 * @typedef {import('../../../types/controls/combobox.js').ComboboxOption} ComboboxOption
 * @typedef {import('@inglorious/web').Api} Api
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref, repeat, when } from "@inglorious/web"

import { chip } from "../../data-display/chip/index.js"
import {
  filterOptions,
  formatOption,
  getOptionLabel,
  getOptionValue,
  isOptionSelected,
} from "./helpers.js"

const NO_FOCUSED_INDEX = -1

export const combobox = {
  /**
   * Select control render function.
   * @param {ComboboxProps} props
   * @param {Api} api
   * @returns {TemplateResult}
   */
  render(props, api) {
    return html`<div
      class=${classMap({
        "iw-combobox": true,
        "iw-combobox-full-width": !!props.fullWidth,
        [`iw-combobox-${props.size}`]: props.size !== "md",
      })}
    >
      ${props.label
        ? html`<label class="iw-combobox-label">${props.label}</label>`
        : null}
      ${this.renderControl?.(props, api)}
      ${when(props.isOpen, () => this.renderDropdown?.(props, api))}
    </div>`
  },

  /**
   * Render trigger control.
   * @param {ComboboxProps} props
   * @param {Api} api
   * @returns {TemplateResult}
   */
  renderControl(props, api) {
    return html`<div
      class="iw-combobox-control ${classMap({
        "iw-combobox-control-open": props.isOpen,
        "iw-combobox-control-disabled": props.isDisabled,
        "iw-combobox-control-selection":
          props.isMulti &&
          Array.isArray(props.selectedValue) &&
          props.selectedValue.length,
      })}"
      @click=${() => !props.isDisabled && api.notify(`#${props.id}:toggle`)}
    >
      ${when(
        props.isMulti,
        () => this.renderMultiValue?.(props, api),
        () => this.renderSingleValue?.(props),
      )}
      ${when(
        props.isClearable &&
          ((props.isMulti &&
            Array.isArray(props.selectedValue) &&
            props.selectedValue.length) ||
            (!props.isMulti && props.selectedValue !== null)),
        () =>
          html`<button
            class="iw-combobox-clear"
            type="button"
            @click=${(event) => {
              event.stopPropagation()
              api.notify(`#${props.id}:clear`)
              props.onClear?.()
            }}
          >
            ×
          </button>`,
      )}

      <div class="iw-combobox-arrow"><span>▼</span></div>
    </div>`
  },

  /**
   * Render single selected value.
   * @param {ComboboxProps} props
   * @returns {TemplateResult}
   */
  renderSingleValue(props) {
    if (props.selectedValue === null) {
      return html`<span class="iw-combobox-placeholder"
        >${props.placeholder}</span
      >`
    }

    const selectedOption = props.options.find(
      (option) => getOptionValue(option) === props.selectedValue,
    )

    return html`<span class="iw-combobox-value"
      >${selectedOption
        ? getOptionLabel(selectedOption)
        : String(props.selectedValue)}</span
    >`
  },

  /**
   * Render multi selected value tags.
   * @param {ComboboxProps} props
   * @param {Api} api
   * @returns {TemplateResult}
   */
  renderMultiValue(props, api) {
    if (!Array.isArray(props.selectedValue) || !props.selectedValue.length) {
      return html`<span class="iw-combobox-placeholder"
        >${props.placeholder}</span
      >`
    }

    return html`<div class="iw-combobox-multi-value">
      ${repeat(
        props.selectedValue,
        (value) => value,
        (value) => this.renderMultiValueTag?.(props, value, api),
      )}
    </div>`
  },

  /**
   * Render a selected multi-value tag.
   * @param {ComboboxProps} props
   * @param {string|number} value
   * @param {Api} api
   * @returns {TemplateResult}
   */
  renderMultiValueTag(props, value, api) {
    const option = props.options.find((opt) => getOptionValue(opt) === value)
    const tagId = `${props.id}-tag-${String(value)}`
    const chipSize = props.size === "lg" ? "md" : "sm"

    return html`<span
      class="iw-combobox-multi-value-tag"
      @click=${(event) => event.stopPropagation()}
    >
      ${chip.render({
        id: tagId,
        children: option ? getOptionLabel(option) : String(value),
        isRemovable: true,
        size: chipSize,
        shape: "rounded",
        onClick: () => {
          api.notify(`#${props.id}:optionSelect`, option)
          props.onChange?.(option)
        },
      })}
    </span>`
  },

  /**
   * Render dropdown.
   * @param {ComboboxProps} props
   * @param {Api} api
   * @returns {TemplateResult}
   */
  renderDropdown(props, api) {
    const filteredOptions = filterOptions(props.options, props.searchTerm)

    return html`<div
      class="iw-combobox-dropdown"
      ${ref((el) => {
        if (el) {
          setTimeout(() => {
            document.addEventListener(
              "click",
              (event) => {
                if (!el.contains(event.target)) {
                  api.notify(`#${props.id}:close`)
                }
              },
              { once: true },
            )
          })
        }
      })}
    >
      ${when(props.isSearchable, () => this.renderSearchInput?.(props, api))}
      ${when(props.isLoading, () => this.renderLoading?.(props))}
      ${when(!props.isLoading && !filteredOptions.length, () =>
        this.renderNoOptions?.(props),
      )}
      ${when(!props.isLoading && filteredOptions.length, () =>
        this.renderOptions?.(props, api),
      )}
    </div>`
  },

  /**
   * Render search input.
   * @param {ComboboxProps} props
   * @param {Api} api
   * @returns {TemplateResult}
   */
  renderSearchInput(props, api) {
    return html`<input
      class="iw-combobox-dropdown-search"
      type="text"
      placeholder="Search..."
      .value=${props.searchTerm ?? ""}
      @input=${(event) =>
        api.notify(`#${props.id}:searchChange`, event.target.value)}
      @keydown=${(event) => handleKeyDown(props, event, api)}
      ${ref((el) => {
        if (el && props.isOpen) queueMicrotask(() => el.focus())
      })}
    />`
  },

  /**
   * Render options list.
   * @param {ComboboxProps} props
   * @param {Api} api
   * @returns {TemplateResult}
   */
  renderOptions(props, api) {
    const filteredOptions = filterOptions(props.options, props.searchTerm)

    return html`<div class="iw-combobox-dropdown-options">
      ${repeat(
        filteredOptions,
        (option) => getOptionValue(option),
        (option, index) => this.renderOption?.(props, { option, index }, api),
      )}
    </div>`
  },

  /**
   * Render an option row.
   * @param {ComboboxProps} props
   * @param {{ option: ComboboxOption, index: number }} payload
   * @param {Api} api
   * @returns {TemplateResult}
   */
  renderOption(props, { option, index }, api) {
    const normalized = formatOption(option)
    const isSelected = isOptionSelected(
      option,
      props.selectedValue,
      props.isMulti,
    )
    const isFocused = index === props.focusedIndex

    return html`<div
      class="iw-combobox-dropdown-options-option ${classMap({
        "iw-combobox-dropdown-options-option-selected": isSelected,
        "iw-combobox-dropdown-options-option-focused": isFocused,
        "iw-combobox-dropdown-options-option-disabled": !!normalized.disabled,
      })}"
      @click=${() => {
        if (normalized.disabled) return
        api.notify(`#${props.id}:optionSelect`, normalized)
        props.onChange?.(normalized)
      }}
      @mouseenter=${() => api.notify(`#${props.id}:focusSet`, index)}
    >
      ${when(
        props.isMulti,
        () =>
          html`<input
            type="checkbox"
            .checked=${isSelected}
            ?disabled=${!!normalized.disabled}
          />`,
      )}
      <span>${getOptionLabel(normalized)}</span>
    </div>`
  },

  /**
   * Render loading state.
   * @param {ComboboxProps} props
   * @returns {TemplateResult}
   */
  renderLoading(props) {
    return html`<div class="iw-combobox-loading">${props.loadingMessage}</div>`
  },

  /**
   * Render no options state.
   * @param {ComboboxProps} props
   * @returns {TemplateResult}
   */
  renderNoOptions(props) {
    return html`<div class="iw-combobox-no-options">
      ${props.noOptionsMessage}
    </div>`
  },
}

/**
 * Handle key navigation.
 * @param {ComboboxProps} props
 * @param {KeyboardEvent} event
 * @param {Api} api
 */
function handleKeyDown(props, event, api) {
  const filteredOptions = filterOptions(props.options, props.searchTerm)

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault()
      api.notify(`#${props.id}:focusNext`)
      break
    case "ArrowUp":
      event.preventDefault()
      api.notify(`#${props.id}:focusPrev`)
      break
    case "Enter":
      event.preventDefault()
      if (
        props.focusedIndex > NO_FOCUSED_INDEX &&
        filteredOptions[props.focusedIndex]
      ) {
        const option = formatOption(filteredOptions[props.focusedIndex])
        if (!option.disabled) {
          api.notify(`#${props.id}:optionSelect`, option)
          props.onChange?.(option)
        }
      }
      break
    case "Escape":
      event.preventDefault()
      api.notify(`#${props.id}:close`)
      break
    case "Home":
      event.preventDefault()
      api.notify(`#${props.id}:focusFirst`)
      break
    case "End":
      event.preventDefault()
      api.notify(`#${props.id}:focusLast`)
      break
    default:
      break
  }
}
