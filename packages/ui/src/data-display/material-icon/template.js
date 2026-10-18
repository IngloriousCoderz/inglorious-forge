/**
 * @typedef {import('../../../types/data-display/material-icon').MaterialIconProps} MaterialIconProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"

/**
 * Renders a Material Symbols icon by name.
 * Requires the Material Symbols font and supports filled and size variants.
 * `direction` is the direction of the text the icon sits in. An icon that
 * points along the line, such as a back arrow or a chevron, is mirrored with
 * `"rtl"`: in right-to-left text, back points right.
 * @param {MaterialIconProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    name = "help",
    size = "md",
    isFilled = true,
    direction = "ltr",
    onClick,
  } = props

  return html`<span
    class=${classMap({
      "iw-material-icon": true,
      "material-symbols-outlined": true,
      "iw-material-icon-filled": isFilled,
      "iw-material-icon-rtl": direction === "rtl",
      [`iw-material-icon-${size}`]: size !== "md",
    })}
    aria-hidden="true"
    @click=${onClick}
    >${name}</span
  >`
}
