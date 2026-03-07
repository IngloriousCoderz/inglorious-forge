/**
 * @typedef {import('../../../types/surfaces/card').CardProps} CardProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

export const card = {
  /**
   * @param {CardProps} props
   * @returns {TemplateResult}
   */
  render(props) {
    const {
      type, // eslint-disable-line no-unused-vars
      hoverable = false,
      clickable = false,
      fullWidth = false,
      className = "",
      onClick,
      ...rest
    } = props

    const extraClasses = Object.fromEntries(
      className
        .split(/\s+/)
        .filter(Boolean)
        .map((name) => [name, true]),
    )

    const classes = {
      "iw-card": true,
      "iw-card-hoverable": hoverable || clickable,
      "iw-card-clickable": clickable,
      "iw-card-full-width": fullWidth,
      ...extraClasses,
    }

    return html`<article
      class=${classMap(classes)}
      @click=${onClick}
      ${ref((el) => applyElementProps(el, rest))}
    >
      ${this.renderHeader(props)} ${this.renderBody(props)}
      ${this.renderFooter(props)}
    </article>`
  },

  /**
   * @param {CardProps} props
   * @returns {TemplateResult | null}
   */
  renderHeader(props) {
    const { title, subtitle, header } = props

    if (header) {
      return html`<div class="iw-card-header">${header}</div>`
    }

    if (!title && !subtitle) return null

    return html`<div class="iw-card-header">
      ${title ? html`<h3 class="iw-card-title">${title}</h3>` : null}
      ${subtitle ? html`<p class="iw-card-subtitle">${subtitle}</p>` : null}
    </div>`
  },

  /**
   * @param {CardProps} props
   * @returns {TemplateResult | null}
   */
  renderBody(props) {
    const { children, body } = props
    const content = body ?? children

    if (content == null) return null

    return html`<div class="iw-card-body">${content}</div>`
  },

  /**
   * @param {CardProps} props
   * @returns {TemplateResult | null}
   */
  renderFooter(props) {
    const { footer } = props

    if (footer == null) return null

    return html`<div class="iw-card-footer">${footer}</div>`
  },
}
