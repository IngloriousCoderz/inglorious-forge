/**
 * @typedef {import('../../../types/layout/flex').FlexProps} FlexProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html } from "@inglorious/web"

/**
 * Flex layout component for Inglorious Web.
 * Children are rendered as-is (templates/content composition).
 *
 * @param {FlexProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    element = "div",
    direction = "row",
    wrap = "nowrap",
    justify = "start",
    align = "stretch",
    gap = "md",
    padding = "none",
    isInline = false,
    isFullWidth = false,
    className = "",
    children = [],
    onClick,
  } = props

  const extraClasses = Object.fromEntries(
    className
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => [name, true]),
  )

  const classes = {
    "iw-flex": true,
    "iw-flex-inline": isInline,
    "iw-flex-full-width": isFullWidth,
    [`iw-flex-direction-${direction}`]: true,
    [`iw-flex-wrap-${wrap}`]: true,
    [`iw-flex-justify-${justify}`]: true,
    [`iw-flex-align-${align}`]: true,
    [`iw-flex-gap-${gap}`]: true,
    [`iw-flex-padding-${padding}`]: true,
    ...extraClasses,
  }

  return renderElement(element, classes, onClick, children)
}

function renderElement(element, classes, onClick, children) {
  const classValue = classMap(classes)

  switch (element) {
    case "section":
      return html`<section class=${classValue} @click=${onClick}>
        ${children}
      </section>`
    case "main":
      return html`<main class=${classValue} @click=${onClick}>
        ${children}
      </main>`
    case "header":
      return html`<header class=${classValue} @click=${onClick}>
        ${children}
      </header>`
    case "footer":
      return html`<footer class=${classValue} @click=${onClick}>
        ${children}
      </footer>`
    case "nav":
      return html`<nav class=${classValue} @click=${onClick}>${children}</nav>`
    case "aside":
      return html`<aside class=${classValue} @click=${onClick}>
        ${children}
      </aside>`
    case "article":
      return html`<article class=${classValue} @click=${onClick}>
        ${children}
      </article>`
    default:
      return html`<div class=${classValue} @click=${onClick}>${children}</div>`
  }
}
