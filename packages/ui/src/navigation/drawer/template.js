/**
 * @typedef {import('../../../types/navigation/drawer').DrawerProps} DrawerProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref, when } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

/**
 * @param {DrawerProps} props
 * @returns {TemplateResult | null}
 */
export function render(props) {
  const {
    type, // eslint-disable-line no-unused-vars
    isOpen = false,
    anchor = "left",
    variant = "temporary",
    breakpoint = "lg",
    isCollapsed = false,
    title,
    children,
    backdrop = variant === "temporary" || variant === "responsive",
    className = "",
    onClose,
    ...rest
  } = props

  if (!isOpen && variant === "temporary") return null

  const extraClasses = Object.fromEntries(
    className
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => [name, true]),
  )

  // When the drawer is in responsive mode, ensure it can stretch
  // to the full page height by applying an inline height style
  // calculated from the document height.
  const pageHeightStyle =
    variant === "responsive"
      ? `height: ${typeof document !== "undefined" ? document.documentElement.scrollHeight + "px" : "100%"};`
      : ""

  const panel = html`<aside
    class=${classMap({
      "iw-drawer": true,
      [`iw-drawer-${anchor}`]: true,
      [`iw-drawer-${variant}`]: true,
      [`iw-drawer-breakpoint-${breakpoint}`]: variant === "responsive",
      "iw-drawer-open": isOpen,
      "iw-drawer-collapsed": isCollapsed,
      ...extraClasses,
    })}
    style=${pageHeightStyle}
    ${ref((el) => applyElementProps(el, rest))}
  >
    ${when(
      title || onClose,
      () =>
        html`<div class="iw-drawer-header">
          ${when(
            title,
            () => html`<div class="iw-drawer-title">${title}</div>`,
          )}
          ${when(
            onClose,
            () =>
              html`<button
                type="button"
                class="iw-drawer-close"
                aria-label="Close drawer"
                @click=${onClose}
              >
                ×
              </button>`,
          )}
        </div>`,
    )}
    <div class="iw-drawer-body">${children}</div>
  </aside>`

  if (variant === "temporary" || variant === "responsive") {
    const shellClasses = classMap({
      "iw-drawer-shell": true,
      "iw-drawer-shell-responsive": variant === "responsive",
    })

    const shellHeightStyle =
      variant === "responsive"
        ? `height: ${typeof document !== "undefined" ? document.documentElement.scrollHeight + "px" : "100%"};`
        : ""

    return html`<div class=${shellClasses} style=${shellHeightStyle}>
      ${when(
        backdrop,
        () =>
          html`<button
            type="button"
            class="iw-drawer-backdrop"
            aria-label="Close drawer"
            @click=${onClose}
          ></button>`,
      )}
      ${panel}
    </div>`
  }

  return panel
}
