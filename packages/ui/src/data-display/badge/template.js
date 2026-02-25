/**
 * @typedef {import('../../../types/data-display/badge').BadgeEntity} BadgeEntity
 */

import { classMap, html } from "@inglorious/web"

export function render(entity) {
  const { children, color = "primary", variant = "solid", size = "md" } = entity

  const classes = {
    "iw-badge": true,
    [`iw-badge-${color}`]: color !== "primary",
    [`iw-badge-${variant}`]: variant !== "solid",
    [`iw-badge-${size}`]: size !== "md",
  }

  return html`<span class=${classMap(classes)}>${children}</span>`
}
