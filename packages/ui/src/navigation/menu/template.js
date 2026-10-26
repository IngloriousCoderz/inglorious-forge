/**
 * @typedef {import('../../../types/navigation/menu').MenuProps} MenuProps
 * @typedef {import('../../../types/navigation/menu').MenuItem} MenuItem
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html, nothing } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { ref } from "@inglorious/web/directives/ref"

import { Button } from "../../controls/button/index.js"
import { anchorName } from "../../shared/anchor.js"
import { applyElementProps } from "../../shared/apply-element-props.js"
import { syncPopover } from "../../shared/top-layer.js"

export const Menu = {
  /**
   * Main entrypoint for a menu list. Delegates to the base renderer for overrides.
   * Menus render selectable items and optional dividers.
   * With a `trigger`, the menu is a native popover anchored to a button that
   * opens it: the browser places it, flipping it to stay on screen, and closes
   * it on Esc, a press outside, or a pick.
   * @param {MenuProps} props
   * @returns {TemplateResult | null}
   */
  render(props) {
    if (!props.trigger) return this.renderMenu(props)
    return html`${this.renderTrigger(props)}${this.renderMenu(props)}`
  },

  /**
   * Renders the button that opens an anchored menu. It is the popover's
   * `commandfor` invoker, so the browser toggles the menu from it and does
   * not count a press on it as a press outside.
   * @param {MenuProps} props
   * @returns {TemplateResult}
   */
  renderTrigger(props) {
    const { id, isOpen = false, trigger, triggerProps, onToggle } = props

    return Button.render({
      variant: "ghost",
      ...triggerProps,
      children: trigger,
      commandfor: id,
      command: "toggle-popover",
      "aria-haspopup": "menu",
      // Left to the browser when it alone keeps the open state.
      "aria-expanded": onToggle ? String(isOpen) : undefined,
      style: `anchor-name: ${anchorName(id)}`,
    })
  },

  /**
   * Renders the menu container and iterates items.
   * Each item is delegated to `renderItem`. An inline menu is only rendered
   * while open; an anchored one stays in the page as a hidden popover.
   * @param {MenuProps} props
   * @returns {TemplateResult | null}
   */
  renderMenu(props) {
    const {
      type, // eslint-disable-line no-unused-vars
      id,
      isOpen = false,
      items = [],
      isDense = false,
      className = "",
      trigger,
      triggerProps, // eslint-disable-line no-unused-vars
      onToggle,
      onItemClick, // eslint-disable-line no-unused-vars
      ...rest
    } = props

    if (!trigger && !isOpen) return null

    const extraClasses = Object.fromEntries(
      className
        .split(/\s+/)
        .filter(Boolean)
        .map((name) => [name, true]),
    )

    return html`<div
      id=${id || nothing}
      class=${classMap({
        "iw-menu": true,
        "iw-menu-dense": isDense,
        ...extraClasses,
      })}
      role="menu"
      popover=${trigger ? "auto" : nothing}
      style=${trigger ? `position-anchor: ${anchorName(id)}` : nothing}
      ${ref((element) => {
        if (!element) return
        applyElementProps(element, rest)
        // Without onToggle the browser alone opens and closes it.
        if (trigger && onToggle) {
          syncPopover(element, {
            isOpen,
            onOpen: () => onToggle(true),
            onClose: () => onToggle(false),
          })
        }
      })}
    >
      ${items.map((item, index) => this.renderItem(item, index, props))}
    </div>`
  },

  /**
   * Renders a single menu item or divider.
   * Handles selection, disabled state, and click callbacks.
   * @param {MenuItem} item
   * @param {number} index
   * @param {MenuProps} props
   * @returns {TemplateResult}
   */
  renderItem(item, index, props) {
    if (item.hasDivider) {
      return html`<div class="iw-menu-divider" role="separator"></div>`
    }

    // In an anchored menu each item also hides the popover once picked.
    return html`<button
      type="button"
      class=${classMap({
        "iw-menu-item": true,
        "iw-menu-item-selected": item.isSelected,
      })}
      role="menuitem"
      commandfor=${props.trigger ? props.id : nothing}
      command=${props.trigger ? "hide-popover" : nothing}
      ?disabled=${item.isDisabled}
      @click=${() => {
        item.onClick?.(item.value ?? index)
        props.onItemClick?.(item.value ?? index, item)
      }}
    >
      ${
        item.icon
          ? html`<span class="iw-menu-item-icon">${item.icon}</span>`
          : null
      }
      <span class="iw-menu-item-label">${item.label}</span>
      ${
        item.trailing
          ? html`<span class="iw-menu-item-trailing">${item.trailing}</span>`
          : null
      }
    </button>`
  },
}
