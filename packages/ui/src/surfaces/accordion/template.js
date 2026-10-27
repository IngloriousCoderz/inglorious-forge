/**
 * @typedef {import('../../../types/surfaces/accordion').AccordionProps} AccordionProps
 * @typedef {import('../../../types/surfaces/accordion').AccordionItem} AccordionItem
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html, nothing } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { ref } from "@inglorious/web/directives/ref"
import { when } from "@inglorious/web/directives/when"

import { applyElementProps } from "../../shared/apply-element-props.js"

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
      name, // eslint-disable-line no-unused-vars
      items = [],
      className = "",
      onItemToggle, // eslint-disable-line no-unused-vars
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
   * Renders a single accordion item as a native `<details>`, whose `<summary>`
   * is the trigger. The browser opens and closes it, keeps the panel's
   * content findable (find-in-page opens the item that holds a match), and,
   * when the accordion has a `name`, closes the other items as one opens.
   * Each change is reported so the store can follow.
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

    return html`<details
      class=${classMap({
        "iw-accordion-item": true,
        "iw-accordion-item-expanded": isExpanded,
        "iw-accordion-item-disabled": isDisabled,
      })}
      name=${props.name || nothing}
      .open=${isExpanded}
      @toggle=${(event) => {
        // newState is what the browser says; an environment whose toggle
        // event lacks it, such as jsdom, still has the element's own state.
        const isOpen = event.newState
          ? event.newState === "open"
          : event.currentTarget.open
        // Also fires when isExpanded opened it, which needs no report.
        if (isOpen === isExpanded) return
        onToggle?.(item, index, isOpen)
        props.onItemToggle?.(item, index, isOpen)
      }}
    >
      <summary
        class="iw-accordion-trigger"
        aria-disabled=${isDisabled ? "true" : nothing}
        @click=${(event) => {
          // A summary cannot be disabled, so its toggle is refused instead.
          if (isDisabled) event.preventDefault()
        }}
      >
        ${when(icon, () => html`<span class="iw-accordion-icon">${icon}</span>`)}
        <span class="iw-accordion-title">${title}</span>
        <span class="iw-accordion-caret" aria-hidden="true">▾</span>
      </summary>
      <div class="iw-accordion-panel">${content}</div>
    </details>`
  },
}
