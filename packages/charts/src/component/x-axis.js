/* eslint-disable no-magic-numbers */
import { repeat, svg } from "@inglorious/web"

import {
  ensureValidNumber,
  formatDate,
  formatNumber,
  isValidNumber,
} from "../utils/data-utils.js"

/**
 * Renders the X Axis.
 * If customTicks is provided in props, it uses them to maintain stable labels during zoom.
 * * @param {any} entity
 * @param {Object} props
 * @param {import('d3-scale').ScaleBand|import('d3-scale').ScaleLinear|import('d3-scale').ScaleTime} props.xScale
 * @param {import('d3-scale').ScaleLinear} props.yScale
 * @param {number} props.width
 * @param {number} props.height
 * @param {Object} props.padding
 * @param {Array<number>} [props.customTicks] - Optional fixed indices to keep labels stable
 * @param {any} api
 */

// eslint-disable-next-line no-unused-vars
export function renderXAxis(entity, props, api) {
  const { xScale, yScale, width, height, padding, customTicks } = props

  // Determine Y position for the axis line (handle zero-crossing if necessary)
  let xAxisY = height - (padding?.bottom || 0)
  if (yScale) {
    const domain = yScale.domain()
    if (domain[0] < 0) {
      const zeroY = yScale(0)
      if (isValidNumber(zeroY)) xAxisY = zeroY
    }
  }
  xAxisY = ensureValidNumber(xAxisY, height || 0)

  // Logic for ScaleBand (Categorical/Bar charts)
  if (xScale.bandwidth) {
    const categories = customTicks || xScale.domain()
    const bandwidth = xScale.bandwidth()
    if (!isValidNumber(bandwidth) || bandwidth <= 0) return svg`<g></g>`

    const offsetForBand = bandwidth / 2

    return svg`
      <g class="iw-chart-xAxis">
        <line
          x1=${padding?.left || 0}
          y1=${xAxisY}
          x2=${(width || 0) - (padding?.right || 0)}
          y2=${xAxisY}
          stroke="#ddd"
          class="iw-chart-xAxis-line"
        />
        ${repeat(
          categories,
          (cat) => cat,
          (cat) => {
            const scaled = xScale(cat)
            if (!isValidNumber(scaled)) return svg``
            const x = scaled + offsetForBand
            return renderTick(x, xAxisY, cat)
          },
        )}
      </g>
    `
  }

  // Logic for Linear/Time Scale (Line charts)
  // CRITICAL: If customTicks are provided, use them directly to avoid "dancing" labels
  const ticks =
    customTicks || (xScale.ticks ? xScale.ticks(5) : xScale.domain())
  const useLabels = entity.xLabels && Array.isArray(entity.xLabels)

  return svg`
    <g class="iw-chart-xAxis">
      <line
        x1=${padding?.left || 0}
        y1=${xAxisY}
        x2=${(width || 0) - (padding?.right || 0)}
        y2=${xAxisY}
        stroke="#ddd"
        class="iw-chart-xAxis-line"
      />
      ${repeat(
        ticks,
        (t) => t,
        (t, i) => {
          const x = xScale(t)
          if (!isValidNumber(x)) return svg``

          // Safety: hide ticks that fall outside the physical drawing area
          if (
            x < (padding?.left || 0) ||
            x > (width || 0) - (padding?.right || 0)
          )
            return svg``

          const label =
            useLabels && entity.xLabels[i] !== undefined
              ? entity.xLabels[i]
              : entity.xAxisType === "time"
                ? formatDate(t)
                : formatNumber(t)

          return renderTick(x, xAxisY, label)
        },
      )}
    </g>
  `
}

/**
 * Internal helper to render a single tick group
 */
function renderTick(x, y, label) {
  return svg`
    <g class="iw-chart-xAxis-tick">
      <line x1=${x} y1=${y} x2=${x} y2=${y + 5} stroke="#ccc" />
      <text
        x=${x}
        y=${y + 20}
        text-anchor="middle"
        font-size="0.6875em"
        fill="#777"
        class="iw-chart-xAxis-tick-label"
      >${label}</text>
    </g>
  `
}
