/**
 * @typedef {import('../../../types/layout/container').ContainerProps} ContainerProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref, styleMap } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

const SIZE_TO_MAX_WIDTH = {
  xs: "32rem",
  sm: "40rem",
  md: "52rem",
  lg: "68rem",
  xl: "80rem",
}

/**
 * Renders a responsive layout container with optional max width and padding.
 * Use it to constrain page content while keeping semantic HTML tags.
 * @param {ContainerProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    type, // eslint-disable-line no-unused-vars
    element = "div",
    children,
    maxWidth = "lg",
    isFixed = false,
    padding = "md",
    isCentered = true,
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
    "iw-container": true,
    "iw-container-fixed": isFixed,
    "iw-container-centered": isCentered,
    [`iw-container-padding-${padding}`]: true,
    ...extraClasses,
  }

  const styles = getContainerStyle(maxWidth, isFixed)

  return renderElement(element, classes, styles, rest, children)
}

function renderElement(element, classes, styles, rest, children) {
  const classValue = classMap(classes)
  const styleValue = styleMap(styles)
  const refValue = ref((el) => applyElementProps(el, rest))

  switch (element) {
    case "section":
      return html`<section class=${classValue} style=${styleValue} ${refValue}>
        ${children}
      </section>`
    case "main":
      return html`<main class=${classValue} style=${styleValue} ${refValue}>
        ${children}
      </main>`
    case "header":
      return html`<header class=${classValue} style=${styleValue} ${refValue}>
        ${children}
      </header>`
    case "footer":
      return html`<footer class=${classValue} style=${styleValue} ${refValue}>
        ${children}
      </footer>`
    case "nav":
      return html`<nav class=${classValue} style=${styleValue} ${refValue}>
        ${children}
      </nav>`
    case "aside":
      return html`<aside class=${classValue} style=${styleValue} ${refValue}>
        ${children}
      </aside>`
    case "article":
      return html`<article class=${classValue} style=${styleValue} ${refValue}>
        ${children}
      </article>`
    default:
      return html`<div class=${classValue} style=${styleValue} ${refValue}>
        ${children}
      </div>`
  }
}

function getContainerStyle(maxWidth, fixed) {
  if (maxWidth === false || maxWidth === "none") {
    return { maxWidth: "none" }
  }

  if (fixed && typeof maxWidth === "string" && SIZE_TO_MAX_WIDTH[maxWidth]) {
    return {
      width: "100%",
      maxWidth: SIZE_TO_MAX_WIDTH[maxWidth],
    }
  }

  if (typeof maxWidth === "number") {
    return { maxWidth: `${maxWidth}px` }
  }

  if (typeof maxWidth === "string") {
    return {
      maxWidth: SIZE_TO_MAX_WIDTH[maxWidth] ?? maxWidth,
    }
  }

  return { maxWidth: SIZE_TO_MAX_WIDTH.lg }
}
