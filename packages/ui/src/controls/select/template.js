/**
 * @typedef {import('../../../types/controls/select').SelectProps} SelectProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html, nothing } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { repeat } from "@inglorious/web/directives/repeat"
import { when } from "@inglorious/web/directives/when"

import { Icon } from "../../data-display/icon/index.js"
import { fallbackLabel } from "../../shared/fallback-label.js"
import { formatOption, getOptionValue, isOptionSelected } from "./helpers.js"

/**
 * Opens the native dropdown when the arrow strip is pressed.
 *
 * The arrow is a sibling of the select, not an overlay on it, so a press on it
 * has no control underneath to hit. A native popup only opens from a trusted
 * gesture on the select itself, and the strip is outside it.
 *
 * `showPicker()` is the API for that. It needs transient user activation, which
 * a real click has and a dispatched event does not, and it throws rather than
 * silently doing nothing, so the fallback covers the browsers without it.
 *
 * Deliberately on `click`, not `pointerdown`: focusing from pointerdown gets
 * the focus moved away again by the browser's own mousedown handling, which
 * showed up as a focus immediately followed by a blur.
 *
 * @param {MouseEvent} event
 */
function openFromArrowStrip(event) {
  const frame = event.currentTarget
  const select = frame?.querySelector("select")
  if (!select || select.disabled || event.target === select) return

  event.preventDefault()
  if (typeof select.showPicker === "function") {
    try {
      select.showPicker()
      return
    } catch {
      // No user activation, or the popup is already showing.
    }
  }
  select.focus()
}

/**
 * Renders a styled native select control with optional single or multi-select modes.
 * Options can be primitives or objects and are rendered with consistent theming.
 * @example
 * // Stateless usage
 * select.render({ options: ['true', 'false'], value: 'true' })
 *
 * @param {SelectProps} props
 * @returns {TemplateResult}
 */
export const Select = {
  render(props) {
    return this.renderSelect(props)
  },

  renderSelect(props) {
    const {
      id,
      name,
      label,
      hint,
      error,
      isRequired = false,
      isFullWidth = false,
    } = props

    const messageId = (error || hint) && id ? `${id}-message` : ""

    const selectClasses = {
      "iw-select": true,
      "iw-select-full-width": !!isFullWidth,
    }

    return html`
      <div class=${classMap(selectClasses)}>
        ${when(
          label,
          () => html`
            <label for=${id || name || nothing} class="iw-select-label">
              ${label}
              ${
                isRequired
                  ? html`<span class="iw-select-required">*</span>`
                  : null
              }
            </label>
          `,
        )}
        ${this.renderControl?.({ ...props, messageId })}
        ${when(
          error,
          () =>
            html`<span
              id=${messageId || nothing}
              class="iw-select-error-message"
              >${error}</span
            >`,
        )}
        ${when(
          !error && hint,
          () =>
            html`<span id=${messageId || nothing} class="iw-select-hint"
              >${hint}</span
            >`,
        )}
      </div>
    `
  },

  renderControl(props) {
    const {
      id,
      name,
      label,
      messageId,
      options,
      value,
      error,
      icon,
      size = "md",
      ariaLabel,
      isOpen,
      isMulti,
      isRequired,
      isDisabled,
      onChange,
      onBlur,
      onFocus,
    } = props

    const controlId = id || name

    const controlClasses = {
      "iw-select-control": true,
      [`iw-select-${size}`]: true,
      "iw-select-control-open": isOpen,
      "iw-select-control-disabled": isDisabled,
      "iw-select-control-error": !!error,
    }

    const selectedOption = options.find(
      (option) => getOptionValue(option) === value,
    )

    return html`<div class="iw-select-frame" @click=${openFromArrowStrip}>
      ${icon ? Icon.render({ children: icon, size }) : null}

      <select
        id=${controlId || nothing}
        name=${name}
        aria-label=${ariaLabel || fallbackLabel(controlId, label)}
        aria-describedby=${messageId || nothing}
        aria-invalid=${error ? "true" : "false"}
        ?multiple=${isMulti}
        ?disabled=${isDisabled}
        ?required=${isRequired}
        class=${classMap(controlClasses)}
        @change=${(event) => onChange?.(event.target.value)}
        @blur=${onBlur}
        @focus=${onFocus}
      >
        ${repeat(
          options,
          (option) => getOptionValue(option),
          (option) => {
            const {
              value,
              label,
              isDisabled: isOptionDisabled,
            } = formatOption(option)
            const isSelected = isOptionSelected(
              option,
              selectedOption?.value,
              isMulti,
            )

            const optionClasses = {
              "iw-select-option": true,
              "iw-select-option-selected": isSelected,
            }

            return html`<option
              value=${value}
              .selected=${value === selectedOption?.value}
              ?disabled=${isOptionDisabled}
              class=${classMap(optionClasses)}
            >
              ${label}
            </option>`
          },
        )}
      </select>
      <!-- A native select can only contain options, so the arrow cannot live
             inside it. It sits on a wrapper around the select rather than the
             field, so it stays centred on the control whether or not a label,
             hint or error sits above and below it. Decorative: pointer-events
             none so clicks reach the select, and hidden from assistive tech,
             which announces a dropdown without needing the glyph. -->
      <span class="iw-select-arrow" aria-hidden="true">▼</span>
    </div>`
  },
}
