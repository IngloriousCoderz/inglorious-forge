/**
 * @typedef {import('../../../types/data-display/chip').ChipProps} ChipProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"

/**
 * Renders a compact chip label with an optional leading icon and remove action.
 * Use chips for tags, filters, or selected values.
 * @param {ChipProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    children,
    icon,
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
    ${icon ? html`<span class="iw-chip-icon" aria-hidden="true">${icon}</span>` : null}
    <span class="iw-chip-label">${children}</span>
    ${
      isRemovable
        ? html`<button type="button" class="iw-chip-remove" @click=${onClick}>
            ×
          </button>`
        : null
    }
  </span>`
}
