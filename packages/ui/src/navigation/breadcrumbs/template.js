/**
 * @typedef {import('../../../types/navigation/breadcrumbs').BreadcrumbsProps} BreadcrumbsProps
 * @typedef {import('../../../types/navigation/breadcrumbs').BreadcrumbItem} BreadcrumbItem
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

export const breadcrumbs = {
  /**
   * @param {BreadcrumbsProps} props
   * @returns {TemplateResult}
   */
  render(props) {
    const {
      type, // eslint-disable-line no-unused-vars
      items = [],
      separator = "/",
      className = "",
      ...rest
    } = props

    const extraClasses = Object.fromEntries(
      className
        .split(/\s+/)
        .filter(Boolean)
        .map((name) => [name, true]),
    )

    return html`<nav
      aria-label="Breadcrumb"
      class=${classMap({ "iw-breadcrumbs": true, ...extraClasses })}
      ${ref((el) => applyElementProps(el, rest))}
    >
      <ol class="iw-breadcrumbs-list">
        ${items.map(
          (item, index) =>
            html`${this.renderItem(item, index, props)}${index <
            items.length - 1
              ? html`<li class="iw-breadcrumbs-separator" aria-hidden="true">
                  ${separator}
                </li>`
              : null}`,
        )}
      </ol>
    </nav>`
  },

  /**
   * @param {BreadcrumbItem} item
   * @param {number} index
   * @param {BreadcrumbsProps} props
   * @returns {TemplateResult}
   */
  renderItem(item, index, props) {
    const isLast = index === props.items.length - 1

    return html`<li class="iw-breadcrumbs-item">
      ${item.href && !isLast
        ? html`<a
            href=${item.href}
            class="iw-breadcrumbs-link"
            @click=${item.onClick ?? null}
          >
            ${item.label}
          </a>`
        : html`<span
            class=${classMap({
              "iw-breadcrumbs-current": isLast,
            })}
            aria-current=${isLast ? "page" : null}
          >
            ${item.label}
          </span>`}
    </li>`
  },
}
