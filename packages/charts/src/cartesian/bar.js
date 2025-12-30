/* eslint-disable no-magic-numbers */

import { html, svg } from "lit-html"

import { renderAxisLines } from "../component/axis-lines.js"
import { renderGrid } from "../component/grid.js"
import { renderXAxis } from "../component/x-axis.js"
import { renderYAxis } from "../component/y-axis.js"
import { createChartContext } from "../context/chart-context.js"
import { renderBar } from "../shape/bar.js"

export const bar = {
  renderChart(entity) {
    if (!entity.data || entity.data.length === 0) {
      return svg`
        <svg width=${entity.width} height=${entity.height} viewBox="0 0 ${entity.width} ${entity.height}">
          <text x="50%" y="50%" text-anchor="middle" fill="#999" font-size="0.875em">No data</text>
        </svg>
      `
    }

    // Create context with scales and dimensions
    const context = createChartContext(entity, "bar")
    const { xScale, yScale, dimensions } = context
    const { width, height, padding } = dimensions

    // Independent components - declarative composition
    const grid = entity.showGrid
      ? renderGrid({
          xScale,
          yScale,
          width,
          height,
          padding,
        })
      : ""

    const axisLines = renderAxisLines({
      width,
      height,
      padding,
      yScale,
    })

    const xAxis = renderXAxis({
      entity,
      xScale,
      yScale,
      height,
      padding,
    })

    const yAxis = renderYAxis({
      yScale,
      padding,
    })

    // Bar shape - just draws rectangles
    const bars = renderBar({
      data: entity.data,
      xScale,
      yScale,
      height,
      padding,
      colors: entity.colors,
      showLabel: entity.showLabel !== false,
    })

    // SVG container
    const svgContent = svg`
      <svg
        width=${width}
        height=${height}
        viewBox="0 0 ${width} ${height}"
        class="iw-chart-svg"
      >
        ${grid}
        ${axisLines}
        ${xAxis}
        ${yAxis}
        ${bars}
      </svg>
    `

    return html` <div class="iw-chart">${svgContent}</div> `
  },
}
