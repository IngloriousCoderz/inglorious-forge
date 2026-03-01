/**
 * @typedef {import('../../../types/data-display/material-icon').MaterialIconProps} MaterialIconProps
 */

import { classMap, html } from "@inglorious/web"

export function render(props) {
  const { name = "help", size = "md", filled = true, onClick } = props

  return html`<span
    class=${classMap({
      "iw-material-icon": true,
      "material-symbols-outlined": true,
      "iw-material-icon-filled": filled,
      [`iw-material-icon-${size}`]: size !== "md",
    })}
    aria-hidden="true"
    @click=${onClick}
    >${name}</span
  >`
}
