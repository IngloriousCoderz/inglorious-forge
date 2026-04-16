/**
 * @typedef {import('../../../types/navigation/tabs').TabsProps} TabsProps
 * @typedef {import('../../../types/navigation/tabs').TabItem} TabItem
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"

export const Tabs = {
  /**
   * Main entrypoint for tabbed navigation. Delegates to the base renderer for overrides.
   * Renders tab labels and the active panel.
   * @param {TabsProps} props
   * @returns {TemplateResult}
   */
  render(props) {
    return this.renderTabs(props)
  },

  /**
   * Renders the tabs list and the active panel container.
   * Individual tabs are delegated to `renderTab`.
   * @param {TabsProps} props
   * @returns {TemplateResult}
   */
  renderTabs(props) {
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
   * Renders a single tab button with selected/disabled states.
   * Wires click events to update the active tab.
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
   * Renders the active tab panel content.
   * Returns `null` when the active item has no panel.
   * @param {TabItem | null} item
   * @returns {TemplateResult | null}
   */
  renderPanel(item) {
    if (!item?.panel) return null
    return html`<div class="iw-tab-panel" role="tabpanel">${item.panel}</div>`
  },
}
