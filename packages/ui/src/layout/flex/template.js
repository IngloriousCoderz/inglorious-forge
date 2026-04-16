/**
 * @typedef {import('../../../types/layout/flex').FlexProps} FlexProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap } from "@inglorious/web/directives/class-map"
import { ref } from "@inglorious/web/directives/ref"
import { staticHtml, unsafeStatic } from "@inglorious/web/static"

import { applyElementProps } from "../../shared/applyElementProps.js"

/**
 * Renders a flexible layout container with direction, alignment, spacing, and wrap control.
 * Use it to compose layouts without writing custom flexbox CSS.
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
    gap = "none",
    padding = "none",
    isInline = false,
    isFullWidth = false,
    className = "",
    children = [],
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

  return renderElement(element, classes, onClick, children, rest)
}

function renderElement(element, classes, onClick, children, rest) {
  const classValue = classMap(classes)
  const staticTag = unsafeStatic(element)

  return staticHtml`<${staticTag}
    class=${classValue}
    @click=${onClick}
    ${ref((node) => applyElementProps(node, rest))}
  >
    ${children}
  </${staticTag}>`
}
