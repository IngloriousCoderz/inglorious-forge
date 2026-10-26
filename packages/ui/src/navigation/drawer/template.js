/**
 * @typedef {import('../../../types/navigation/drawer').DrawerProps} DrawerProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html, nothing } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { ref } from "@inglorious/web/directives/ref"
import { when } from "@inglorious/web/directives/when"

import { Button } from "../../controls/button/index.js"
import { Icon } from "../../data-display/icon/index.js"
import { Flex } from "../../layout/flex/index.js"
import { applyElementProps } from "../../shared/apply-element-props.js"
import { close, leftPanelClose } from "../../shared/icons.js"
import { syncPopover } from "../../shared/top-layer.js"

/** Where a responsive drawer docks. Keep in step with style.css. */
const DOCKED_QUERY = "(min-width: 64rem)"

/**
 * Latest props of each responsive drawer, so they can be re-synced when the
 * viewport crosses the breakpoint without anything re-rendering.
 * @type {Map<HTMLElement, DrawerProps>}
 */
const responsiveDrawers = new Map()

/** @type {MediaQueryList | undefined} */
let dockedMedia

/**
 * Renders a side drawer panel with optional header, body, and collapse controls.
 * While it overlays the page it is a native popover: it sits in the top layer
 * over a `::backdrop`, and Esc or a press outside it (the backdrop included)
 * closes it.
 * `variant` sets when it overlays: `responsive` below 64rem and docked above,
 * `temporary` at every width, `permanent` never.
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
    variant = "responsive",
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

  const classes = {
    "iw-drawer": true,
    [`iw-drawer-${anchor}`]: true,
    [`iw-drawer-${variant}`]: true,
    "iw-drawer-open": isOpen,
    "iw-drawer-hidden": isHidden,
    "iw-drawer-collapsed": isCollapsed,
    "iw-drawer-no-backdrop": !hasBackdrop,
    ...extraClasses,
  }

  // Without onClose nothing would take isOpen down, so the browser is not
  // allowed to dismiss it: a manual popover ignores Esc and outside presses.
  const popover =
    variant === "permanent" ? nothing : onClose ? "auto" : "manual"

  return html`<aside
    class=${classMap(classes)}
    popover=${popover}
    ${ref((element) => {
      if (!element) return
      applyElementProps(element, rest)
      sync(element, { isOpen, variant, onClose })
    })}
  >
    ${when(
      title || onClose,
      () => html`
        ${Flex.render({
          align: "center",
          justify: "between",
          gap: "sm",
          padding: "sm",
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
                children: Icon.render({ icon: close, size: "lg" }),
              }),
            ),
          ],
        })}
      `,
    )}
    ${Flex.render({
      direction: "column",
      className: "iw-drawer-body",
      children,
    })}
    ${when(
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
            "aria-label": isCollapsed ? "Expand sidebar" : "Collapse sidebar",
            onClick: onCollapseToggle,
            children: Icon.render({ icon: leftPanelClose, size: "lg" }),
          }),
        })}
      `,
    )}
  </aside>`
}

/**
 * Shows the popover only while the drawer overlays the page, and remembers a
 * responsive drawer so a breakpoint crossing can re-sync it.
 * @param {HTMLElement} element
 * @param {Pick<DrawerProps, "isOpen" | "variant" | "onClose">} props
 */
function sync(element, props) {
  if (props.variant === "responsive") {
    watchDockedMedia()
    responsiveDrawers.set(element, props)
  } else {
    responsiveDrawers.delete(element)
  }

  syncPopover(element, {
    isOpen: props.isOpen && isOverlay(props.variant),
    onClose: props.onClose,
  })
}

function isOverlay(variant) {
  if (variant === "permanent") return false
  if (variant === "temporary") return true
  return !dockedMedia?.matches
}

/**
 * Listens once for the breakpoint. Widening the window docks an open
 * responsive drawer, which then has to leave the top layer: a silent hide,
 * since nothing asked the store to close it.
 */
function watchDockedMedia() {
  if (dockedMedia || !globalThis.matchMedia) return
  dockedMedia = globalThis.matchMedia(DOCKED_QUERY)
  dockedMedia.addEventListener("change", () => {
    for (const [element, props] of responsiveDrawers) {
      if (element.isConnected) sync(element, props)
      else responsiveDrawers.delete(element)
    }
  })
}
