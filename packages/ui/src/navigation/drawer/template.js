/**
 * @typedef {import('../../../types/navigation/drawer').DrawerProps} DrawerProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"
import { when } from "@inglorious/web/directives/when"

import { Button } from "../../controls/button"
import { MaterialIcon } from "../../data-display/material-icon"
import { Backdrop } from "../../feedback/backdrop"
import { Flex } from "../../layout/flex"

/**
 * Renders a side drawer panel with optional header, body, and collapse controls.
 * Can show a backdrop when open and supports left/right anchoring.
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

  const drawerClassName = [
    "iw-drawer",
    `iw-drawer-${anchor}`,
    isOpen && "iw-drawer-open",
    isHidden && "iw-drawer-hidden",
    isCollapsed && "iw-drawer-collapsed",
    ...Object.keys(extraClasses),
  ]
    .filter(Boolean)
    .join(" ")

  return html`
    ${Flex.render({
      element: "aside",
      direction: "column",
      className: drawerClassName,
      children: [
        when(
          title || onClose,
          () => html`
            ${Flex.render({
              align: "center",
              justify: "between",
              gap: "sm",
              className: "iw-drawer-header",
              children: [
                when(
                  title,
                  () => html`<div class="iw-drawer-title">${title}</div>`,
                ),
                when(onClose, () =>
                  Button.render({
                    color: "secondary",
                    variant: "ghost",
                    shape: "square",
                    className: "iw-drawer-close",
                    "aria-label": "Close",
                    onClick: onClose,
                    children: MaterialIcon.render({
                      name: "close",
                      size: "lg",
                    }),
                  }),
                ),
              ],
            })}
          `,
        ),

        Flex.render({
          direction: "column",
          className: "iw-drawer-body",
          children,
        }),

        when(
          onCollapseToggle,
          () => html`
            ${Flex.render({
              justify: "end",
              padding: "sm",
              className: "iw-drawer-footer",
              children: Button.render({
                color: "secondary",
                variant: "ghost",
                shape: "square",
                className: "iw-drawer-toggler",
                "aria-label": isCollapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar",
                onClick: onCollapseToggle,
                children: MaterialIcon.render({
                  name: "left_panel_close",
                  size: "lg",
                }),
              }),
            })}
          `,
        ),
      ],
      ...rest,
    })}
    ${when(isOpen && hasBackdrop, () =>
      Backdrop.render({
        isOpen: true,
        className: "iw-drawer-backdrop",
        onClick: onClose,
      }),
    )}
  `
}
