/**
 * @typedef {import('../../../types/data-display/chip').ChipProps} ChipProps
 */

import { classMap, html } from "@inglorious/web"

export function render(props) {
  const {
    children,
    isRemovable = false,
    color = "default",
    size = "md",
    shape = "pill",
    onClick,
  } = props

  const classes = {
    "iw-chip": true,
    [`iw-chip-${color}`]: color !== "default",
    [`iw-chip-${size}`]: size !== "md",
    [`iw-chip-shape-${shape}`]: shape !== "pill",
  }

  return html`<span class=${classMap(classes)}>
    <span class="iw-chip-label">${children}</span>
    ${isRemovable
      ? html`<button type="button" class="iw-chip-remove" @click=${onClick}>
          ×
        </button>`
      : null}
  </span>`
}
