/**
 * @typedef {import('../../../types/data-display/divider').DividerProps} DividerProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html } from "@inglorious/web"

/**
 * Renders a horizontal or vertical divider line.
 * Supports inset styling for aligned content blocks.
 * @param {DividerProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const { orientation = "horizontal", isInset = false } = props

  return html`<hr
    class=${classMap({
      "iw-divider": true,
      "iw-divider-vertical": orientation === "vertical",
      "iw-divider-inset": isInset,
    })}
  />`
}
