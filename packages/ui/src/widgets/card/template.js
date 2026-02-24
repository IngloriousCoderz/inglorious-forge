/** @typedef {import('../../../types/card').CardEntity} CardEntity */
/** @typedef {import('@inglorious/web').Api} Api */
/** @typedef {import('@inglorious/web').TemplateResult} TemplateResult */

import { classMap, html } from "@inglorious/web"

/**
 * Card component for Inglorious Web.
 *
 * @example
 * // Stateless usage
 * card.render({ title: 'Card Title', subtitle: 'Description' }, api)
 *
 * @example
 * // Stateful usage with event handling
 * // Entity: { type: 'card', id: 'myCard', title: 'Click me' }
 * // In store: api.render('myCard')
 *
 * @param {CardEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function render(entity, api) {
  const { hoverable = false, clickable = false, fullWidth = false } = entity
  const type = getCardType(entity, api)

  const classes = {
    "iw-card": true,
    "iw-card-hoverable": hoverable || clickable,
    "iw-card-clickable": clickable,
    "iw-card-full-width": fullWidth,
  }

  return html`
    <div
      class=${classMap(classes)}
      @click=${() => api.notify(`#${entity.id}:click`)}
    >
      ${type.renderHeader(entity, api)} ${type.renderBody(entity, api)}
      ${type.renderFooter(entity, api)}
    </div>
  `
}

/**
 * Default header renderer.
 * Override in composed types for custom header rendering.
 * @param {CardEntity} entity
 * @returns {TemplateResult | null}
 */
export function renderHeader(entity) {
  const { title, subtitle } = entity
  const hasHeader = title || subtitle
  if (!hasHeader) return null

  return html`<div class="iw-card-header">
    ${title ? html`<h3 class="iw-card-title">${title}</h3>` : null}
    ${subtitle ? html`<p class="iw-card-subtitle">${subtitle}</p>` : null}
  </div>`
}

/**
 * Default body renderer.
 * Override in composed types for custom body rendering.
 * @returns {TemplateResult}
 */
export function renderBody() {
  return html`<div class="iw-card-body">
    <slot></slot>
  </div>`
}

/**
 * Default footer renderer.
 * Override in composed types for custom footer rendering.
 * @returns {TemplateResult | null}
 */
export function renderFooter() {
  return null
}

function getCardType(entity, api) {
  const resolved = api?.getType?.(entity?.type)
  return hasCardRenderers(resolved)
    ? resolved
    : { renderHeader, renderBody, renderFooter }
}

function hasCardRenderers(type) {
  return (
    typeof type?.renderHeader === "function" &&
    typeof type?.renderBody === "function" &&
    typeof type?.renderFooter === "function"
  )
}
