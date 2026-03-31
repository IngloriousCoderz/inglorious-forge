/**
 * @typedef {import('../../../types/navigation/breadcrumbs').BreadcrumbsProps} BreadcrumbsProps
 * @typedef {import('../../../types/navigation/breadcrumbs').BreadcrumbItem} BreadcrumbItem
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

export const Breadcrumbs = {
  /**
   * Main entrypoint for breadcrumbs navigation. Delegates to the base renderer for overrides.
   * Renders a list of path items separated by a configurable separator.
   * @param {BreadcrumbsProps} props
   * @returns {TemplateResult}
   */
  render(props) {
    return this.renderBreadcrumbs(props)
  },

  /**
   * Renders the breadcrumb container and iterates items.
   * Each item is delegated to `renderItem`.
   * @param {BreadcrumbsProps} props
   * @returns {TemplateResult}
   */
  renderBreadcrumbs(props) {
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
   * Renders a single breadcrumb item, handling current vs. link states.
   * Override to customize labels or link behavior.
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
            aria-current=${isLast ? "page" : "false"}
          >
            ${item.label}
          </span>`}
    </li>`
  },
}
