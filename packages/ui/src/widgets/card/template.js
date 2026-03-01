/**
 * @typedef {import('../../../types/widgets/card').CardProps} CardProps
 * @typedef {import('@inglorious/web').Api} Api
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

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
 * @param {CardProps} props
 * @param {Api} api
 * @returns {TemplateResult}
 */
export const card = {
  render(props, api) {
    const {
      hoverable = false,
      clickable = false,
      fullWidth = false,
      onClick,
    } = props

    const classes = {
      "iw-card": true,
      "iw-card-hoverable": hoverable || clickable,
      "iw-card-clickable": clickable,
      "iw-card-full-width": fullWidth,
    }

    return html`
      <div class=${classMap(classes)} @click=${onClick}>
        ${this.renderHeader(props, api)} ${this.renderBody(props, api)}
        ${this.renderFooter(props, api)}
      </div>
    `
  },

  /**
   * Default header renderer.
   * Override in composed types for custom header rendering.
   * @param {CardProps} props
   * @returns {TemplateResult | null}
   */
  renderHeader(props) {
    const { title, subtitle } = props
    const hasHeader = title || subtitle
    if (!hasHeader) return null

    return html`<div class="iw-card-header">
      ${title ? html`<h3 class="iw-card-title">${title}</h3>` : null}
      ${subtitle ? html`<p class="iw-card-subtitle">${subtitle}</p>` : null}
    </div>`
  },

  /**
   * Default body renderer.
   * Override in composed types for custom body rendering.
   * @returns {TemplateResult}
   */
  renderBody() {
    return html`<div class="iw-card-body">
      <slot></slot>
    </div>`
  },

  /**
   * Default footer renderer.
   * Override in composed types for custom footer rendering.
   * @returns {TemplateResult | null}
   */
  renderFooter() {
    return null
  },
}
