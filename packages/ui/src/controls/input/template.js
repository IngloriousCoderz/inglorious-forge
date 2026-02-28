/**
 * @typedef {import('../../../types/controls/input').InputProps} InputProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

/**
 * Input component for Inglorious Web.
 *
 * @example
 * // Stateless usage
 * input.render({ label: 'Email', type: 'email', placeholder: 'you@example.com' }, api)
 *
 * @example
 * // Stateful usage with event handling
 * // Entity: { type: 'input', id: 'emailInput', label: 'Email' }
 * // In store: api.render('emailInput')
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
    disabled = false,
    readonly = false,
    required = false,
    fullWidth = false,
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
    "iw-input-full-width": fullWidth,
    "iw-input-disabled": disabled,
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
              ${required
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
          ?disabled=${disabled}
          ?readonly=${readonly}
          ?required=${required}
          class=${classMap(inputClasses)}
          @input=${(event) => onChange?.(event.target.value)}
          @blur=${() => onBlur?.()}
          @focus=${() => onFocus?.()}
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
