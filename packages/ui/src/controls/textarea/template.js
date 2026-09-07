/**
 * @typedef {import('../../../types/controls/textarea').TextareaProps} TextareaProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { ref } from "@inglorious/web/directives/ref"

import { applyElementProps } from "../../shared/applyElementProps.js"

/**
 * Renders a labeled textarea field with optional hint and error messaging.
 * Supports disabled/readonly/required states and emits `onChange` on input.
 * @param {TextareaProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    id,
    name = "",
    value = "",
    placeholder = "",
    label,
    hint,
    error,
    size = "md",
    rows = 4,
    isDisabled = false,
    isReadOnly = false,
    isRequired = false,
    isFullWidth = false,
    isAutoSize = false,
    isResizable = false,
    onChange,
    onBlur,
    onFocus,
    ...rest
  } = props

  const textareaId = id || name

  const wrapperClasses = {
    "iw-textarea-field": true,
    "iw-textarea-full-width": isFullWidth,
    "iw-textarea-disabled": isDisabled,
    "iw-textarea-has-error": !!error,
  }

  const textareaClasses = {
    "iw-textarea": true,
    [`iw-textarea-${size}`]: size !== "md",
    "iw-textarea-error": !!error,
    "iw-textarea-auto-size": isAutoSize,
    "iw-textarea-resizable": isResizable,
  }

  return html`
    <div class=${classMap(wrapperClasses)}>
      ${
        label
          ? html`
              <label for=${textareaId} class="iw-textarea-label">
                ${label}
                ${
                  isRequired
                    ? html`<span class="iw-textarea-required">*</span>`
                    : null
                }
              </label>
            `
          : null
      }

      <textarea
        id=${textareaId}
        name=${name}
        rows=${rows}
        .value=${value}
        placeholder=${placeholder}
        ?disabled=${isDisabled}
        ?readonly=${isReadOnly}
        ?required=${isRequired}
        class=${classMap(textareaClasses)}
        @input=${(event) => onChange?.(event.target.value)}
        @blur=${onBlur}
        @focus=${onFocus}
        ${ref((element) => applyElementProps(element, rest))}
      ></textarea>

      ${
        error
          ? html`<span class="iw-textarea-error-message">${error}</span>`
          : hint
            ? html`<span class="iw-textarea-hint">${hint}</span>`
            : null
      }
    </div>
  `
}
