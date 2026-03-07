/**
 * @typedef {import('../../../types/feedback/alert').AlertProps} AlertProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

/**
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
    ${icon ? html`<div class="iw-alert-icon">${icon}</div>` : null}
    <div class="iw-alert-content">
      ${title ? html`<div class="iw-alert-title">${title}</div>` : null}
      ${content
        ? html`<div class="iw-alert-description">${content}</div>`
        : null}
    </div>
    ${hasTrailing
      ? html`<div class="iw-alert-trailing">
          ${action ? html`<div class="iw-alert-action">${action}</div>` : null}
          ${onClose
            ? html`<button
                type="button"
                class="iw-alert-close"
                aria-label="Dismiss"
                @click=${onClose}
              >
                ×
              </button>`
            : null}
        </div>`
      : null}
  </div>`
}
