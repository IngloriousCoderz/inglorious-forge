/**
 * @typedef {import('../../../types/layout/grid').GridProps} GridProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, styleMap } from "@inglorious/web"

/**
 * Renders a CSS grid container with configurable columns, gaps, and alignment.
 * Supports fixed column counts or auto-fit with a minimum column width.
 * @param {GridProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    element = "div",
    columns = 0,
    minColumnWidth = 0,
    gap = "md",
    padding = "none",
    align = "stretch",
    justify = "stretch",
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
    "iw-grid": true,
    "iw-grid-full-width": isFullWidth,
    [`iw-grid-gap-${gap}`]: true,
    [`iw-grid-padding-${padding}`]: true,
    [`iw-grid-align-${align}`]: align !== "stretch",
    [`iw-grid-justify-${justify}`]: justify !== "stretch",
    ...extraClasses,
  }

  const styles = {}
  if (typeof columns !== "number") {
    styles.gridTemplateColumns = columns
  } else {
    styles.gridTemplateColumns = `repeat(${columns || "auto-fit"}, minmax(${minColumnWidth}, 1fr))`
  }

  return renderElement(element, classes, styles, onClick, children)
}

function renderElement(element, classes, styles, onClick, children) {
  const classValue = classMap(classes)
  const styleValue = styleMap(styles)

  switch (element) {
    case "section":
      return html`<section
        class=${classValue}
        style=${styleValue}
        @click=${onClick}
      >
        ${children}
      </section>`
    case "main":
      return html`<main
        class=${classValue}
        style=${styleValue}
        @click=${onClick}
      >
        ${children}
      </main>`
    case "header":
      return html`<header
        class=${classValue}
        style=${styleValue}
        @click=${onClick}
      >
        ${children}
      </header>`
    case "footer":
      return html`<footer
        class=${classValue}
        style=${styleValue}
        @click=${onClick}
      >
        ${children}
      </footer>`
    case "nav":
      return html`<nav
        class=${classValue}
        style=${styleValue}
        @click=${onClick}
      >
        ${children}
      </nav>`
    case "aside":
      return html`<aside
        class=${classValue}
        style=${styleValue}
        @click=${onClick}
      >
        ${children}
      </aside>`
    case "article":
      return html`<article
        class=${classValue}
        style=${styleValue}
        @click=${onClick}
      >
        ${children}
      </article>`
    default:
      return html`<div
        class=${classValue}
        style=${styleValue}
        @click=${onClick}
      >
        ${children}
      </div>`
  }
}
