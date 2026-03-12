/**
 * @typedef {import('../../../types/navigation/menu').MenuProps} MenuProps
 * @typedef {import('../../../types/navigation/menu').MenuItem} MenuItem
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

export const menu = {
  /**
   * @param {MenuProps} props
   * @returns {TemplateResult | null}
   */
  render(props) {
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
