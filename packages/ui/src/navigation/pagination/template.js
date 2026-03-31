/**
 * @typedef {import('../../../types/navigation/pagination').PaginationProps} PaginationProps
 * @typedef {import('../../../types/navigation/pagination').PaginationItemRenderProps} PaginationItemRenderProps
 * @typedef {import('../../../types/navigation/pagination').PaginationControlRenderProps} PaginationControlRenderProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html } from "@inglorious/web"

import { Button } from "../../controls/button/index.js"

const PRETTY_PAGE = 1

export const Pagination = {
  /**
   * Main entrypoint for pagination controls. Delegates to the base renderer for overrides.
   * Supports sibling ranges, first/last buttons, and disabled state.
   * @param {PaginationProps} props
   * @returns {TemplateResult}
   */
  render(props) {
    return this.renderPagination(props)
  },

  /**
   * Renders the pagination container and page/control items.
   * Items are delegated to `renderItem` and `renderControl`.
   * @param {PaginationProps} props
   * @returns {TemplateResult}
   */
  renderPagination(props) {
    const {
      page = 1,
      count = 1,
      siblingCount = 1,
      isFirstButtonVisible = false,
      isLastButtonVisible = false,
      isDisabled = false,
      className = "",
    } = props

    const items = getPageItems(page, count, siblingCount)
    const extraClasses = Object.fromEntries(
      className
        .split(/\s+/)
        .filter(Boolean)
        .map((name) => [name, true]),
    )

    return html`<nav
      class=${classMap({ "iw-pagination": true, ...extraClasses })}
      aria-label="Pagination"
    >
      ${isFirstButtonVisible
        ? this.renderControl(props, {
            label: "«",
            target: 1,
            isDisabled: page <= PRETTY_PAGE || isDisabled,
          })
        : null}
      ${this.renderControl(props, {
        label: "‹",
        target: Math.max(PRETTY_PAGE, page - PRETTY_PAGE),
        isDisabled: page <= PRETTY_PAGE || isDisabled,
      })}
      ${items.map((item) => this.renderItem(props, { item }))}
      ${this.renderControl(props, {
        label: "›",
        target: Math.min(count, page + PRETTY_PAGE),
        isDisabled: page >= count || isDisabled,
      })}
      ${isLastButtonVisible
        ? this.renderControl(props, {
            label: "»",
            target: count,
            isDisabled: page >= count || isDisabled,
          })
        : null}
    </nav>`
  },

  /**
   * Renders a single page number item or ellipsis.
   * Uses the button primitive for interactive pages.
   * @param {PaginationProps} props
   * @param {PaginationItemRenderProps} payload
   * @returns {TemplateResult}
   */
  renderItem(props, { item }) {
    if (item === "…") {
      return html`<span class="iw-pagination-ellipsis">…</span>`
    }

    const isCurrent = item === props.page
    return Button.render({
      variant: isCurrent ? "default" : props.buttonVariant,
      color: isCurrent ? "primary" : props.buttonColor,
      size: props.buttonSize,
      className: [
        "iw-pagination-item",
        isCurrent ? "iw-pagination-item-current" : "",
        props.itemClassName ?? "",
      ]
        .filter(Boolean)
        .join(" "),
      "aria-current": isCurrent ? "page" : null,
      isDisabled: props.isDisabled,
      onClick: () => props.onChange?.(item),
      children: item,
    })
  },

  /**
   * Renders a navigation control (first/prev/next/last).
   * Uses the button primitive and wires change events.
   * @param {PaginationProps} props
   * @param {PaginationControlRenderProps} payload
   * @returns {TemplateResult}
   */
  renderControl(
    props,
    { label, target, isDisabled = false, onChange = props.onChange },
  ) {
    return Button.render({
      variant: props.buttonVariant,
      color: props.buttonColor,
      size: props.buttonSize,
      className: ["iw-pagination-item", props.itemClassName ?? ""]
        .filter(Boolean)
        .join(" "),
      ariaLabel: `Go to page ${target}`,
      isDisabled,
      onClick: () => onChange?.(target),
      children: label,
    })
  },
}

function getPageItems(page, count, siblingCount) {
  if (count <= 7) {
    return Array.from({ length: count }, (_, index) => index + PRETTY_PAGE)
  }

  const start = Math.max(PRETTY_PAGE + PRETTY_PAGE, page - siblingCount)
  const end = Math.min(count - PRETTY_PAGE, page + siblingCount)
  const items = [1]

  if (start > 2) items.push("…")
  for (let current = start; current <= end; current += PRETTY_PAGE) {
    items.push(current)
  }
  if (end < count - PRETTY_PAGE) items.push("…")
  items.push(count)

  return items
}
