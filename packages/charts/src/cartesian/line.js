/* eslint-disable no-magic-numbers */

import { html, svg } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"

import { renderGrid } from "../component/grid.js"
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
import { generateLinePath } from "../utils/paths.js"
import { createCartesianContext } from "../utils/scales.js"
import { createTooltipHandlers } from "../utils/tooltip-handlers.js"

// Store dimensions for composition methods (keyed by entityId)
const compositionDimensions = new Map()
// Store dataKeys used in lines (keyed by entityId)
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

export const line = {
  renderChart(entity, api) {
    // Line curves - uses Curve and Dot primitives
    const lines = renderLineCurves({
      data: entity.data,
      entity,
      api,
    })

    return renderCartesianLayout({
      entity,
      api,
      chartType: "line",
      chartContent: lines,
    })
  },

  // Composition methods (Recharts-style)
  renderLineChart(entityId, children, api, config = {}) {
    const entity = api.getEntity(entityId)
    if (!entity) {
      return svg`<text>Entity ${entityId} not found</text>`
    }

    // ---- composition dataKeys (mantém como está) ----
    const dataKeysSet = new Set()
    if (config.dataKeys && Array.isArray(config.dataKeys)) {
      config.dataKeys.forEach((key) => dataKeysSet.add(key))
    }
    compositionDataKeys.set(entityId, dataKeysSet)

    // Extract dimensions from config (like Recharts style prop)
    // Support both style object and direct width/height props
    const style = config.style || {}

    // Parse width/height from style (can be string like "100%" or number)
    // For SVG, we need numeric values for width/height attributes
    // CSS percentage/auto will be handled by the style attribute
    const parseDimension = (value) => {
      if (typeof value === "number") return value
      if (typeof value === "string") {
        // Try to parse as number (e.g., "800" -> 800)
        const num = parseFloat(value)
        if (!isNaN(num) && !value.includes("%") && !value.includes("px")) {
          return num
        }
      }
      return undefined
    }

    // Get numeric dimensions for SVG attributes
    // CSS dimensions (like "100%") will be in style
    const width =
      parseDimension(config.width || style.width) ||
      parseDimension(entity.width) ||
      800
    const height =
      parseDimension(config.height || style.height) ||
      parseDimension(entity.height) ||
      400
    // Always calculate padding based on current dimensions (same as config-first approach)
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

    // Build style string
    const styleString = Object.entries(svgStyle)
      .filter(([, value]) => value != null)
      .map(([key, value]) => {
        // Convert camelCase to kebab-case
        const kebabKey = key.replace(/([A-Z])/g, "-$1").toLowerCase()
        return `${kebabKey}: ${value}`
      })
      .join("; ")

    return html`
      <div class="iw-chart">
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

  // Helper to get transformed data (used by all composition methods)
  _getTransformedData(entity, dataKey) {
    if (!entity || !entity.data) return null

    // Transform data to use indices for x (like Recharts does with categorical data)
    return entity.data.map((d, i) => ({
      x: i, // Use index for positioning
      y: d[dataKey] !== undefined ? d[dataKey] : d.y || d.value || 0,
      name: d[dataKey] || d.name || d.x || d.date || i, // Keep name for labels
    }))
  },

  // Helper to get all numeric values from entity data (for Y scale calculation)
  _getAllNumericValues(entity) {
    const allValues = []
    entity.data.forEach((d) => {
      Object.keys(d).forEach((key) => {
        if (
          key !== "name" &&
          key !== "x" &&
          key !== "date" &&
          typeof d[key] === "number"
        ) {
          allValues.push(d[key])
        }
      })
    })
    return allValues
  },

  // Helper to create shared context with correct Y scale (all values)
  _createSharedContext(entity, entityId) {
    // Get dimensions from composition context if available
    const storedDimensions = entityId
      ? compositionDimensions.get(entityId)
      : null

    // Get dataKeys used in lines (if in composition mode)
    const usedDataKeys = entityId ? compositionDataKeys.get(entityId) : null

    // Create data with values for Y scale calculation
    // If in composition mode, only use values from dataKeys that are actually used in lines
    // Otherwise, use all numeric values (for config-first approach)
    const dataForScale = entity.data.map((d, i) => {
      let maxValue = 0

      if (usedDataKeys && usedDataKeys.size > 0) {
        // Composition mode: only use values from dataKeys used in lines
        usedDataKeys.forEach((dataKey) => {
          const value = d[dataKey]
          if (typeof value === "number" && value > maxValue) {
            maxValue = value
          }
        })
      } else {
        // Config-first mode: use all numeric values (excluding name, x, date)
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

    // Merge dimensions into entity for scale creation
    const width = storedDimensions?.width || entity.width || 800
    const height = storedDimensions?.height || entity.height || 400
    // Always use padding from storedDimensions (calculated in renderLineChart) or calculate it
    const padding = storedDimensions?.padding || calculatePadding(width, height)
    const entityWithDimensions = {
      ...entity,
      data: dataForScale,
      width,
      height,
      padding,
    }

    return createCartesianContext(entityWithDimensions, "line")
  },

  renderCartesianGrid(config, entityId, api) {
    const entity = api.getEntity(entityId)
    if (!entity) return svg``

    const { stroke = "#eee", strokeDasharray = "5 5" } = config

    // Use shared context with correct Y scale (all values)
    // The scale already uses .nice() to round domain to nice numbers
    const context = this._createSharedContext(entity, entityId)
    const { xScale, yScale, dimensions } = context

    // For grid, we still need data with indices for X scale
    const transformedData = entity.data.map((d, i) => ({ x: i, y: 0 }))

    // Use same ticks as renderYAxis for consistency (Recharts approach)
    // Recharts uses tickCount: 5 by default, which calls scale.ticks(5)
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

    // Use shared context (same scales as grid, Y axis, and lines)
    const context = this._createSharedContext(entity, entityId)
    const { xScale, yScale, dimensions } = context

    // Create labels map: index -> label (use original entity data)
    const labels = entity.data.map(
      (d, i) => d[dataKey] || d.name || d.x || d.date || String(i),
    )

    // Create transformed data with indices for x (needed by renderXAxis)
    const transformedData = entity.data.map((d, i) => ({ x: i, y: 0 }))

    return renderXAxis({
      entity: {
        ...entity,
        data: transformedData,
        xLabels: labels, // Pass labels for display
      },
      xScale,
      yScale,
      ...dimensions,
    })
  },

  renderYAxis(config, entityId, api) {
    const entity = api.getEntity(entityId)
    if (!entity) return svg``

    // Use shared context with correct Y scale (all values)
    // The scale already uses .nice() to round domain to nice numbers
    const context = this._createSharedContext(entity, entityId)
    const { yScale, dimensions } = context

    // Use d3-scale's ticks() method like Recharts does
    // Recharts uses tickCount: 5 by default, which calls scale.ticks(5)
    // The d3-scale algorithm automatically chooses "nice" intervals
    const ticks = yScale.ticks ? yScale.ticks(5) : yScale.domain()

    return renderYAxis({
      yScale,
      customTicks: ticks,
      ...dimensions,
    })
  },

  renderLine(config, entityId, api) {
    const entity = api.getEntity(entityId)
    if (!entity || !entity.data) return svg``

    const { dataKey, stroke = "#8884d8", type: curveType = "linear" } = config

    // Register this dataKey as used (for Y scale calculation)
    if (entityId && dataKey) {
      if (!compositionDataKeys.has(entityId)) {
        compositionDataKeys.set(entityId, new Set())
      }
      compositionDataKeys.get(entityId).add(dataKey)
    }

    // Extract data based on dataKey for this line
    const data = this._getTransformedData(entity, dataKey)
    if (!data || data.length === 0) return svg``

    // Use shared context with correct Y scale (only used dataKeys) - same as grid and Y axis
    const context = this._createSharedContext(entity, entityId)
    const { xScale, yScale } = context

    // Generate path using the line-specific data but shared scales
    const path = generateLinePath(data, xScale, yScale, curveType)

    // If path is null or empty, return empty
    if (!path || path.includes("NaN")) {
      return svg``
    }

    return svg`
      <path
        class="iw-chart-line"
        d=${path}
        stroke=${stroke}
        fill="none"
        stroke-width="2"
      />
    `
  },
}

/**
 * Renders line curves using Curve and Dot primitives
 * Similar to Recharts Line component
 */
function renderLineCurves({ data, entity, api }) {
  if (!data || data.length === 0) {
    return svg``
  }

  // Create context with scales and dimensions
  const context = createCartesianContext(entity, "line")
  const { xScale, yScale } = context
  const colors = entity.colors
  const showPoints = entity.showPoints !== false

  if (isMultiSeries(data)) {
    return svg`
      ${data.map((series, seriesIndex) => {
        const values = getSeriesValues(series)
        const pathData = generateLinePath(values, xScale, yScale)
        const color = series.color || colors[seriesIndex % colors.length]
        const seriesName =
          series.name || series.label || `Series ${seriesIndex + 1}`

        return svg`
          <g class="iw-chart-line">
            ${renderCurve({
              d: pathData,
              stroke: color,
              className: "iw-chart-line",
            })}
            ${
              showPoints
                ? repeat(
                    values,
                    (d, i) => i,
                    (d) => {
                      const x = xScale(getDataPointX(d))
                      const y = yScale(getDataPointY(d))
                      const label = getDataPointLabel(d, seriesName)
                      const value = getDataPointY(d)

                      const { onMouseEnter, onMouseLeave } =
                        createTooltipHandlers({
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
      })}
    `
  }

  const pathData = generateLinePath(data, xScale, yScale)
  const color = colors[0]

  return svg`
    <g class="iw-chart-line">
      ${renderCurve({
        d: pathData,
        stroke: color,
        className: "iw-chart-line",
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
