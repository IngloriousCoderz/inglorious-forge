/**
 * @typedef {import('../../../types/controls/textarea').TextareaProps} TextareaProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html, nothing } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { ref } from "@inglorious/web/directives/ref"
import { when } from "@inglorious/web/directives/when"

import { applyElementProps } from "../../shared/apply-element-props.js"
import { fallbackLabel } from "../../shared/fallback-label.js"

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
    ariaLabel,
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
    onKeyDown,
    ...rest
  } = props

  const textareaId = id || name
  const messageId = (error || hint) && id ? `${id}-message` : ""

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
      ${when(
        label,
        () => html`
          <label for=${textareaId || nothing} class="iw-textarea-label">
            ${label}
            ${when(
              isRequired,
              () => html`<span class="iw-textarea-required">*</span>`,
            )}
          </label>
        `,
      )}

      <textarea
        id=${textareaId || nothing}
        name=${name}
        aria-label=${ariaLabel || fallbackLabel(textareaId, label)}
        aria-describedby=${messageId || nothing}
        aria-invalid=${error ? "true" : "false"}
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
        @keydown=${onKeyDown}
        ${ref((element) => applyElementProps(element, rest))}
      ></textarea>

      ${when(
        error,
        () =>
          html`<span
            id=${messageId || nothing}
            class="iw-textarea-error-message"
            >${error}</span
          >`,
        () =>
          when(
            hint,
            () =>
              html`<span id=${messageId || nothing} class="iw-textarea-hint"
                >${hint}</span
              >`,
          ),
      )}
    </div>
  `
}
