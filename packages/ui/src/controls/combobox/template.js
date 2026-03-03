/**
 * @typedef {import('../../../types/controls/combobox.js').ComboboxProps} ComboboxProps
 * @typedef {import('../../../types/controls/combobox.js').ComboboxOption} ComboboxOption
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
   * @returns {TemplateResult}
   */
  render(props) {
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
      ${this.renderControl?.(props)}
      ${when(props.isOpen, () => this.renderDropdown?.(props))}
    </div>`
  },

  /**
   * Render trigger control.
   * @param {ComboboxProps} props
   * @returns {TemplateResult}
   */
  renderControl(props) {
    return html`<div
      class="iw-combobox-control ${classMap({
        "iw-combobox-control-open": props.isOpen,
        "iw-combobox-control-disabled": props.isDisabled,
        "iw-combobox-control-selection":
          props.isMulti &&
          Array.isArray(props.selectedValue) &&
          props.selectedValue.length,
      })}"
      @click=${() => !props.isDisabled && props.onToggle?.()}
    >
      ${when(
        props.isMulti,
        () => this.renderMultiValue?.(props),
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
   * @returns {TemplateResult}
   */
  renderMultiValue(props) {
    if (!Array.isArray(props.selectedValue) || !props.selectedValue.length) {
      return html`<span class="iw-combobox-placeholder"
        >${props.placeholder}</span
      >`
    }

    return html`<div class="iw-combobox-multi-value">
      ${repeat(
        props.selectedValue,
        (value) => value,
        (value) => this.renderMultiValueTag?.(props, value),
      )}
    </div>`
  },

  /**
   * Render a selected multi-value tag.
   * @param {ComboboxProps} props
   * @param {string|number} value
   * @returns {TemplateResult}
   */
  renderMultiValueTag(props, value) {
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
          props.onOptionSelect?.(option)
          props.onChange?.(option)
        },
      })}
    </span>`
  },

  /**
   * Render dropdown.
   * @param {ComboboxProps} props
   * @returns {TemplateResult}
   */
  renderDropdown(props) {
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
                  props.onClose?.()
                }
              },
              { once: true },
            )
          })
        }
      })}
    >
      ${when(props.isSearchable, () => this.renderSearchInput?.(props))}
      ${when(props.isLoading, () => this.renderLoading?.(props))}
      ${when(!props.isLoading && !filteredOptions.length, () =>
        this.renderNoOptions?.(props),
      )}
      ${when(!props.isLoading && filteredOptions.length, () =>
        this.renderOptions?.(props),
      )}
    </div>`
  },

  /**
   * Render search input.
   * @param {ComboboxProps} props
   * @returns {TemplateResult}
   */
  renderSearchInput(props) {
    return html`<input
      class="iw-combobox-dropdown-search"
      type="text"
      placeholder="Search..."
      .value=${props.searchTerm ?? ""}
      @input=${(event) => props.onSearchChange?.(event.target.value)}
      @keydown=${(event) => handleKeyDown(props, event)}
      ${ref((el) => {
        if (el && props.isOpen) queueMicrotask(() => el.focus())
      })}
    />`
  },

  /**
   * Render options list.
   * @param {ComboboxProps} props
   * @returns {TemplateResult}
   */
  renderOptions(props) {
    const filteredOptions = filterOptions(props.options, props.searchTerm)

    return html`<div class="iw-combobox-dropdown-options">
      ${repeat(
        filteredOptions,
        (option) => getOptionValue(option),
        (option, index) => this.renderOption?.(props, { option, index }),
      )}
    </div>`
  },

  /**
   * Render an option row.
   * @param {ComboboxProps} props
   * @param {{ option: ComboboxOption, index: number }} payload
   * @returns {TemplateResult}
   */
  renderOption(props, { option, index }) {
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
        props.onOptionSelect?.(normalized)
        props.onChange?.(normalized)
      }}
      @mouseenter=${() => props.onFocusSet?.(index)}
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
 */
function handleKeyDown(props, event) {
  const filteredOptions = filterOptions(props.options, props.searchTerm)

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault()
      props.onFocusNext?.()
      break
    case "ArrowUp":
      event.preventDefault()
      props.onFocusPrev?.()
      break
    case "Enter":
      event.preventDefault()
      if (
        props.focusedIndex > NO_FOCUSED_INDEX &&
        filteredOptions[props.focusedIndex]
      ) {
        const option = formatOption(filteredOptions[props.focusedIndex])
        if (!option.disabled) {
          props.onOptionSelect?.(option)
          props.onChange?.(option)
        }
      }
      break
    case "Escape":
      event.preventDefault()
      props.onClose?.()
      break
    case "Home":
      event.preventDefault()
      props.onFocusFirst?.()
      break
    case "End":
      event.preventDefault()
      props.onFocusLast?.()
      break
    default:
      break
  }
}
