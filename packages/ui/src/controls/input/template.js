/**
 * @typedef {import('../../../types/controls/input').InputProps} InputProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { ref } from "@inglorious/web/directives/ref"

import { applyElementProps } from "../../shared/applyElementProps.js"

/**
 * Renders a labeled input field with optional icons, hint text, and error messaging.
 * Supports disabled/readonly/required states and emits `onChange` on input.
 * @example
 * // Stateless usage
 * input.render({ label: 'Email', type: 'email', placeholder: 'you@example.com' })
 *
 * @param {InputProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    id,
    type, // eslint-disable-line no-unused-vars
    name = "",
    inputType = "text",
    value = "",
    placeholder = "",
    label,
    hint,
    error,
    size = "md",
    isDisabled = false,
    isReadOnly = false,
    isRequired = false,
    isFullWidth = false,
    icon,
    iconAfter,
    onChange,
    onBlur,
    onFocus,
    ...rest
  } = props

  const inputId = id || name

  const wrapperClasses = {
    "iw-input-field": true,
    "iw-input-full-width": isFullWidth,
    "iw-input-disabled": isDisabled,
    "iw-input-has-error": !!error,
    "iw-input-has-icon": !!icon,
    "iw-input-has-icon-after": !!iconAfter,
  }

  const inputClasses = {
    "iw-input": true,
    [`iw-input-${size}`]: size !== "md",
    "iw-input-error": !!error,
    "iw-input-number": inputType === "number",
  }

  return html`
    <div class=${classMap(wrapperClasses)}>
      ${label
        ? html`
            <label for=${inputId} class="iw-input-label">
              ${label}
              ${isRequired
                ? html`<span class="iw-input-required">*</span>`
                : null}
            </label>
          `
        : null}

      <div class="iw-input-frame">
        ${icon ? html`<span class="iw-input-icon">${icon}</span>` : null}

        <input
          id=${inputId}
          name=${name}
          type=${inputType}
          .value=${value}
          placeholder=${placeholder}
          ?disabled=${isDisabled}
          ?readonly=${isReadOnly}
          ?required=${isRequired}
          class=${classMap(inputClasses)}
          @input=${(event) => onChange?.(event.target.value)}
          @blur=${onBlur}
          @focus=${onFocus}
          ${ref((element) => applyElementProps(element, rest))}
        />

        ${iconAfter
          ? html`<span class="iw-input-icon iw-input-icon-after"
              >${iconAfter}</span
            >`
          : null}
      </div>

      ${error
        ? html`<span class="iw-input-error-message">${error}</span>`
        : hint
          ? html`<span class="iw-input-hint">${hint}</span>`
          : null}
    </div>
  `
}
