/**
 * @typedef {import('../../../types/data-display/typography').TypographyEntity} TypographyEntity
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

/**
 * @param {TypographyEntity} entity
 * @returns {TemplateResult}
 */
export function render(entity) {
  const {
    children,
    variant = "body",
    align = "left",
    weight,
    color,
    noWrap = false,
    gutterBottom = false,
    className = "",
    ...rest
  } = entity

  const extraClasses = Object.fromEntries(
    className
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => [name, true]),
  )

  const classes = {
    "iw-typography": true,
    [`iw-typography-${variant}`]: variant !== "body",
    [`iw-typography-align-${align}`]: align !== "left",
    "iw-typography-nowrap": noWrap,
    "iw-typography-gutter-bottom": gutterBottom,
    ...extraClasses,
  }

  return renderTag(variant, classes, children, { weight, color, rest })
}

function renderTag(variant, classes, children, options) {
  const { weight, color, rest } = options

  if (variant === "h1") {
    return html`<h1
      class=${classMap(classes)}
      style=${buildStyle(weight, color)}
      ${ref((el) => applyElementProps(el, rest))}
    >
      ${children}
    </h1>`
  }

  if (variant === "h2") {
    return html`<h2
      class=${classMap(classes)}
      style=${buildStyle(weight, color)}
      ${ref((el) => applyElementProps(el, rest))}
    >
      ${children}
    </h2>`
  }

  if (variant === "h3") {
    return html`<h3
      class=${classMap(classes)}
      style=${buildStyle(weight, color)}
      ${ref((el) => applyElementProps(el, rest))}
    >
      ${children}
    </h3>`
  }

  if (variant === "caption" || variant === "overline") {
    return html`<span
      class=${classMap(classes)}
      style=${buildStyle(weight, color)}
      ${ref((el) => applyElementProps(el, rest))}
    >
      ${children}
    </span>`
  }

  return html`<p
    class=${classMap(classes)}
    style=${buildStyle(weight, color)}
    ${ref((el) => applyElementProps(el, rest))}
  >
    ${children}
  </p>`
}

function buildStyle(weight, color) {
  const parts = []

  if (weight) {
    parts.push(`font-weight: ${weight};`)
  }

  if (color) {
    parts.push(`color: ${color};`)
  }

  return parts.join(" ")
}
