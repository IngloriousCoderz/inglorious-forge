/* eslint-disable no-magic-numbers */

import { svg } from "@inglorious/web"

import { isValidNumber } from "../utils/data-utils.js"

/**
 * Renders a single dot/circle (primitive shape)
 * Similar to Recharts Dot component
 *
 * @param {Object} params
 * @param {number} params.cx - Center X
 * @param {number} params.cy - Center Y
 * @param {number|string} [params.r] - Radius
 * @param {string} [params.fill] - Fill color
 * @param {string} [params.stroke] - Stroke color
 * @param {string} [params.strokeWidth] - Stroke width
 * @param {string} [params.className] - CSS class
 * @param {Function} [params.onMouseEnter] - Mouse enter handler
 * @param {Function} [params.onMouseLeave] - Mouse leave handler
 * @returns {import('lit-html').TemplateResult}
 */
export function renderDot({
  cx,
  cy,
  r = "0.25em",
  fill,
  stroke = "white",
  strokeWidth = "0.125em",
  className = "iw-chart-dot",
  onMouseEnter,
  onMouseLeave,
}) {
  if (cx == null || cy == null) {
    return svg``
  }

  // Parse r to get numeric value and unit
  let rValue = 0.25
  let rUnit = ""

  if (typeof r === "string") {
    const match = r.match(/([\d.]+)([a-z%]*)/i)
    if (match) {
      rValue = parseFloat(match[1]) || 0.25
      rUnit = match[2] || ""
    } else {
      rValue = parseFloat(r) || 0.25
    }
  } else if (typeof r === "number" && isValidNumber(r) && r > 0) {
    rValue = r
  }

  // Ensure rValue is always valid
  if (!isValidNumber(rValue) || rValue <= 0) {
    rValue = 0.25
  }

  const rString = rValue.toString() + rUnit

  // Handle mouse enter - increase radius
  const handleMouseEnter = (e) => {
    const circle = e.currentTarget
    const currentR = circle.getAttribute("r")
    const match = currentR.match(/([\d.]+)([a-z%]*)/i)
    const currentRValue = match ? parseFloat(match[1]) : rValue
    const currentRUnit = match ? match[2] : rUnit

    // Store original if not already stored
    if (!circle.getAttribute("data-original-r")) {
      circle.setAttribute("data-original-r", currentR)
    }

    // Increase by 1.5x (0.25em -> 0.375em)
    const newR = (currentRValue * 1.5).toString() + currentRUnit
    circle.setAttribute("r", newR)

    if (onMouseEnter) onMouseEnter(e)
  }

  // Handle mouse leave - restore original radius
  const handleMouseLeave = (e) => {
    const circle = e.currentTarget
    const originalR = circle.getAttribute("data-original-r") || rString
    circle.setAttribute("r", originalR)

    if (onMouseLeave) onMouseLeave(e)
  }

  return svg`
    <circle
      cx=${cx}
      cy=${cy}
      r=${rString}
      fill=${fill}
      stroke=${stroke}
      stroke-width=${strokeWidth}
      class=${className}
      data-original-r=${rString}
      @mouseenter=${handleMouseEnter}
      @mouseleave=${handleMouseLeave}
    />
  `
}
