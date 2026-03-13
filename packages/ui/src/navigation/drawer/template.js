/**
 * @typedef {import('../../../types/navigation/drawer').DrawerProps} DrawerProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref, when } from "@inglorious/web"

import { button } from "../../controls/button"
import { materialIcon } from "../../data-display/material-icon"
import { backdrop } from "../../feedback/backdrop"
import { applyElementProps } from "../../shared/applyElementProps.js"

/**
 * @param {DrawerProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    type, // eslint-disable-line no-unused-vars
    items, // eslint-disable-line no-unused-vars
    isOpen = false,
    isHidden = false,
    anchor = "left",
    isCollapsed = false,
    hasBackdrop = true,
    title,
    children,
    className = "",
    onClose,
    onCollapseToggle,
    ...rest
  } = props

  const extraClasses = Object.fromEntries(
    className
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => [name, true]),
  )

  return html`
    <aside
      class=${classMap({
        "iw-drawer": true,
        [`iw-drawer-${anchor}`]: true,
        "iw-drawer-open": isOpen,
        "iw-drawer-hidden": isHidden,
        "iw-drawer-collapsed": isCollapsed,
        ...extraClasses,
      })}
      ${ref((element) => applyElementProps(element, rest))}
    >
      ${when(
        title || onClose,
        () => html`
          <div class="iw-drawer-header">
            ${when(
              title,
              () => html`<div class="iw-drawer-title">${title}</div>`,
            )}
            ${when(onClose, () =>
              button.render({
                color: "secondary",
                variant: "ghost",
                className: "iw-drawer-close",
                "aria-label": "Close",
                onClick: onClose,
                children: materialIcon.render({ name: "close", size: "lg" }),
              }),
            )}
          </div>
        `,
      )}

      <div class="iw-drawer-body">${children}</div>

      ${when(
        onCollapseToggle,
        () => html`
          <div class="iw-drawer-footer">
            ${button.render({
              color: "secondary",
              variant: "ghost",
              className: "iw-drawer-toggler",
              "aria-label": isCollapsed ? "Expand sidebar" : "Collapse sidebar",
              onClick: onCollapseToggle,
              children: materialIcon.render({
                name: "left_panel_close",
                size: "lg",
              }),
            })}
          </div>
        `,
      )}
    </aside>

    ${when(isOpen && hasBackdrop, () =>
      backdrop.render({
        isOpen: true,
        className: "iw-drawer-backdrop",
        onClick: onClose,
      }),
    )}
  `
}
