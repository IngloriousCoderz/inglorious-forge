/**
 * @typedef {import('../../../types/data-display/list').ListProps} ListProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref, repeat } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

const PRETTY_INDEX = 1

export const list = {
  /**
   * @param {ListProps} props
   * @returns {TemplateResult}
   */
  render(props) {
    const {
      type, // eslint-disable-line no-unused-vars
      items = [],
      children,
      isOrdered = false,
      isDense = false,
      isDivided = false,
      className = "",
      onItemClick,
      ...rest
    } = props

    const extraClasses = Object.fromEntries(
      className
        .split(/\s+/)
        .filter(Boolean)
        .map((name) => [name, true]),
    )

    const classes = {
      "iw-list": true,
      "iw-list-ordered": isOrdered,
      "iw-list-dense": isDense,
      "iw-list-divided": isDivided,
      ...extraClasses,
    }

    const content =
      children ??
      repeat(
        items,
        (item, index) => item?.id ?? `${index}`,
        (item, index) => this.renderItem(props, { item, index, onItemClick }),
      )

    if (isOrdered) {
      return html`
        <ol
          class=${classMap(classes)}
          ${ref((el) => applyElementProps(el, rest))}
        >
          ${content}
        </ol>
      `
    }

    return html`
      <ul
        class=${classMap(classes)}
        ${ref((el) => applyElementProps(el, rest))}
      >
        ${content}
      </ul>
    `
  },

  /**
   * @param {ListProps} props
   * @param {{item: unknown, index: number}} payload
   * @returns {TemplateResult}
   */
  renderItem(props, { item, index, onItemClick }) {
    const text =
      item?.label ?? item?.children ?? item ?? `${index + PRETTY_INDEX}`
    return html`<li
      class="iw-list-item"
      @click=${() => onItemClick(item, index)}
    >
      ${text}
    </li>`
  },
}
