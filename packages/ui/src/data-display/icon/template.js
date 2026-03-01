/**
 * @typedef {import('../../../types/data-display/icon').IconProps} IconProps
 */

import { classMap, html } from "@inglorious/web"

export function render(props) {
  const { children, size = "md", color = "current", onClick } = props

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
