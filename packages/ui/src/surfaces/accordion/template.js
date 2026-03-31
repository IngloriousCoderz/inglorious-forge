/**
 * @typedef {import('../../../types/surfaces/accordion').AccordionProps} AccordionProps
 * @typedef {import('../../../types/surfaces/accordion').AccordionItem} AccordionItem
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

export const Accordion = {
  /**
   * Main entrypoint for the accordion component. Delegates to the base accordion renderer for overrides.
   * Accordions render a list of collapsible items with optional icons.
   * @param {AccordionProps} props
   * @returns {TemplateResult}
   */
  render(props) {
    return this.renderAccordion(props)
  },

  /**
   * Renders the accordion container and iterates items.
   * Each item is delegated to `renderItem`.
   * @param {AccordionProps} props
   * @returns {TemplateResult}
   */
  renderAccordion(props) {
    const {
      type, // eslint-disable-line no-unused-vars
      items = [],
      className = "",
      ...rest
    } = props

    const extraClasses = Object.fromEntries(
      className
        .split(/\s+/)
        .filter(Boolean)
        .map((name) => [name, true]),
    )

    return html`<div
      class=${classMap({
        "iw-accordion": true,
        ...extraClasses,
      })}
      ${ref((el) => applyElementProps(el, rest))}
    >
      ${items.map((item, index) => this.renderItem(item, index, props))}
    </div>`
  },

  /**
   * Renders a single accordion item with trigger and panel content.
   * Handles expand/collapse behavior and item-level callbacks.
   * @param {AccordionItem} item
   * @param {number} index
   * @param {AccordionProps} props
   * @returns {TemplateResult}
   */
  renderItem(item, index, props) {
    const {
      title,
      content,
      isDisabled = false,
      isExpanded = false,
      onToggle,
      icon,
    } = item

    return html`<section
      class=${classMap({
        "iw-accordion-item": true,
        "iw-accordion-item-expanded": isExpanded,
        "iw-accordion-item-disabled": isDisabled,
      })}
    >
      <button
        class="iw-accordion-trigger"
        type="button"
        aria-expanded=${isExpanded}
        ?disabled=${isDisabled}
        @click=${() => {
          if (isDisabled) return
          onToggle?.(item, index, !isExpanded)
          props.onItemToggle?.(item, index, !isExpanded)
        }}
      >
        ${icon ? html`<span class="iw-accordion-icon">${icon}</span>` : null}
        <span class="iw-accordion-title">${title}</span>
        <span class="iw-accordion-caret">▾</span>
      </button>
      ${isExpanded
        ? html`<div class="iw-accordion-panel">${content}</div>`
        : null}
    </section>`
  },
}
