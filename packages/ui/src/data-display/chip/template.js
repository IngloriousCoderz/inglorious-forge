/**
 * @typedef {import('../../../types/data-display/chip').ChipEntity} ChipEntity
 */

import { classMap, html } from "@inglorious/web"

export function render(entity, api) {
  const {
    children,
    removable = false,
    color = "default",
    size = "md",
    shape = "pill",
  } = entity

  const classes = {
    "iw-chip": true,
    [`iw-chip-${color}`]: color !== "default",
    [`iw-chip-${size}`]: size !== "md",
    [`iw-chip-shape-${shape}`]: shape !== "pill",
  }

  return html`<span class=${classMap(classes)}>
    <span class="iw-chip-label">${children}</span>
    ${removable
      ? html`<button
          type="button"
          class="iw-chip-remove"
          @click=${(event) => {
            event.stopPropagation()
            api.notify(`#${entity.id}:remove`)
          }}
        >
          ×
        </button>`
      : null}
  </span>`
}
