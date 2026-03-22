/**
 * @typedef {import('../../../types/surfaces/paper').PaperProps} PaperProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

/**
 * Renders a surface container with elevation, radius, and padding options.
 * Use it as a generic surface for grouping content.
 * @param {PaperProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    type, // eslint-disable-line no-unused-vars
    element = "div",
    children,
    variant = "elevated",
    elevation = 1,
    radius = "md",
    padding = "md",
    className = "",
    ...rest
  } = props

  const extraClasses = Object.fromEntries(
    className
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => [name, true]),
  )

  return renderElement(
    element,
    {
      "iw-paper": true,
      [`iw-paper-${variant}`]: true,
      [`iw-paper-elevation-${Math.max(0, Math.min(4, elevation))}`]:
        variant === "elevated",
      [`iw-paper-padding-${padding}`]: true,
      [`iw-paper-radius-${radius}`]: radius !== "md",
      ...extraClasses,
    },
    rest,
    children,
  )
}

function renderElement(element, classes, rest, children) {
  const classValue = classMap(classes)
  const refValue = ref((el) => applyElementProps(el, rest))

  switch (element) {
    case "section":
      return html`<section class=${classValue} ${refValue}>
        ${children}
      </section>`
    case "main":
      return html`<main class=${classValue} ${refValue}>${children}</main>`
    case "header":
      return html`<header class=${classValue} ${refValue}>${children}</header>`
    case "footer":
      return html`<footer class=${classValue} ${refValue}>${children}</footer>`
    case "nav":
      return html`<nav class=${classValue} ${refValue}>${children}</nav>`
    case "aside":
      return html`<aside class=${classValue} ${refValue}>${children}</aside>`
    case "article":
      return html`<article class=${classValue} ${refValue}>
        ${children}
      </article>`
    default:
      return html`<div class=${classValue} ${refValue}>${children}</div>`
  }
}
