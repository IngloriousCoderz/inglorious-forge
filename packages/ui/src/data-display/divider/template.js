/**
 * @typedef {import('../../../types/data-display/divider').DividerProps} DividerProps
 */

import { classMap, html } from "@inglorious/web"

export function render(props) {
  const { orientation = "horizontal", inset = false } = props

  return html`<hr
    class=${classMap({
      "iw-divider": true,
      "iw-divider-vertical": orientation === "vertical",
      "iw-divider-inset": inset,
    })}
  />`
}
