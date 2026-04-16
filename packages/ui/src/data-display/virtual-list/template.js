/**
 * @typedef {import('../../../types/data-display/virtual-list').VirtualListEntity} VirtualListEntity
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 * @typedef {import('@inglorious/web').Api} Api
 */

import { html } from "@inglorious/web"
import { ref } from "@inglorious/web/directives/ref"
import { repeat } from "@inglorious/web/directives/repeat"
import { styleMap } from "@inglorious/web/directives/style-map"

const PRETTY_INDEX = 1

/**
 * Renders a virtualized list that only mounts visible items for performance.
 * Uses item height estimates to compute scroll ranges and notifies on mount/scroll.
 * @param {VirtualListEntity} entity The list entity state.
 * @param {Api} api The API object.
 * @returns {TemplateResult} The rendered list.
 */
export function render(entity, api) {
  const {
    items,
    visibleRange,
    viewportHeight,
    itemHeight,
    estimatedHeight,
    className,
  } = entity
  const type = api.getType(entity.type)

  if (!items) {
    console.warn(`virtual list entity ${entity.id} needs 'items'`)
    return html``
  }

  if (!type.renderItem) {
    console.warn(`type ${entity.type} needs 'renderItem' method`)
    return html``
  }

  const visibleItems = items.slice(visibleRange.start, visibleRange.end)
  const height = itemHeight || estimatedHeight
  const totalHeight = items.length * height

  return html`
    <div
      class=${className ?? ""}
      style=${styleMap({ height: `${viewportHeight}px`, overflow: "auto" })}
      @scroll=${(e) => api.notify(`#${entity.id}:scroll`, e.currentTarget)}
      ${ref((el) => {
        if (el && !itemHeight) {
          queueMicrotask(() => {
            api.notify(`#${entity.id}:mount`, el)
          })
        }
      })}
    >
      <div
        style=${styleMap({
          height: `${totalHeight}px`,
          position: "relative",
        })}
      >
        ${repeat(
          visibleItems,
          (item) => item.id,
          (item, index) => {
            const absoluteIndex = visibleRange.start + index
            const top = absoluteIndex * height

            return html`
              <div
                style=${styleMap({
                  position: "absolute",
                  top: `${top}px`,
                  width: "100%",
                })}
                data-index=${absoluteIndex}
              >
                ${type.renderItem(entity, { item, index: absoluteIndex }, api)}
              </div>
            `
          },
        )}
      </div>
    </div>
  `
}

/**
 * Default item renderer for a virtualized list item.
 * Override to customize how each item is displayed.
 * @param {VirtualListEntity} entity The list entity.
 * @param {object} payload The payload for rendering the item.
 * @param {any} payload.item The item data.
 * @param {number} payload.index The item's absolute index in the full list.
 * @param {Api} api The API object.
 * @returns {TemplateResult} The rendered list item.
 */
// eslint-disable-next-line no-unused-vars
export function renderItem(entity, { item, index }, api) {
  return html`<div class="iw-list-item">
    ${index + PRETTY_INDEX}. ${JSON.stringify(item)}
  </div>`
}
