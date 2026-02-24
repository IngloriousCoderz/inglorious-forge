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
 * // Entity: { type: 'card', id: 'myCard', title: 'Click me', onClick: () => {} }
 * // In store: api.render('myCard')
 *
 * @param {CardEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function render(entity, api) {
  const {
    title,
    subtitle,
    hoverable = false,
    clickable = false,
    fullWidth = false,
    header,
    footer,
  } = entity

  const classes = {
    "iw-card": true,
    "iw-card-hoverable": hoverable || clickable,
    "iw-card-clickable": clickable,
    "iw-card-full-width": fullWidth,
  }

  const hasHeader = title || subtitle || header

  return html`
    <div
      class=${classMap(classes)}
      @click=${() => api.notify(`#${entity.id}:click`)}
    >
      ${hasHeader
        ? html`
            <div class="iw-card-header">
              ${header
                ? header
                : html`
                    ${title
                      ? html`<h3 class="iw-card-title">${title}</h3>`
                      : null}
                    ${subtitle
                      ? html`<p class="iw-card-subtitle">${subtitle}</p>`
                      : null}
                  `}
            </div>
          `
        : null}

      <div class="iw-card-body">
        <slot></slot>
      </div>

      ${footer ? html`<div class="iw-card-footer">${footer}</div>` : null}
    </div>
  `
}
