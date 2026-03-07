/**
 * @typedef {import('../../../types/navigation/drawer').DrawerProps} DrawerProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

/**
 * @param {DrawerProps} props
 * @returns {TemplateResult | null}
 */
export function render(props) {
  const {
    type, // eslint-disable-line no-unused-vars
    open = false,
    anchor = "left",
    variant = "temporary",
    title,
    children,
    backdrop = variant === "temporary",
    className = "",
    onClose,
    ...rest
  } = props

  if (!open && variant === "temporary") return null

  const extraClasses = Object.fromEntries(
    className
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => [name, true]),
  )

  const panel = html`<aside
    class=${classMap({
      "iw-drawer": true,
      [`iw-drawer-${anchor}`]: true,
      [`iw-drawer-${variant}`]: true,
      "iw-drawer-open": open,
      ...extraClasses,
    })}
    ${ref((el) => applyElementProps(el, rest))}
  >
    ${(title || onClose) &&
    html`<div class="iw-drawer-header">
      ${title ? html`<div class="iw-drawer-title">${title}</div>` : null}
      ${onClose
        ? html`<button
            type="button"
            class="iw-drawer-close"
            aria-label="Close drawer"
            @click=${onClose}
          >
            ×
          </button>`
        : null}
    </div>`}
    <div class="iw-drawer-body">${children}</div>
  </aside>`

  if (variant !== "temporary") return panel

  return html`<div class="iw-drawer-shell">
    ${backdrop
      ? html`<button
          type="button"
          class="iw-drawer-backdrop"
          aria-label="Close drawer"
          @click=${onClose}
        ></button>`
      : null}
    ${panel}
  </div>`
}
