/**
 * @typedef {import('../../../types/data-display/list').ListProps} ListProps
 * @typedef {import('../../../types/data-display/list').ListItem} ListItem
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 * @typedef {{
 *   id: string | number,
 *   primary: TemplateResult | string | number,
 *   secondary?: TemplateResult | string | number,
 *   icon?: TemplateResult | string | number,
 *   action?: TemplateResult | string | number,
 *   isExpanded?: boolean,
 *   onToggle?: (item: ListItem, path: number[]) => void,
 *   isDisabled?: boolean,
 *   isSelected?: boolean,
 *   hasDivider?: boolean,
 *   onClick?: (item: ListItem, path: number[]) => void,
 *   children?: ListItem[] | TemplateResult | string | number | null,
 *   raw?: ListItem,
 * }} ListItemMeta
 */

import { classMap, html, ref, repeat, when } from "@inglorious/web"

import { iconButton } from "../../controls/icon-button"
import { flex } from "../../layout/flex"
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
      isInset = false,
      padding = "none",
      path = [],
      className = "",
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
      "iw-list-inset": isInset,
      [`iw-list-padding-${padding}`]: padding !== "none",
      ...extraClasses,
    }

    const content =
      children ??
      repeat(
        items,
        (item, index) => item?.id ?? `${index}`,
        (item, index) => {
          const meta = getItemMeta(item, index)
          const shouldDivide =
            (isDivided || meta.hasDivider) && index < items.length - 1

          return html`${this.renderItem(props, {
            item,
            meta,
            index,
            path: [...path, index],
          })}${shouldDivide
            ? html`<li class="iw-list-divider" role="separator"></li>`
            : null}`
        },
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
   * @param {{
   *   item: ListItem,
   *   meta: ListItemMeta,
   *   index: number,
   *   path: number[]
   * }} payload
   * @returns {TemplateResult}
   */
  renderItem(props, { item, meta, path }) {
    const {
      primary,
      secondary,
      icon,
      isDisabled,
      isSelected,
      onClick,
      raw,
      children,
      action,
      isExpanded,
      onToggle,
    } = meta

    if (meta.title) {
      return html`<li class="iw-list-title">${meta.title}</li>`
    }

    const isClickable = !!props.onItemClick || !!onClick
    const hasChildren = Array.isArray(children) && children.length > 0
    const hasAction = !!action

    const listItemClassName = [
      "iw-list-item",
      isClickable && "iw-list-item-clickable",
      isDisabled && "iw-list-item-disabled",
      isSelected && "iw-list-item-selected",
      props.isInset && !icon && "iw-list-item-inset",
    ]
      .filter(Boolean)
      .join(" ")

    return flex.render({
      element: "li",
      padding: "sm",
      direction: "column",
      className: listItemClassName,
      onClick: (event) => {
        event.stopPropagation()
        if (isDisabled) return
        onClick?.(raw ?? item, path)
        props.onItemClick?.(raw ?? item, path)
      },
      children: [
        flex.render({
          align: "center",
          gap: "sm",
          children: [
            when(icon, () =>
              iconButton.render({
                icon,
                size: "sm",
                color: "secondary",
                variant: "ghost",
                shape: "square",
                className: "iw-list-item-icon",
              }),
            ),
            flex.render({
              direcion: "column",
              gap: "sm",
              className: "iw-list-item-content",
              children: [
                html`<div class="iw-list-item-primary">${primary}</div>`,
                when(
                  secondary,
                  () =>
                    html`<div class="iw-list-item-secondary">
                      ${secondary}
                    </div>`,
                ),
              ],
            }),
            when(
              hasChildren || hasAction,
              () =>
                html`<span class="iw-list-item-trailing">
                  ${when(hasChildren, () =>
                    iconButton.render({
                      variant: "ghost",
                      color: "secondary",
                      size: "sm",
                      shape: "square",
                      className: "iw-list-item-toggle",
                      isDisabled,
                      ariaLabel: "Toggle section",
                      "aria-expanded": isExpanded,
                      onClick: (event) => {
                        event.stopPropagation()
                        if (isDisabled) return
                        onToggle?.(raw ?? item, path)
                        props.onItemToggle?.(raw ?? item, path)
                      },
                      icon: html`<span
                        class="iw-list-item-caret"
                        aria-hidden="true"
                        >❯</span
                      >`,
                      label: "",
                    }),
                  )}
                  ${when(
                    action,
                    () =>
                      html`<span
                        class="iw-list-item-action"
                        @click=${(event) => event.stopPropagation()}
                      >
                        ${action}
                      </span>`,
                  )}
                </span>`,
            ),
          ],
        }),
        when(hasChildren, () =>
          when(isExpanded, () =>
            this.render({
              ...props,
              items: children,
              className: `${props.className ?? ""} iw-list-nested`.trim(),
              path,
            }),
          ),
        ),
      ],
    })
  },
}

function getItemMeta(item, index) {
  if (!item || typeof item !== "object") {
    return {
      id: `${index}`,
      primary: item ?? `${index + PRETTY_INDEX}`,
    }
  }

  const {
    id,
    label,
    primary,
    secondary,
    icon,
    title,
    isDisabled = false,
    isSelected = false,
    hasDivider = false,
    onClick,
    children,
    action,
    isExpanded = false,
    onToggle,
  } = item

  const hasNestedChildren = Array.isArray(children)
  const normalizedChildren = hasNestedChildren
    ? children
    : typeof children === "string" || typeof children === "number"
      ? children
      : null

  return {
    id: id ?? `${index}`,
    primary:
      primary ??
      label ??
      (hasNestedChildren ? "" : normalizedChildren) ??
      `${index + PRETTY_INDEX}`,
    secondary,
    icon,
    title,
    isDisabled,
    isSelected,
    hasDivider,
    onClick,
    children: hasNestedChildren ? children : normalizedChildren,
    action,
    isExpanded,
    onToggle,
    raw: item,
  }
}
