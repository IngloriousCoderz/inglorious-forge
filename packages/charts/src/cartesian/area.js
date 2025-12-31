/* eslint-disable no-magic-numbers */

import { html, svg } from "lit-html"

import { renderAxisLines } from "../component/axis-lines.js"
import { renderGrid } from "../component/grid.js"
import { renderLegend } from "../component/legend.js"
import { renderXAxis } from "../component/x-axis.js"
import { renderYAxis } from "../component/y-axis.js"
import { createChartContext } from "../context/chart-context.js"
import { renderArea } from "../shape/area.js"

export const area = {
  renderChart(entity) {
    if (!entity.data || entity.data.length === 0) {
      return html`
        <div class="iw-chart">
          <svg
            width=${entity.width}
            height=${entity.height}
            viewBox="0 0 ${entity.width} ${entity.height}"
          >
            <text
              x="50%"
              y="50%"
              text-anchor="middle"
              fill="#999"
              font-size="0.875em"
            >
              No data
            </text>
          </svg>
        </div>
      `
    }

    // Create context with scales and dimensions
    const context = createChartContext(entity, "area")
    const { xScale, yScale, dimensions } = context
    const { width, height, padding } = dimensions

    // Independent components - declarative composition
    const grid = entity.showGrid
      ? renderGrid({
          entity,
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

    // Area shape - just draws paths
    // Default to non-stacked (stacked = false) for independent series
    const areas = renderArea({
      data: entity.data,
      xScale,
      yScale,
      baseValue: 0,
      colors: entity.colors,
      showPoints: entity.showPoints !== false,
      stacked: entity.stacked === true, // Only stack if explicitly set to true
    })

    // Legend - only for multiple series
    const isMultiSeries = Array.isArray(entity.data[0]?.values)
    const legend =
      isMultiSeries && entity.showLegend
        ? renderLegend({
            series: entity.data,
            colors: entity.colors,
            width,
            padding,
          })
        : ""

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
        ${areas}
        ${legend}
      </svg>
    `

    return html` <div class="iw-chart">${svgContent}</div> `
  },
}
