/**
 * @typedef {import('../../../types/feedback/backdrop').BackdropProps} BackdropProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { when } from "@inglorious/web/directives/when"

/**
 * Renders a fullscreen backdrop overlay when open.
 * Optionally wraps child content in a centered container.
 * @param {BackdropProps} props
 * @returns {TemplateResult | null}
 */
export function render({ isOpen = false, className = "", onClick, children }) {
  if (!isOpen) return null

  const extraClasses = Object.fromEntries(
    className
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => [name, true]),
  )

  return html`<div
    class=${classMap({ "iw-backdrop": true, ...extraClasses })}
    @click=${onClick}
  >
    ${when(
      children,
      () => html`<div class="iw-backdrop-content">${children}</div>`,
    )}
  </div>`
}
