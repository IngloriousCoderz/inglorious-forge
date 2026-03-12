/**
 * @typedef {import('../../../types/navigation/tabs').TabsProps} TabsProps
 * @typedef {import('../../../types/navigation/tabs').TabItem} TabItem
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html } from "@inglorious/web"

export const tabs = {
  /**
   * @param {TabsProps} props
   * @returns {TemplateResult}
   */
  render(props) {
    const {
      items = [],
      value = items[0]?.value ?? 0,
      isCentered = false,
      isFullWidth = false,
    } = props

    return html`<div class="iw-tabs">
      <div
        class=${classMap({
          "iw-tabs-list": true,
          "iw-tabs-centered": isCentered,
          "iw-tabs-full-width": isFullWidth,
        })}
        role="tablist"
      >
        ${items.map((item, index) =>
          this.renderTab(item, index, { ...props, value }),
        )}
      </div>
      ${this.renderPanel(
        items.find((item, index) => (item.value ?? index) === value) ?? null,
        props,
      )}
    </div>`
  },

  /**
   * @param {TabItem} item
   * @param {number} index
   * @param {TabsProps} props
   * @returns {TemplateResult}
   */
  renderTab(item, index, props) {
    const tabValue = item.value ?? index
    const selected = tabValue === props.value

    return html`<button
      type="button"
      role="tab"
      class=${classMap({
        "iw-tab": true,
        "iw-tab-selected": selected,
      })}
      aria-selected=${selected ? "true" : "false"}
      ?disabled=${item.isDisabled}
      @click=${() => {
        item.onClick?.(tabValue)
        props.onChange?.(tabValue)
      }}
    >
      ${item.icon ? html`<span class="iw-tab-icon">${item.icon}</span>` : null}
      <span>${item.label}</span>
    </button>`
  },

  /**
   * @param {TabItem | null} item
   * @returns {TemplateResult | null}
   */
  renderPanel(item) {
    if (!item?.panel) return null
    return html`<div class="iw-tab-panel" role="tabpanel">${item.panel}</div>`
  },
}
