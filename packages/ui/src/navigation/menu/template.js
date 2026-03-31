/**
 * @typedef {import('../../../types/navigation/menu').MenuProps} MenuProps
 * @typedef {import('../../../types/navigation/menu').MenuItem} MenuItem
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

export const Menu = {
  /**
   * Main entrypoint for a menu list. Delegates to the base renderer for overrides.
   * Menus render selectable items and optional dividers.
   * @param {MenuProps} props
   * @returns {TemplateResult | null}
   */
  render(props) {
    return this.renderMenu(props)
  },

  /**
   * Renders the menu container and iterates items when open.
   * Each item is delegated to `renderItem`.
   * @param {MenuProps} props
   * @returns {TemplateResult | null}
   */
  renderMenu(props) {
    const {
      type, // eslint-disable-line no-unused-vars
      isOpen = false,
      items = [],
      isDense = false,
      className = "",
      ...rest
    } = props

    if (!isOpen) return null

    const extraClasses = Object.fromEntries(
      className
        .split(/\s+/)
        .filter(Boolean)
        .map((name) => [name, true]),
    )

    return html`<div
      class=${classMap({
        "iw-menu": true,
        "iw-menu-dense": isDense,
        ...extraClasses,
      })}
      role="menu"
      ${ref((el) => applyElementProps(el, rest))}
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

    return html`<button
      type="button"
      class=${classMap({
        "iw-menu-item": true,
        "iw-menu-item-selected": item.isSelected,
      })}
      role="menuitem"
      ?disabled=${item.isDisabled}
      @click=${() => {
        item.onClick?.(item.value ?? index)
        props.onItemClick?.(item.value ?? index, item)
      }}
    >
      ${item.icon
        ? html`<span class="iw-menu-item-icon">${item.icon}</span>`
        : null}
      <span class="iw-menu-item-label">${item.label}</span>
      ${item.trailing
        ? html`<span class="iw-menu-item-trailing">${item.trailing}</span>`
        : null}
    </button>`
  },
}
