/**
 * @typedef {import('../../../types/controls/combobox.js').ComboboxProps} ComboboxProps
 * @typedef {import('../../../types/controls/combobox.js').ComboboxOption} ComboboxOption
 * @typedef {import('../../../types/controls/combobox.js').ComboboxOptionGroup} ComboboxOptionGroup
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html, nothing } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { ref } from "@inglorious/web/directives/ref"
import { repeat } from "@inglorious/web/directives/repeat"
import { when } from "@inglorious/web/directives/when"

import { Chip } from "../../data-display/chip/index.js"
import { anchorFallback } from "../../shared/anchor.js"
import { fallbackLabel } from "../../shared/fallback-label.js"
import { liveBoolean } from "../../shared/live-boolean.js"
import { syncPopover } from "../../shared/top-layer.js"
import {
  flattenOptions,
  formatOption,
  getOptionLabel,
  getOptionValue,
  groupedVisibleOptions,
  isOptionGroup,
  isOptionSelected,
  visibleOptions,
} from "./helpers.js"

const NO_FOCUSED_INDEX = -1

export const template = {
  /**
   * Main entrypoint for the combobox control. It renders the frame, label, control, and dropdown when open.
   * Comboboxes support search, single or multi-select values, and clearable selection.
   * @param {ComboboxProps} props
   * @returns {TemplateResult}
   */
  render(props) {
    return this.renderCombobox(props)
  },

  /**
   * Main entrypoint for the combobox control. It renders the frame, label, control, and dropdown when open.
   * Comboboxes support search, single or multi-select values, and clearable selection.
   * @param {ComboboxProps} props
   * @returns {TemplateResult}
   */
  renderCombobox(props) {
    const {
      id,
      type, // eslint-disable-line no-unused-vars
      label,
      hint,
      error,
      isRequired = false,
      isFullWidth = false,
      isOpen = false,
    } = props
    const labelId = label && id ? `${id}-label` : ""
    const messageId = (error || hint) && id ? `${id}-message` : ""

    const comboboxClasses = {
      "iw-combobox": true,
      "iw-combobox-full-width": !!isFullWidth,
    }

    return html`<div class=${classMap(comboboxClasses)}>
      ${when(
        label,
        () =>
          html`<label id=${labelId || nothing} class="iw-combobox-label">
            ${label}
            ${when(
              isRequired,
              () => html`<span class="iw-combobox-required">*</span>`,
            )}
          </label>`,
      )}
      ${this.renderControl?.({ ...props, labelId, messageId })}
      ${when(isOpen, () => this.renderDropdown?.(props))}
      ${when(
        error,
        () =>
          html`<span
            id=${messageId || nothing}
            class="iw-combobox-error-message"
            >${error}</span
          >`,
      )}
      ${when(
        !error && hint,
        () =>
          html`<span id=${messageId || nothing} class="iw-combobox-hint"
            >${hint}</span
          >`,
      )}
    </div>`
  },

  /**
   * Renders the clickable control element that shows the current selection and toggles the dropdown.
   * Handles placeholder, clear button, and the open/disabled state.
   *
   * The control is the only way into a closed combobox, so it has to be
   * focusable: it was a plain div with a click handler, which meant tabbing
   * skipped the field entirely and none of the keyboard handling was reachable.
   * It keeps focus while the dropdown is open unless a search input takes it.
   * @param {ComboboxProps} props
   * @returns {TemplateResult}
   */
  renderControl(props) {
    const {
      id,
      label,
      labelId,
      messageId,
      selectedValue,
      error,
      size = "md",
      isDisabled = false,
      isRequired = false,
      isOpen = false,
      isMulti = false,
      isClearable = false,
      onToggle,
      onClear,
    } = props

    const controlId = id ? `${id}-control` : ""

    const frameClasses = {
      "iw-combobox-frame": true,
      [`iw-combobox-${size}`]: true,
      "iw-combobox-frame-open": isOpen,
      "iw-combobox-frame-disabled": isDisabled,
      "iw-combobox-frame-error": !!error,
      "iw-combobox-frame-selection":
        isMulti && Array.isArray(selectedValue) && selectedValue.length,
    }

    return html`<div
      id=${controlId || nothing}
      class="${classMap(frameClasses)}"
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded=${isOpen ? "true" : "false"}
      aria-controls=${controlId ? `${controlId}-listbox` : nothing}
      aria-labelledby=${labelId || nothing}
      aria-label=${fallbackLabel(labelId, label)}
      aria-describedby=${messageId || nothing}
      aria-required=${isRequired ? "true" : "false"}
      aria-invalid=${error ? "true" : "false"}
      aria-disabled=${isDisabled ? "true" : nothing}
      tabindex=${isDisabled ? -1 : 0}
      @keydown=${(event) => handleControlKeyDown(props, event)}
      @click=${() => !isDisabled && onToggle?.()}
    >
      ${when(
        isMulti,
        () => this.renderMultiValue?.(props),
        () => this.renderSingleValue?.(props),
      )}
      ${when(
        isClearable &&
          ((isMulti && Array.isArray(selectedValue) && selectedValue.length) ||
            (!isMulti && selectedValue !== null)),
        () =>
          html`<button
            class="iw-combobox-clear"
            type="button"
            @click=${(event) => {
              event.stopPropagation()
              onClear?.()
            }}
          >
            ×
          </button>`,
      )}

      <span class="iw-combobox-arrow" aria-hidden="true">▼</span>
    </div>`
  },

  /**
   * Renders the currently selected value in single-select mode.
   * Falls back to the placeholder when no value is selected.
   * @param {ComboboxProps} props
   * @returns {TemplateResult}
   */
  renderSingleValue(props) {
    const { options, selectedValue, placeholder } = props

    if (selectedValue === null) {
      return html`<span class="iw-combobox-control iw-combobox-placeholder"
        >${placeholder}</span
      >`
    }

    const selectedOption = flattenOptions(options).find(
      (option) => getOptionValue(option) === selectedValue,
    )

    return html`<span class="iw-combobox-control iw-combobox-value"
      >${
        selectedOption ? getOptionLabel(selectedOption) : String(selectedValue)
      }</span
    >`
  },

  /**
   * Renders the selected values in multi-select mode as a row of tags.
   * Falls back to the placeholder when the selection is empty.
   * @param {ComboboxProps} props
   * @returns {TemplateResult}
   */
  renderMultiValue(props) {
    const { selectedValue, placeholder } = props

    if (!Array.isArray(selectedValue) || !selectedValue.length) {
      return html`<span class="iw-combobox-control iw-combobox-placeholder"
        >${placeholder}</span
      >`
    }

    return html`<div class="iw-combobox-control iw-combobox-multi-value">
      ${repeat(
        selectedValue,
        (value) => value,
        (value) => this.renderMultiValueTag?.(props, value),
      )}
    </div>`
  },

  /**
   * Renders a single selected tag in multi-select mode.
   * Used to customize chip styling and remove behavior.
   * @param {ComboboxProps} props
   * @param {string|number} value
   * @returns {TemplateResult}
   */
  renderMultiValueTag(props, value) {
    const { id, options, size, onOptionSelect, onChange } = props
    const option =
      flattenOptions(options).find((opt) => getOptionValue(opt) === value) ??
      value

    const tagId = id ? `${id}-tag-${String(value)}` : undefined
    const chipSize = size === "lg" ? "md" : "sm"

    return html`<span
      class="iw-combobox-multi-value-tag"
      @click=${(event) => {
        if (event.target.closest(".iw-chip-remove")) event.stopPropagation()
      }}
    >
      ${Chip.render({
        id: tagId,
        children: getOptionLabel(option),
        isRemovable: true,
        size: chipSize,
        shape: "rounded",
        onClick: () => {
          onOptionSelect?.(option)
          onChange?.(option)
        },
      })}
    </span>`
  },

  /**
   * Renders the dropdown panel that contains search input, options, and empty/loading states.
   * Shown only when the combobox is open, as a popover in the top layer so no
   * container can clip it, anchored under the control by CSS.
   *
   * A manual popover: the control that opens it is not a button, so it cannot
   * be the popover's invoker, and a light dismiss would close the dropdown on
   * the very press that toggles it. Outside presses and Esc are handled here.
   * @param {ComboboxProps} props
   * @returns {TemplateResult}
   */
  renderDropdown(props) {
    const { id, isSearchable, isLoading } = props

    const filteredOptions = visibleOptions(props)

    return html`<div
      id=${id ? `${id}-control-listbox` : nothing}
      class="iw-combobox-dropdown"
      role="listbox"
      popover="manual"
      ${ref((el) => {
        anchorFallback(el, {
          getAnchor: () =>
            el?.closest(".iw-combobox")?.querySelector(".iw-combobox-frame"),
          placement: "bottom-start",
          isWidthMatched: true,
        })
        syncPopover(el, { isOpen: true })
        trackOutsideClick(props, el)
      })}
    >
      ${when(isSearchable, () => this.renderSearchInput?.(props))}
      ${when(isLoading, () => this.renderLoading?.(props))}
      ${when(!isLoading && !filteredOptions.length, () =>
        this.renderNoOptions?.(props),
      )}
      ${when(!isLoading && filteredOptions.length, () =>
        this.renderOptions?.(props),
      )}
    </div>`
  },

  /**
   * Renders the optional search input used to filter options.
   * Emits search change events as the user types.
   * @param {ComboboxProps} props
   * @returns {TemplateResult}
   */
  renderSearchInput(props) {
    const {
      searchTerm,
      searchPlaceholder = "Search...",
      isOpen,
      onSearchChange,
    } = props

    return html`<input
      class="iw-combobox-dropdown-search"
      type="text"
      placeholder=${searchPlaceholder}
      .value=${searchTerm ?? ""}
      @input=${(event) => onSearchChange?.(event.target.value)}
      @keydown=${(event) => handleKeyDown(props, event)}
      ${ref((el) => {
        if (el && isOpen) queueMicrotask(() => el.focus())
      })}
    />`
  },

  /**
   * Renders the list of available options in the dropdown.
   * Delegates each option to `renderOption` and each group to
   * `renderOptionGroup` for customization.
   * @param {ComboboxProps} props
   * @returns {TemplateResult}
   */
  renderOptions(props) {
    let index = 0
    const entries = groupedVisibleOptions(props).map((entry) => {
      const startIndex = index
      index += isOptionGroup(entry) ? entry.options.length : 1
      return { entry, startIndex }
    })

    return html`<div class="iw-combobox-dropdown-options">
      ${repeat(
        entries,
        ({ entry }) =>
          isOptionGroup(entry)
            ? `group:${entry.label}`
            : `option:${getOptionValue(entry)}`,
        ({ entry, startIndex }) =>
          isOptionGroup(entry)
            ? this.renderOptionGroup?.(props, { group: entry, startIndex })
            : this.renderOption?.(props, { option: entry, index: startIndex }),
      )}
    </div>`
  },

  /**
   * Renders a group of options under its heading, which is not an option.
   * @param {ComboboxProps} props
   * @param {{ group: ComboboxOptionGroup, startIndex: number }} payload
   * @returns {TemplateResult}
   */
  renderOptionGroup(props, { group, startIndex }) {
    const headingId = props.id ? `${props.id}-group-${startIndex}` : undefined

    return html`<div
      class="iw-combobox-dropdown-options-group"
      role="group"
      aria-labelledby=${headingId ?? nothing}
      aria-label=${headingId ? nothing : group.label}
    >
      <div
        id=${headingId ?? nothing}
        class="iw-combobox-dropdown-options-group-label"
        role="presentation"
      >
        ${group.label}
      </div>
      ${repeat(
        group.options,
        (option) => getOptionValue(option),
        (option, offset) =>
          this.renderOption?.(props, { option, index: startIndex + offset }),
      )}
    </div>`
  },

  /**
   * Renders a single option row, including selection and focus styling.
   * Handles click/selection for the option.
   * @param {ComboboxProps} props
   * @param {{ option: ComboboxOption, index: number }} payload
   * @returns {TemplateResult}
   */
  renderOption(props, { option, index }) {
    const {
      id,
      selectedValue,
      focusedIndex,
      isMulti,
      onOptionSelect,
      onChange,
      onFocusSet,
    } = props

    const normalized = formatOption(option)
    const isSelected = isOptionSelected(option, selectedValue, isMulti)
    const isFocused = index === focusedIndex

    return html`<div
      id=${id ? `${id}-option-${index}` : nothing}
      role="option"
      aria-selected=${isSelected ? "true" : "false"}
      class="iw-combobox-dropdown-options-option ${classMap({
        "iw-combobox-dropdown-options-option-selected": isSelected,
        "iw-combobox-dropdown-options-option-focused": isFocused,
        "iw-combobox-dropdown-options-option-disabled": !!normalized.isDisabled,
      })}"
      @click=${() => {
        if (normalized.isDisabled) return
        onOptionSelect?.(normalized)
        onChange?.(normalized)
      }}
      @mouseenter=${() => onFocusSet?.(index)}
    >
      ${when(
        isMulti && !normalized.isCreated,
        () =>
          html`<input
            type="checkbox"
            ?checked=${isSelected}
            ${liveBoolean("checked", isSelected)}
            ?disabled=${!!normalized.isDisabled}
          />`,
      )}
      <span>${getOptionLabel(normalized)}</span>
    </div>`
  },

  /**
   * Renders the loading state shown while options are being fetched or filtered.
   * Displayed when `isLoading` is true.
   * @param {ComboboxProps} props
   * @returns {TemplateResult}
   */
  renderLoading(props) {
    const { loadingMessage } = props

    return html`<div class="iw-combobox-loading">${loadingMessage}</div>`
  },

  /**
   * Renders the empty state when no options match the search or list is empty.
   * Uses the `noOptionsMessage` prop when provided.
   * @param {ComboboxProps} props
   * @returns {TemplateResult}
   */
  renderNoOptions(props) {
    const { noOptionsMessage } = props
    return html`<div class="iw-combobox-no-options">${noOptionsMessage}</div>`
  },
}

/**
 * Opens a closed combobox from the keyboard, and navigates an open one.
 *
 * The control keeps DOM focus whenever the combobox is not searchable — there
 * is no search input to hand focus to — so while open it drives the same
 * navigation handleKeyDown() gives the search input, rather than toggling.
 * @param {ComboboxProps} props
 * @param {KeyboardEvent} event
 */
function handleControlKeyDown(props, event) {
  const { isDisabled, isOpen, onToggle } = props

  // The keys of a tag's remove button or the clear button are their own.
  if (isDisabled || event.target.closest?.("button")) return

  if (isOpen) {
    handleKeyDown(props, event)
    return
  }

  if (event.key !== "Enter" && event.key !== " " && event.key !== "ArrowDown") {
    return
  }
  // Space would otherwise scroll the page out from under the dropdown.
  event.preventDefault()
  onToggle?.()
}

/**
 * Handle key navigation.
 * @param {ComboboxProps} props
 * @param {KeyboardEvent} event
 */
function handleKeyDown(props, event) {
  const {
    focusedIndex,
    onFocusFirst,
    onFocusPrev,
    onFocusNext,
    onFocusLast,
    onOptionSelect,
    onChange,
    onClose,
  } = props

  const filteredOptions = visibleOptions(props)

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault()
      onFocusNext?.()
      break
    case "ArrowUp":
      event.preventDefault()
      onFocusPrev?.()
      break
    case "Enter":
      event.preventDefault()
      if (focusedIndex > NO_FOCUSED_INDEX && filteredOptions[focusedIndex]) {
        const option = formatOption(filteredOptions[focusedIndex])
        if (!option.isDisabled) {
          onOptionSelect?.(option)
          onChange?.(option)
        }
      }
      break
    case "Escape":
      event.preventDefault()
      onClose?.()
      break
    case "Home":
      event.preventDefault()
      onFocusFirst?.()
      break
    case "End":
      event.preventDefault()
      onFocusLast?.()
      break
    default:
      break
  }
}

/**
 * Registered outside-pointer listeners, keyed by the dropdown element they
 * belong to. Used only to deduplicate: the ref callback is handed a fresh arrow
 * on every re-render, so without this each pass would stack another listener on
 * the document.
 * @type {WeakMap<Element, { props: ComboboxProps, listener: (event: Event) => void }>}
 */
const outsideListeners = new WeakMap()

/**
 * Listen on the document for presses outside the dropdown, closing it when one
 * happens.
 *
 * This listens for `pointerdown` rather than `click` on purpose. Mobile browsers
 * synthesise `click` asynchronously after `touchend`, and drop it entirely when
 * the touch drifts into a scroll gesture or the target is replaced meanwhile.
 * A suppressed click would leave the listener armed, and it would then close the
 * *next* dropdown on the tap that opened it, leaving the combobox looking stuck.
 * `pointerdown` is dispatched synchronously for mouse, touch and pen.
 *
 * No id is needed: the element keys the listener, and it retires itself once its
 * dropdown has left the DOM.
 * @param {ComboboxProps} props
 * @param {Element|null|undefined} el dropdown element, or undefined on unmount
 */
function trackOutsideClick(props, el) {
  if (!el) return

  const existing = outsideListeners.get(el)
  if (existing) {
    existing.props = props
    return
  }

  const entry = { props }
  entry.listener = (event) => {
    if (!el.isConnected) {
      document.removeEventListener("pointerdown", entry.listener)
      return
    }

    const root = el.closest(".iw-combobox") ?? el
    if (!event.composedPath().includes(root)) entry.props.onClose?.()
  }

  outsideListeners.set(el, entry)
  document.addEventListener("pointerdown", entry.listener)
}
