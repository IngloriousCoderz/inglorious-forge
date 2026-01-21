/* eslint-disable no-magic-numbers */

import { html, svg } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"

import { renderGrid } from "../component/grid.js"
import { renderTooltip } from "../component/tooltip.js"
import { renderXAxis } from "../component/x-axis.js"
import { renderYAxis } from "../component/y-axis.js"
import { renderCurve } from "../shape/curve.js"
import { renderDot } from "../shape/dot.js"
import { renderCartesianLayout } from "../utils/cartesian-layout.js"
import {
  getDataPointLabel,
  getDataPointX,
  getDataPointY,
  getSeriesValues,
  isMultiSeries,
} from "../utils/data-utils.js"
import {
  calculateStackedData,
  generateAreaPath,
  generateLinePath,
  generateStackedAreaPath,
} from "../utils/paths.js"
import { createCartesianContext } from "../utils/scales.js"
import { createTooltipHandlers } from "../utils/tooltip-handlers.js"

// Store dimensions for composition methods (keyed by entityId)
const compositionDimensions = new Map()
// Store dataKeys used in areas (keyed by entityId)
const compositionDataKeys = new Map()

// Calculate padding based on chart dimensions (same as logic.js)
function calculatePadding(width = 800, height = 400) {
  return {
    top: Math.max(20, height * 0.05),
    right: Math.max(20, width * 0.05),
    bottom: Math.max(40, height * 0.1),
    left: Math.max(50, width * 0.1),
  }
}

export const area = {
  renderChart(entity, api) {
    // Area curves - uses Curve and Dot primitives (like Recharts Area component)
    // Default to non-stacked (stacked = false) for independent series
    const areas = renderAreaCurves({
      data: entity.data,
      entity,
      api,
    })

    return renderCartesianLayout({
      entity,
      api,
      chartType: "area",
      chartContent: areas,
    })
  },

  // Composition methods (Recharts-style)
  renderAreaChart(entityId, children, api, config = {}) {
    const entity = api.getEntity(entityId)
    if (!entity) {
      return svg`<text>Entity ${entityId} not found</text>`
    }

    // Store composition dataKeys
    const dataKeysSet = new Set()
    if (config.dataKeys && Array.isArray(config.dataKeys)) {
      config.dataKeys.forEach((key) => dataKeysSet.add(key))
    }
    compositionDataKeys.set(entityId, dataKeysSet)

    // Extract dimensions from config
    const style = config.style || {}
    const parseDimension = (value) => {
      if (typeof value === "number") return value
      if (typeof value === "string") {
        const num = parseFloat(value)
        if (!isNaN(num) && !value.includes("%") && !value.includes("px")) {
          return num
        }
      }
      return undefined
    }

    const width =
      parseDimension(config.width || style.width) ||
      parseDimension(entity.width) ||
      800
    const height =
      parseDimension(config.height || style.height) ||
      parseDimension(entity.height) ||
      400
    const padding = calculatePadding(width, height)

    // Store dimensions for composition methods to access
    compositionDimensions.set(entityId, { width, height, padding })

    // Merge style attributes
    const svgStyle = {
      width: style.width || (typeof width === "number" ? `${width}px` : width),
      height:
        style.height || (typeof height === "number" ? `${height}px` : height),
      maxWidth: style.maxWidth,
      maxHeight: style.maxHeight,
      aspectRatio: style.aspectRatio,
      margin: style.margin,
      ...style,
    }

    const styleString = Object.entries(svgStyle)
      .filter(([, value]) => value != null)
      .map(([key, value]) => {
        const kebabKey = key.replace(/([A-Z])/g, "-$1").toLowerCase()
        return `${kebabKey}: ${value}`
      })
      .join("; ")

    return html`
      <div class="iw-chart" style="display: block; margin: 0; padding: 0; position: relative; width: 100%; box-sizing: border-box;">
        <svg
          width=${width}
          height=${height}
          viewBox="0 0 ${width} ${height}"
          class="iw-chart-svg"
          style=${styleString || undefined}
        >
          ${children}
        </svg>
      </div>
    `
  },

  // Helper to get transformed data
  _getTransformedData(entity, dataKey) {
    if (!entity || !entity.data) return null
    return entity.data.map((d, i) => ({
      x: i,
      y: d[dataKey] !== undefined ? d[dataKey] : d.y || d.value || 0,
      name: d[dataKey] || d.name || d.x || d.date || i,
    }))
  },

  // Helper to create shared context
  _createSharedContext(entity, entityId) {
    const storedDimensions = entityId
      ? compositionDimensions.get(entityId)
      : null
    const usedDataKeys = entityId ? compositionDataKeys.get(entityId) : null

    const dataForScale = entity.data.map((d, i) => {
      let maxValue = 0

      if (usedDataKeys && usedDataKeys.size > 0) {
        usedDataKeys.forEach((dataKey) => {
          const value = d[dataKey]
          if (typeof value === "number" && value > maxValue) {
            maxValue = value
          }
        })
      } else {
        const numericValues = Object.entries(d)
          .filter(
            ([key, value]) =>
              key !== "name" &&
              key !== "x" &&
              key !== "date" &&
              typeof value === "number",
          )
          .map(([, value]) => value)
        maxValue = numericValues.length > 0 ? Math.max(...numericValues) : 0
      }

      return {
        x: i,
        y: maxValue,
      }
    })

    const width = storedDimensions?.width || entity.width || 800
    const height = storedDimensions?.height || entity.height || 400
    const padding = storedDimensions?.padding || calculatePadding(width, height)
    const entityWithDimensions = {
      ...entity,
      data: dataForScale,
      width,
      height,
      padding,
    }

    return createCartesianContext(entityWithDimensions, "area")
  },

  renderCartesianGrid(config, entityId, api) {
    const entity = api.getEntity(entityId)
    if (!entity) return svg``

    const { stroke = "#eee", strokeDasharray = "5 5" } = config
    const context = this._createSharedContext(entity, entityId)
    const { xScale, yScale, dimensions } = context
    const transformedData = entity.data.map((d, i) => ({ x: i, y: 0 }))
    const ticks = yScale.ticks ? yScale.ticks(5) : yScale.domain()

    return renderGrid({
      entity: { ...entity, data: transformedData },
      xScale,
      yScale,
      customYTicks: ticks,
      ...dimensions,
      stroke,
      strokeDasharray,
    })
  },

  renderXAxis(config, entityId, api) {
    const entity = api.getEntity(entityId)
    if (!entity) return svg``

    const { dataKey } = config
    const context = this._createSharedContext(entity, entityId)
    const { xScale, yScale, dimensions } = context
    const labels = entity.data.map(
      (d, i) => d[dataKey] || d.name || d.x || d.date || String(i),
    )
    const transformedData = entity.data.map((d, i) => ({ x: i, y: 0 }))

    return renderXAxis({
      entity: {
        ...entity,
        data: transformedData,
        xLabels: labels,
      },
      xScale,
      yScale,
      ...dimensions,
    })
  },

  renderYAxis(config, entityId, api) {
    const entity = api.getEntity(entityId)
    if (!entity) return svg``

    const context = this._createSharedContext(entity, entityId)
    const { yScale, dimensions } = context
    const ticks = yScale.ticks ? yScale.ticks(5) : yScale.domain()

    return renderYAxis({
      yScale,
      customTicks: ticks,
      ...dimensions,
    })
  },

  renderArea(config, entityId, api) {
    const entity = api.getEntity(entityId)
    if (!entity || !entity.data) return svg``

    const {
      dataKey,
      fill = "#8884d8",
      fillOpacity = "0.6",
      stroke,
      type: curveType = "linear",
    } = config

    // Register this dataKey as used
    if (entityId && dataKey) {
      if (!compositionDataKeys.has(entityId)) {
        compositionDataKeys.set(entityId, new Set())
      }
      compositionDataKeys.get(entityId).add(dataKey)
    }

    const data = this._getTransformedData(entity, dataKey)
    if (!data || data.length === 0) return svg``

    const context = this._createSharedContext(entity, entityId)
    const { xScale, yScale } = context
    const baseValue = 0

    const areaPath = generateAreaPath(data, xScale, yScale, baseValue, curveType)
    const linePath = stroke
      ? generateLinePath(data, xScale, yScale, curveType)
      : null

    if (!areaPath || areaPath.includes("NaN")) {
      return svg``
    }

    return svg`
      <g class="iw-chart-area">
        ${renderCurve({
          d: areaPath,
          fill,
          fillOpacity,
          className: "iw-chart-area-fill",
        })}
        ${
          linePath
            ? renderCurve({
                d: linePath,
                stroke: stroke || fill,
                className: "iw-chart-area-line",
              })
            : ""
        }
      </g>
    `
  },

  renderTooltip(config, entityId, api) {
    const entity = api.getEntity(entityId)
    if (!entity) return svg``
    return renderTooltip(entity)
  },
}

/**
 * Renders area curves using Curve and Dot primitives
 * Similar to Recharts Area component
 */
function renderAreaCurves({ data, entity, api }) {
  if (!data || data.length === 0) {
    return svg``
  }

  // Create context with scales and dimensions
  const context = createCartesianContext(entity, "area")
  const { xScale, yScale } = context
  const baseValue = 0
  const colors = entity.colors
  const showPoints = entity.showPoints !== false
  const stacked = entity.stacked === true // Only stack if explicitly set to true

  if (isMultiSeries(data)) {
    if (stacked) {
      // Calculate stacked data for all series
      const stackedData = calculateStackedData(data)

      // Render all areas and lines first
      const areasAndLines = data.map((series, seriesIndex) => {
        const values = getSeriesValues(series)
        // Use stacked data for this series
        const seriesStackedData = stackedData[seriesIndex] || []
        const areaPath = generateStackedAreaPath(
          values,
          xScale,
          yScale,
          seriesStackedData,
        )
        // Line path uses top of stacked area (y1 values)
        const linePath = generateLinePath(
          values.map((d, i) => ({
            ...d,
            y: seriesStackedData[i]?.[1] ?? d.y ?? d.value,
          })),
          xScale,
          yScale,
        )
        const color = series.color || colors[seriesIndex % colors.length]

        return svg`
          <g class="iw-chart-area">
            ${renderCurve({
              d: areaPath,
              fill: color,
              fillOpacity: "0.6",
              className: "iw-chart-area-fill",
            })}
            ${renderCurve({
              d: linePath,
              stroke: color,
              className: "iw-chart-area-line",
            })}
          </g>
        `
      })

      // Render all points last (so they appear on top)
      const points = showPoints
        ? data.map((series, seriesIndex) => {
            const values = getSeriesValues(series)
            const seriesStackedData = stackedData[seriesIndex] || []
            const color = series.color || colors[seriesIndex % colors.length]

            return repeat(
              values,
              (d, i) => `${seriesIndex}-${i}`,
              (d, i) => {
                const x = xScale(getDataPointX(d))
                // Use stacked y1 value for point position
                const y = yScale(seriesStackedData[i]?.[1] ?? getDataPointY(d))
                const seriesName =
                  series.name || series.label || `Series ${seriesIndex + 1}`
                const label = getDataPointLabel(d, seriesName)
                const value = seriesStackedData[i]?.[1] ?? getDataPointY(d)

                const { onMouseEnter, onMouseLeave } = createTooltipHandlers({
                  entity,
                  api,
                  tooltipData: {
                    label,
                    value,
                    color,
                  },
                })

                return renderDot({
                  cx: x,
                  cy: y,
                  fill: color,
                  className: "iw-chart-dot",
                  onMouseEnter,
                  onMouseLeave,
                })
              },
            )
          })
        : []

      return svg`
        ${areasAndLines}
        ${points}
      `
    } else {
      // Non-stacked: render each series independently
      // Render in reverse order to ensure larger areas are drawn on top
      const reversedData = [...data].reverse()

      const areasAndLines = reversedData.map((series, seriesIndex) => {
        const originalIndex = data.length - 1 - seriesIndex // Get original index for color
        const values = getSeriesValues(series)
        const areaPath = generateAreaPath(values, xScale, yScale, baseValue)
        const linePath = generateLinePath(values, xScale, yScale)
        const color = series.color || colors[originalIndex % colors.length]

        return svg`
          <g class="iw-chart-area">
            ${renderCurve({
              d: areaPath,
              fill: color,
              fillOpacity: "0.6",
              className: "iw-chart-area-fill",
            })}
            ${renderCurve({
              d: linePath,
              stroke: color,
              className: "iw-chart-area-line",
            })}
          </g>
        `
      })

      // Render all points last (so they appear on top)
      const points = showPoints
        ? reversedData.map((series, seriesIndex) => {
            const originalIndex = data.length - 1 - seriesIndex
            const values = getSeriesValues(series)
            const color = series.color || colors[originalIndex % colors.length]

            return repeat(
              values,
              (d, i) => `${originalIndex}-${i}`,
              (d) => {
                const x = xScale(getDataPointX(d))
                const y = yScale(getDataPointY(d))
                const seriesName =
                  series.name || series.label || `Series ${originalIndex + 1}`
                const label = getDataPointLabel(d, seriesName)
                const value = getDataPointY(d)

                const { onMouseEnter, onMouseLeave } = createTooltipHandlers({
                  entity,
                  api,
                  tooltipData: {
                    label,
                    value,
                    color,
                  },
                })

                return renderDot({
                  cx: x,
                  cy: y,
                  fill: color,
                  className: "iw-chart-dot",
                  onMouseEnter,
                  onMouseLeave,
                })
              },
            )
          })
        : []

      return svg`
        ${areasAndLines}
        ${points}
      `
    }
  }

  const areaPath = generateAreaPath(data, xScale, yScale, baseValue)
  const linePath = generateLinePath(data, xScale, yScale)
  const color = colors[0]

  return svg`
    <g class="iw-chart-area">
      ${renderCurve({
        d: areaPath,
        fill: color,
        fillOpacity: "0.6",
        className: "iw-chart-area-area",
      })}
      ${renderCurve({
        d: linePath,
        stroke: color,
        className: "iw-chart-area-curve",
      })}
      ${
        showPoints
          ? repeat(
              data,
              (d, i) => i,
              (d) => {
                const x = xScale(getDataPointX(d))
                const y = yScale(getDataPointY(d))
                const label = getDataPointLabel(d)
                const value = getDataPointY(d)

                const { onMouseEnter, onMouseLeave } = createTooltipHandlers({
                  entity,
                  api,
                  tooltipData: {
                    label,
                    value,
                    color,
                  },
                })

                return renderDot({
                  cx: x,
                  cy: y,
                  fill: color,
                  className: "iw-chart-dot",
                  onMouseEnter,
                  onMouseLeave,
                })
              },
            )
          : ""
      }
    </g>
  `
}
