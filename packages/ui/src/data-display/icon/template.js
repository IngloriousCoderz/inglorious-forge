/**
 * @typedef {import('../../../types/data-display/icon').IconProps} IconProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html } from "@inglorious/web"

/**
 * Renders an inline icon element with size and color control.
 * Use it for custom SVG, emoji, or font-based glyphs.
 * @param {IconProps} props
 * @returns {TemplateResult}
 */
export function render({ children, size = "md", color = "current", onClick }) {
  return html`<span
    class=${classMap({
      "iw-icon": true,
      [`iw-icon-${size}`]: size !== "md",
      "iw-icon-current": color === "current",
    })}
    style=${color !== "current" ? `color: ${color};` : ""}
    aria-hidden="true"
    @click=${onClick}
    >${children}</span
  >`
}
