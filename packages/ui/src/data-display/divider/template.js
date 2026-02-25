/**
 * @typedef {import('../../../types/data-display/divider').DividerEntity} DividerEntity
 */

import { classMap, html } from "@inglorious/web"

export function render(entity) {
  const { orientation = "horizontal", inset = false } = entity

  return html`<hr
    class=${classMap({
      "iw-divider": true,
      "iw-divider-vertical": orientation === "vertical",
      "iw-divider-inset": inset,
    })}
  />`
}
