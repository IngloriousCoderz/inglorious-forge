/**
 * @typedef {import('../../../types/feedback/dialog').DialogProps} DialogProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"

/**
 * Renders a modal dialog with header, body, and actions when open.
 * Clicking the backdrop can close the dialog when handlers are provided.
 * @param {DialogProps} props
 * @returns {TemplateResult | null}
 */
export function render(props) {
  const {
    isOpen = false,
    title,
    description,
    children,
    actions,
    className = "",
    onClose,
    onBackdropClick,
  } = props

  if (!isOpen) return null

  const extraClasses = Object.fromEntries(
    className
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => [name, true]),
  )

  return html`<div
    class=${classMap({ "iw-dialog-backdrop": true })}
    @click=${onBackdropClick ?? onClose}
  >
    <div
      class=${classMap({ "iw-dialog": true, ...extraClasses })}
      role="dialog"
      aria-modal="true"
      @click=${(event) => event.stopPropagation()}
    >
      ${(title || onClose) &&
      html`<div class="iw-dialog-header">
        ${title ? html`<div class="iw-dialog-title">${title}</div>` : null}
        ${onClose
          ? html`<button
              type="button"
              class="iw-dialog-close"
              aria-label="Close"
              @click=${onClose}
            >
              ×
            </button>`
          : null}
      </div>`}
      ${description
        ? html`<div class="iw-dialog-description">${description}</div>`
        : null}
      ${children ? html`<div class="iw-dialog-body">${children}</div>` : null}
      ${actions ? html`<div class="iw-dialog-actions">${actions}</div>` : null}
    </div>
  </div>`
}
