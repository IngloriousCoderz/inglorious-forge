/**
 * @typedef {import('../../../types/layout/flex').FlexProps} FlexProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, ref, staticHtml, unsafeStatic } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

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
  const tag = allowedElements.has(element) ? element : "div"
  const staticTag = unsafeStatic(tag)

  return staticHtml`<${staticTag}
    class=${classValue}
    @click=${onClick}
    ${ref((node) => applyElementProps(node, rest))}
  >
    ${children}
  </${staticTag}>`
}

const allowedElements = new Set([
  "div",
  "section",
  "main",
  "header",
  "footer",
  "nav",
  "aside",
  "article",
])
