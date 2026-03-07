/**
 * @typedef {import('../../../types/feedback/backdrop').BackdropProps} BackdropProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html } from "@inglorious/web"

/**
 * @param {BackdropProps} props
 * @returns {TemplateResult | null}
 */
export function render(props) {
  const { open = false, className = "", onClick, children } = props

  if (!open) return null

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
    <div class="iw-backdrop-content">${children}</div>
  </div>`
}
