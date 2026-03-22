/**
 * @typedef {import('../../../types/surfaces/card').CardProps} CardProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

export const card = {
  /**
   * Main entrypoint for the card component. Delegates to the base card renderer for easy overrides.
   * Cards support header, body, and footer slots with optional click behavior.
   * @param {CardProps} props
   * @returns {TemplateResult}
   */
  render(props) {
    return this.renderCard(props)
  },

  /**
   * Renders the card container and composes header, body, and footer sub-sections.
   * Uses `element` to control the semantic tag.
   * @param {CardProps} props
   * @returns {TemplateResult}
   */
  renderCard(props) {
    const {
      type, // eslint-disable-line no-unused-vars
      element = "article",
      isHoverable = false,
      isClickable = false,
      isFullWidth = false,
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
      "iw-card-hoverable": isHoverable || isClickable,
      "iw-card-clickable": isClickable,
      "iw-card-full-width": isFullWidth,
      ...extraClasses,
    }

    return renderElement(
      element,
      classes,
      onClick,
      rest,
      () => html`
        ${this.renderHeader(props)} ${this.renderBody(props)}
        ${this.renderFooter(props)}
      `,
    )
  },

  /**
   * Renders the optional card header area (title, subtitle, or custom header content).
   * Returns `null` when no header content is provided.
   * @param {CardProps} props
   * @returns {TemplateResult | null}
   */
  renderHeader(props) {
    const { title, subtitle, header, headerPadding = "md" } = props

    if (header) {
      return html`<div
        class=${classMap({
          "iw-card-header": true,
          [`iw-card-header-padding-${headerPadding}`]: headerPadding !== "md",
        })}
      >
        ${header}
      </div>`
    }

    if (!title && !subtitle) return null

    return html`<div
      class=${classMap({
        "iw-card-header": true,
        [`iw-card-header-padding-${headerPadding}`]: headerPadding !== "md",
      })}
    >
      ${title ? html`<h3 class="iw-card-title">${title}</h3>` : null}
      ${subtitle ? html`<p class="iw-card-subtitle">${subtitle}</p>` : null}
    </div>`
  },

  /**
   * Renders the main card content area.
   * Returns `null` when there is no body or children content.
   * @param {CardProps} props
   * @returns {TemplateResult | null}
   */
  renderBody(props) {
    const { children, body, bodyPadding = "md" } = props
    const content = body ?? children

    if (content == null) return null

    return html`<div
      class=${classMap({
        "iw-card-body": true,
        [`iw-card-body-padding-${bodyPadding}`]: bodyPadding !== "md",
      })}
    >
      ${content}
    </div>`
  },

  /**
   * Renders the optional card footer area, typically for actions.
   * Returns `null` when no footer content is provided.
   * @param {CardProps} props
   * @returns {TemplateResult | null}
   */
  renderFooter(props) {
    const { footer, footerPadding = "md" } = props

    if (footer == null) return null

    return html`<div
      class=${classMap({
        "iw-card-footer": true,
        [`iw-card-footer-padding-${footerPadding}`]: footerPadding !== "md",
      })}
    >
      ${footer}
    </div>`
  },
}

function renderElement(element, classes, onClick, rest, renderContent) {
  const classValue = classMap(classes)
  const refValue = ref((el) => applyElementProps(el, rest))

  switch (element) {
    case "section":
      return html`<section class=${classValue} @click=${onClick} ${refValue}>
        ${renderContent()}
      </section>`
    case "div":
      return html`<div class=${classValue} @click=${onClick} ${refValue}>
        ${renderContent()}
      </div>`
    case "main":
      return html`<main class=${classValue} @click=${onClick} ${refValue}>
        ${renderContent()}
      </main>`
    case "header":
      return html`<header class=${classValue} @click=${onClick} ${refValue}>
        ${renderContent()}
      </header>`
    case "footer":
      return html`<footer class=${classValue} @click=${onClick} ${refValue}>
        ${renderContent()}
      </footer>`
    case "nav":
      return html`<nav class=${classValue} @click=${onClick} ${refValue}>
        ${renderContent()}
      </nav>`
    case "aside":
      return html`<aside class=${classValue} @click=${onClick} ${refValue}>
        ${renderContent()}
      </aside>`
    default:
      return html`<article class=${classValue} @click=${onClick} ${refValue}>
        ${renderContent()}
      </article>`
  }
}
