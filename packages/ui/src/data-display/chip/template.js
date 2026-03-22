/**
 * @typedef {import('../../../types/data-display/chip').ChipProps} ChipProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html } from "@inglorious/web"

/**
 * Renders a compact chip label with optional remove action.
 * Use chips for tags, filters, or selected values.
 * @param {ChipProps} props
 * @returns {TemplateResult}
 */
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
