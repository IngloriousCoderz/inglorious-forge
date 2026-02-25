/**
 * @typedef {import('../../../types/data-display/icon').IconEntity} IconEntity
 */

import { classMap, html } from "@inglorious/web"

export function render(entity) {
  const { children, size = "md", color = "current" } = entity

  return html`<span
    class=${classMap({
      "iw-icon": true,
      [`iw-icon-${size}`]: size !== "md",
      "iw-icon-current": color === "current",
    })}
    style=${color !== "current" ? `color: ${color};` : ""}
    aria-hidden="true"
    >${children}</span
  >`
}
