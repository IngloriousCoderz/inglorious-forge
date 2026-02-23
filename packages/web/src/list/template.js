/**
 * @typedef {import('../../types/mount').Api} Api
 * @typedef {import('../../types/list').ListEntity} ListEntity
 * @typedef {import('lit-html').TemplateResult} TemplateResult
 */

import { html } from "lit-html"
import { ref } from "lit-html/directives/ref.js"
import { repeat } from "lit-html/directives/repeat.js"
import { styleMap } from "lit-html/directives/style-map.js"

const PRETTY_INDEX = 1

/**
 * Renders the virtualized list component.
 * @param {ListEntity} entity The list entity state.
 * @param {Api} api The API object.
 * @returns {TemplateResult} The rendered list.
 */
export function render(entity, api) {
  const { items, visibleRange, viewportHeight, itemHeight, estimatedHeight } =
    entity
  const type = api.getType(entity.type)

  if (!items) {
    console.warn(`list entity ${entity.id} needs 'items'`)
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
      style=${styleMap({ height: `${viewportHeight}px`, overflow: "auto" })}
      @scroll=${(e) => api.notify(`#${entity.id}:scroll`, e.target)}
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
 * Default item renderer.
 * @param {ListEntity} entity The list entity.
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
