/**
 * @typedef {import('../../../types/data-display/divider').DividerProps} DividerProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html, nothing } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"

/**
 * Renders a horizontal or vertical divider line: a native `<hr>`, which
 * assistive tech announces as a separator, unless it is only decorative.
 * Supports inset styling for aligned content blocks.
 * @param {DividerProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    orientation = "horizontal",
    isInset = false,
    isDecorative = false,
  } = props
  const isVertical = orientation === "vertical"

  return html`<hr
    class=${classMap({
      "iw-divider": true,
      "iw-divider-vertical": isVertical,
      "iw-divider-inset": isInset,
    })}
    role=${isDecorative ? "none" : nothing}
    aria-orientation=${isVertical && !isDecorative ? "vertical" : nothing}
  />`
}
