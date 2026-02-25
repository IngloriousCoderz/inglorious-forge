/**
 * @typedef {import('../../../types/data-display/material-icon').MaterialIconEntity} MaterialIconEntity
 */

import { classMap, html } from "@inglorious/web"

export function render(entity) {
  const { name = "help", size = "md", filled = true } = entity

  return html`<span
    class=${classMap({
      "iw-material-icon": true,
      "material-symbols-outlined": true,
      "iw-material-icon-filled": filled,
      [`iw-material-icon-${size}`]: size !== "md",
    })}
    aria-hidden="true"
    >${name}</span
  >`
}
