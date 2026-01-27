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
  parseDimension,
} from "../utils/data-utils.js"
import { calculatePadding } from "../utils/padding.js"
import {
  calculateStackedData,
  generateAreaPath,
  generateLinePath,
  generateStackedAreaPath,
} from "../utils/paths.js"
import { createCartesianContext } from "../utils/scales.js"
import { createTooltipHandlers } from "../utils/tooltip-handlers.js"

/**
 * PURE INTERNAL UTILITIES
 * These functions do not rely on external state or 'this' context.
 */

/**
 * Standardizes data into x, y, and name properties for rendering
 */
const getTransformedData = (entity, dataKey) => {
  if (!entity || !entity.data) return null
  return entity.data.map((d, i) => ({
    x: i,
    y: d[dataKey] !== undefined ? d[dataKey] : d.y || d.value || 0,
    name: d[dataKey] || d.name || d.x || d.date || i,
  }))
}

/**
 * Calculates the maximum value (extent) from entity data.
 * If dataKeys are provided, only considers those keys; otherwise considers all numeric values.
 */
const getExtent = (data, keys) => {
  const values = data.flatMap((d) =>
    keys && keys.size > 0
      ? Array.from(keys).map((k) => d[k] || 0)
      : Object.entries(d)
          .filter(
            ([key, value]) =>
              !["name", "x", "date"].includes(key) && typeof value === "number",
          )
          .map(([, value]) => value),
  )
  return values.length > 0 ? Math.max(...values) : 0
}

/**
 * Calculates scales and dimensions based on provided entity and configuration.
 * Returns a stateless context object for child components.
 */
const createSharedContext = (entity, config = {}) => {
  const width = parseDimension(config.width) || entity.width || 800
  const height = parseDimension(config.height) || entity.height || 400
  const padding = config.padding || calculatePadding(width, height)
  const usedDataKeys = config.dataKeys ? new Set(config.dataKeys) : null

  // Calculate maximum value for Y-axis scaling (global max across all data)
  const maxValue = getExtent(entity.data, usedDataKeys)

  // Create data structure for scale calculation
  // Keep all points with indices for xScale domain, but use global max for yScale
  // This ensures xScale has correct domain [0, data.length-1] and yScale has [0, maxValue]
  const dataForScale = entity.data.map((d, i) => ({ x: i, y: maxValue }))

  const context = createCartesianContext(
    { ...entity, data: dataForScale, width, height, padding },
    "area",
  )

  return {
    ...context,
    dimensions: { width, height, padding },
    entity,
  }
}

export const area = {
  /**
   * Traditional render mode using entity configuration
   */
  renderChart(entity, api) {
    const areas = renderAreaCurves(entity, {}, api)

    return renderCartesianLayout(entity, {
      chartType: "area",
      chartContent: areas,
    }, api)
  },

  /**
   * Compositional render mode (Recharts-style).
   * Acts as a context provider for all nested functional children.
   */
  renderAreaChart(entity, { children, config = {} }, api) {
    if (!entity) return svg`<text>Entity not found</text>`

    const entityWithData = config.data ? { ...entity, data: config.data } : entity
    const context = createSharedContext(entityWithData, config)
    // Store api in context for tooltip handlers
    context.api = api
    const childrenArray = Array.isArray(children) ? children : [children]

    // Process children to handle lazy functions (like renderDots from index.js)
    const processedChildren = []
    for (const child of childrenArray) {
      if (typeof child === "function") {
        try {
          // First call: get the lazy function (for renderDots from index.js)
          const lazyResult = child()
          if (typeof lazyResult === "function") {
            // Second call: call the lazy function with context
            processedChildren.push(lazyResult(context))
          } else {
            // Direct result
            processedChildren.push(lazyResult)
          }
        } catch {
          // If it fails, try calling directly with context
          try {
            processedChildren.push(child(context))
          } catch {
            processedChildren.push(child)
          }
        }
      } else {
        processedChildren.push(child)
      }
    }

    return html`
      <div class="iw-chart" style="display: block; position: relative; width: 100%; box-sizing: border-box;">
        <svg
          width=${context.dimensions.width}
          height=${context.dimensions.height}
          viewBox="0 0 ${context.dimensions.width} ${context.dimensions.height}"
          class="iw-chart-svg"
        >
          ${processedChildren}
        </svg>
        ${renderTooltip(entityWithData, {}, api)}
      </div>
    `
  },

  renderCartesianGrid(entity, { config = {} }, api) {
    return (ctx) => {
      const { xScale, yScale, dimensions } = ctx
      const entityFromContext = ctx.entity || entity
      const { stroke = "#eee", strokeDasharray = "5 5" } = config
      const transformedData = entityFromContext.data.map((d, i) => ({ x: i, y: 0 }))
      const ticks = yScale.ticks ? yScale.ticks(5) : yScale.domain()

      return renderGrid(
        { ...entityFromContext, data: transformedData },
        {
          xScale,
          yScale,
          customYTicks: ticks,
          ...dimensions,
          stroke,
          strokeDasharray,
        },
        api
      )
    }
  },

  renderXAxis(entity, { config = {} }, api) {
    return (ctx) => {
      const { xScale, yScale, dimensions } = ctx
      const entityFromContext = ctx.entity || entity
      const { dataKey } = config
      const labels = entityFromContext.data.map(
        (d, i) => d[dataKey] || d.name || d.x || d.date || String(i)
      )
      const transformedData = entityFromContext.data.map((d, i) => ({ x: i, y: 0 }))

      return renderXAxis(
        { ...entityFromContext, data: transformedData, xLabels: labels },
        {
          xScale,
          yScale,
          ...dimensions,
        },
        api
      )
    }
  },

  renderYAxis(entity, props, api) {
    return (ctx) => {
      const { yScale, dimensions } = ctx
      const entityFromContext = ctx.entity || entity
      const ticks = yScale.ticks ? yScale.ticks(5) : yScale.domain()
      return renderYAxis(entityFromContext, { yScale, customTicks: ticks, ...dimensions }, api)
    }
  },

  // eslint-disable-next-line no-unused-vars
  renderArea(entity, { config = {} }, api) {
    return (ctx) => {
      const { xScale, yScale } = ctx
      const entityFromContext = ctx.entity || entity
      const {
        dataKey,
        fill = "#8884d8",
        fillOpacity = "0.6",
        stroke,
        type: curveType = "linear",
      } = config

      const data = getTransformedData(entityFromContext, dataKey)
      if (!data) return svg``

      const areaPath = generateAreaPath(data, xScale, yScale, 0, curveType)
      const linePath = stroke ? generateLinePath(data, xScale, yScale, curveType) : null

      return svg`
        <g class="iw-chart-area">
          ${renderCurve({
            d: areaPath,
            fill,
            fillOpacity,
            className: "iw-chart-area-fill",
            entityId: entityFromContext.id,
          })}
          ${linePath ? renderCurve({
                d: linePath,
                stroke: stroke || fill,
                className: "iw-chart-area-line",
                entityId: entityFromContext.id,
              }) : ""}
        </g>
      `
    }
  },

  renderDots(entity, { config = {} }, api) {
    return (ctx) => {
      const { xScale, yScale } = ctx
      const entityFromContext = ctx.entity || entity
      const {
        dataKey,
        fill = "#8884d8",
        r = "0.25em",
        stroke = "white",
        strokeWidth = "0.125em",
      } = config

      const data = getTransformedData(entityFromContext, dataKey)
      if (!data || data.length === 0) return svg``

      return svg`
        <g class="iw-chart-dots" data-data-key=${dataKey}>
          ${repeat(
            data,
            (d, i) => `${dataKey}-${i}`,
            (d) => {
              const x = xScale(d.x)
              const y = yScale(d.y)
              const label = d.name || dataKey || "Value"
              const value = d.y

              const { onMouseEnter, onMouseLeave } = createTooltipHandlers({
                entity: entityFromContext,
                api: ctx.api || api,
                tooltipData: {
                  label,
                  value,
                  color: fill,
                },
              })

              return renderDot({
                cx: x,
                cy: y,
                r,
                fill,
                stroke,
                strokeWidth,
                className: "iw-chart-dot",
                onMouseEnter,
                onMouseLeave,
              })
            },
          )}
        </g>
      `
    }
  },

  renderTooltip(entity, props, api) {
    return (ctx) => renderTooltip(ctx.entity || entity, {}, api)
  },
}

/**
 * INTERNAL COMPONENT: Renders multi-series area curves with points and interactions
 */
function renderAreaCurves(entity, props, api) {
  const data = entity?.data
  if (!data || data.length === 0) return svg``

  // Standard context for the automatic render mode
  const context = createCartesianContext(entity, "area")
  const { xScale, yScale } = context
  const colors = entity.colors || ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"]
  const showPoints = entity.showPoints !== false
  const stacked = entity.stacked === true

  if (isMultiSeries(data)) {
    const processData = stacked ? calculateStackedData(data) : data

    // Logic for rendering stacked or independent series
    const areasAndLines = (stacked ? data : [...data].reverse()).map((series, idx) => {
      const originalIdx = stacked ? idx : data.length - 1 - idx
      const values = getSeriesValues(series)
      const color = series.color || colors[originalIdx % colors.length]
      
      let areaPath, linePath
      if (stacked) {
        const seriesStack = processData[idx] || []
        areaPath = generateStackedAreaPath(values, xScale, yScale, seriesStack)
        linePath = generateLinePath(values.map((d, i) => ({ ...d, y: seriesStack[i]?.[1] ?? d.y })), xScale, yScale)
      } else {
        areaPath = generateAreaPath(values, xScale, yScale, 0)
        linePath = generateLinePath(values, xScale, yScale)
      }

      return svg`
        <g class="iw-chart-area-series">
          ${renderCurve({ d: areaPath, fill: color, fillOpacity: "0.6", entityId: entity.id })}
          ${renderCurve({ d: linePath, stroke: color, entityId: entity.id })}
        </g>
      `
    })

    const points = showPoints ? (stacked ? data : [...data].reverse()).map((series, idx) => {
      const originalIdx = stacked ? idx : data.length - 1 - idx
      const values = getSeriesValues(series)
      const color = series.color || colors[originalIdx % colors.length]
      const seriesStackedData = stacked ? processData[idx] : null

      return repeat(values, (d, i) => `${originalIdx}-${i}`, (d, i) => {
        const x = xScale(getDataPointX(d))
        const y = yScale(stacked ? seriesStackedData[i]?.[1] : getDataPointY(d))
        const value = stacked ? seriesStackedData[i]?.[1] : getDataPointY(d)
        const label = getDataPointLabel(d, series.name || `Series ${originalIdx + 1}`)

        const { onMouseEnter, onMouseLeave } = createTooltipHandlers({
          entity, api, tooltipData: { label, value, color },
        })

        return renderDot({ cx: x, cy: y, fill: color, onMouseEnter, onMouseLeave })
      })
    }) : []

    return svg`${areasAndLines}${points}`
  }

  // Single series logic
  const areaPath = generateAreaPath(data, xScale, yScale, 0)
  const linePath = generateLinePath(data, xScale, yScale)
  const color = colors[0]

  return svg`
    <g class="iw-chart-area-single">
      ${renderCurve({ d: areaPath, fill: color, fillOpacity: "0.6", entityId: entity.id })}
      ${renderCurve({ d: linePath, stroke: color, entityId: entity.id })}
      ${showPoints ? repeat(data, (d, i) => i, (d) => {
        const { onMouseEnter, onMouseLeave } = createTooltipHandlers({
          entity, api, tooltipData: { label: getDataPointLabel(d), value: getDataPointY(d), color },
        })
        return renderDot({ cx: xScale(getDataPointX(d)), cy: yScale(getDataPointY(d)), fill: color, onMouseEnter, onMouseLeave })
      }) : ""}
    </g>
  `
}