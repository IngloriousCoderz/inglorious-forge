/**
 * @typedef {import('../../../types/controls/input').InputProps} InputProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html, nothing } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { ref } from "@inglorious/web/directives/ref"
import { when } from "@inglorious/web/directives/when"

import { Icon } from "../../data-display/icon/index.js"
import { applyElementProps } from "../../shared/apply-element-props.js"
import { fallbackLabel } from "../../shared/fallback-label.js"

/**
 * Renders a labeled input field with optional icons, hint text, and error messaging.
 * Supports disabled/readonly/required states and emits `onChange` on input.
 * @example
 * // Stateless usage
 * input.render({ label: 'Email', inputType: 'email', placeholder: 'you@example.com' })
 *
 * @param {InputProps} props
 * @returns {TemplateResult}
 */
export const Input = {
  render(props) {
    return this.renderInput(props)
  },

  renderInput(props) {
    const {
      id,
      type, // eslint-disable-line no-unused-vars
      name = "",
      label,
      hint,
      error,
      isDisabled = false,
      isRequired = false,
      isFullWidth = false,
      icon,
      iconAfter,
    } = props

    const controlId = id || name
    const messageId = (error || hint) && id ? `${id}-message` : ""

    const inputClasses = {
      "iw-input": true,
      "iw-input-full-width": isFullWidth,
      "iw-input-disabled": isDisabled,
      "iw-input-has-error": !!error,
      "iw-input-has-icon": !!icon,
      "iw-input-has-icon-after": !!iconAfter,
    }

    return html`
      <div class=${classMap(inputClasses)}>
        ${when(
          label,
          () => html`
            <label for=${controlId || nothing} class="iw-input-label">
              ${label}
              ${when(
                isRequired,
                () => html`<span class="iw-input-required">*</span>`,
              )}
            </label>
          `,
        )}
        ${this.renderControl?.({ ...props, messageId })}
        ${when(
          error,
          () =>
            html`<span id=${messageId || nothing} class="iw-input-error-message"
              >${error}</span
            >`,
        )}
        ${when(
          !error && hint,
          () =>
            html`<span id=${messageId || nothing} class="iw-input-hint"
              >${hint}</span
            >`,
        )}
      </div>
    `
  },

  renderControl(props) {
    const {
      id,
      type, // eslint-disable-line no-unused-vars
      name = "",
      label,
      hint, // eslint-disable-line no-unused-vars
      messageId,
      inputType = "text",
      value = "",
      placeholder = "",
      error,
      size = "md",
      isDisabled = false,
      isReadOnly = false,
      isRequired = false,
      isFullWidth, // eslint-disable-line no-unused-vars
      icon,
      iconAfter,
      onChange,
      onBlur,
      onFocus,
      ...rest
    } = props

    const controlId = id || name

    const controlClasses = {
      "iw-input-control": true,
      [`iw-input-${size}`]: true,
      "iw-input-control-disabled": isDisabled,
      "iw-input-control-error": !!error,
      "iw-input-number": inputType === "number",
    }

    return html`<div class="iw-input-frame">
      ${when(icon, () => Icon.render({ children: icon, color: "var(--iw-color-text-muted)", size }))}

      <input
        id=${controlId || nothing}
        name=${name}
        type=${inputType}
        aria-label=${fallbackLabel(controlId, label)}
        aria-describedby=${messageId || nothing}
        aria-invalid=${error ? "true" : "false"}
        .value=${value}
        placeholder=${placeholder}
        ?disabled=${isDisabled}
        ?readonly=${isReadOnly}
        ?required=${isRequired}
        class=${classMap(controlClasses)}
        @input=${(event) => onChange?.(event.target.value)}
        @blur=${onBlur}
        @focus=${onFocus}
        ${ref((element) => applyElementProps(element, rest))}
      />

      ${when(iconAfter, () => Icon.render({ children: iconAfter, color: "var(--iw-color-text-muted)", size }))}
    </div>`
  },
}
