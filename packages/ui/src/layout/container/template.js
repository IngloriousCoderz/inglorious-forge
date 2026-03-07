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
 * @param {ContainerProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    type, // eslint-disable-line no-unused-vars
    children,
    maxWidth = "lg",
    fixed = false,
    disableGutters = false,
    center = true,
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
    "iw-container-fixed": fixed,
    "iw-container-no-gutters": disableGutters,
    "iw-container-centered": center,
    ...extraClasses,
  }

  const styles = getContainerStyle(maxWidth, fixed)

  return html`<div
    class=${classMap(classes)}
    style=${styleMap(styles)}
    ${ref((el) => applyElementProps(el, rest))}
  >
    ${children}
  </div>`
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
