/**
 * @typedef {import('../../../types/navigation/tabs').TabsProps} TabsProps
 * @typedef {import('../../../types/navigation/tabs').TabItem} TabItem
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html, nothing } from "@inglorious/web"
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
        @keydown=${moveBetweenTabs}
      >
        ${items.map((item, index) =>
          this.renderTab(item, index, { ...props, value }),
        )}
      </div>
      ${this.renderPanel(
        items.find((item, index) => (item.value ?? index) === value) ?? null,
        { ...props, value },
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
    // Only one tab is in the Tab order, and the arrow keys move between them:
    // the selected tab, or the first one while none is.
    const hasSelection = props.items.some(
      (other, otherIndex) => (other.value ?? otherIndex) === props.value,
    )
    const isTabStop = selected || (!hasSelection && index === 0)

    return html`<button
      type="button"
      role="tab"
      id=${props.id ? `${props.id}-tab-${tabValue}` : nothing}
      class=${classMap({
        "iw-tab": true,
        "iw-tab-selected": selected,
      })}
      aria-selected=${selected ? "true" : "false"}
      aria-controls=${props.id && selected ? `${props.id}-panel` : nothing}
      tabindex=${isTabStop ? 0 : -1}
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
  renderPanel(item, props) {
    if (!item?.panel) return null
    const { id, value } = props ?? {}
    return html`<div
      id=${id ? `${id}-panel` : nothing}
      class="iw-tab-panel"
      role="tabpanel"
      aria-labelledby=${id ? `${id}-tab-${value}` : nothing}
    >
      ${item.panel}
    </div>`
  },
}

/**
 * Arrow keys move to the previous or next tab and select it, wrapping at
 * either end; Home and End jump to the first and last. Left and right swap in
 * a right-to-left page, where the tabs run the other way.
 * @param {KeyboardEvent} event
 */
function moveBetweenTabs(event) {
  const tabs = [
    ...event.currentTarget.querySelectorAll('[role="tab"]:not(:disabled)'),
  ]
  const current = tabs.indexOf(event.target)
  if (current === -1) return

  const isRtl = getComputedStyle(event.currentTarget).direction === "rtl"
  const forward = isRtl ? "ArrowLeft" : "ArrowRight"
  const backward = isRtl ? "ArrowRight" : "ArrowLeft"

  let next
  if (event.key === forward) next = (current + 1) % tabs.length
  else if (event.key === backward)
    next = (current - 1 + tabs.length) % tabs.length
  else if (event.key === "Home") next = 0
  else if (event.key === "End") next = tabs.length - 1
  else return

  event.preventDefault()
  tabs[next].focus()
  tabs[next].click()
}
