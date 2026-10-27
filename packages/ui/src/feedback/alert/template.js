/**
 * @typedef {import('../../../types/feedback/alert').AlertProps} AlertProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { ref } from "@inglorious/web/directives/ref"
import { when } from "@inglorious/web/directives/when"

import { applyElementProps } from "../../shared/apply-element-props.js"

/**
 * Renders an alert message with optional title, description, icon, and actions.
 * Supports severity and variant styles for info, success, warning, error and
 * neutral, a plain note.
 * @param {AlertProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    type, // eslint-disable-line no-unused-vars
    title,
    description,
    children,
    severity = "info",
    variant = "filled",
    icon,
    action,
    onClose,
    className = "",
    ...rest
  } = props

  const extraClasses = Object.fromEntries(
    className
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => [name, true]),
  )

  const classes = {
    "iw-alert": true,
    [`iw-alert-${severity}`]: true,
    [`iw-alert-${variant}`]: true,
    ...extraClasses,
  }

  const content = description ?? children
  const hasTrailing = !!action || !!onClose

  return html`<div
    class=${classMap(classes)}
    role="alert"
    ${ref((el) => applyElementProps(el, rest))}
  >
    ${when(icon, () => html`<div class="iw-alert-icon">${icon}</div>`)}
    <div class="iw-alert-content">
      ${when(title, () => html`<div class="iw-alert-title">${title}</div>`)}
      ${when(
        content,
        () => html`<div class="iw-alert-description">${content}</div>`,
      )}
    </div>
    ${when(
      hasTrailing,
      () =>
        html`<div class="iw-alert-trailing">
          ${when(action, () => html`<div class="iw-alert-action">${action}</div>`)}
          ${when(
            onClose,
            () =>
              html`<button
                type="button"
                class="iw-alert-close"
                aria-label="Dismiss"
                @click=${onClose}
              >
                ×
              </button>`,
          )}
        </div>`,
    )}
  </div>`
}
