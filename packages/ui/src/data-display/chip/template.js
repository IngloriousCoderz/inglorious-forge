/**
 * @typedef {import('../../../types/data-display/chip').ChipProps} ChipProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { when } from "@inglorious/web/directives/when"

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
    isSelected,
    isDisabled = false,
    onClick,
  } = props

  const classes = {
    "iw-chip": true,
    [`iw-chip-${color}`]: color !== "default",
    [`iw-chip-${size}`]: size !== "md",
    [`iw-chip-shape-${shape}`]: shape !== "pill",
  }

  const content = html`${when(
      icon,
      () => html`<span class="iw-chip-icon" aria-hidden="true">${icon}</span>`,
    )} <span class="iw-chip-label">${children}</span>`

  // A chip that can be picked is a toggle button, pressed while selected.
  if (isSelected !== undefined) {
    return html`<button
      type="button"
      class=${classMap({
        ...classes,
        "iw-chip-selectable": true,
        "iw-chip-selected": isSelected,
      })}
      aria-pressed=${String(isSelected)}
      ?disabled=${isDisabled}
      @click=${onClick}
    >
      ${content}
    </button>`
  }

  return html`<span class=${classMap(classes)}>
    ${content}
    ${when(
      isRemovable,
      () =>
        html`<button type="button" class="iw-chip-remove" @click=${onClick}>
          ×
        </button>`,
    )}
  </span>`
}
