/**
 * @typedef {import('../../../types/data-display/icon').IconProps} IconProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"

/**
 * Renders an inline icon element with size and color control.
 * Use it for custom SVG, emoji, or font-based glyphs.
 * @param {IconProps} props
 * @returns {TemplateResult}
 */
export function render({
  children,
  size = "md",
  color = "current",
  className = "",
  onClick,
}) {
  const extraClasses = Object.fromEntries(
    className
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => [name, true]),
  )

  return html`<span
    class=${classMap({
      "iw-icon": true,
      [`iw-icon-${size}`]: size !== "md",
      "iw-icon-current": color === "current",
      ...extraClasses,
    })}
    style=${color !== "current" ? `color: ${color};` : ""}
    aria-hidden="true"
    @click=${onClick}
    >${children}</span
  >`
}
