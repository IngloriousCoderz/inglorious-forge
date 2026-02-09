/* eslint-disable no-magic-numbers */

import { html, repeat, svg } from "@inglorious/web"

import { createBrushComponent } from "../component/brush.js"
import { renderGrid } from "../component/grid.js"
import { renderLegend } from "../component/legend.js"
import { createTooltipComponent, renderTooltip } from "../component/tooltip.js"
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
  getTransformedData,
  isMultiSeries,
  parseDimension,
} from "../utils/data-utils.js"
import { calculatePadding } from "../utils/padding.js"
import { generateLinePath } from "../utils/paths.js"
import { createCartesianContext, getFilteredData } from "../utils/scales.js"
import { createSharedContext } from "../utils/shared-context.js"
import {
  createTooltipHandlers,
  createTooltipMoveHandler,
} from "../utils/tooltip-handlers.js"

// Removed global Maps - now using local context to avoid interference between charts

export const line = {
  renderChart(entity, api) {
    // Apply data filtering if brush is enabled
    const entityData = entity.brush?.enabled
      ? getFilteredData(entity)
      : entity.data

    // Create entity with filtered data for rendering
    const entityWithFilteredData = { ...entity, data: entityData }

    // Line curves - uses Curve and Dot primitives
    const lines = renderLineCurves(entityWithFilteredData, {}, api)

    return renderCartesianLayout(
      entityWithFilteredData,
      {
        chartType: "line",
        chartContent: lines,
      },
      api,
    )
  },

  // Composition methods (Recharts-style)
  renderLineChart(entity, { children, config = {} }, api) {
    if (!entity) {
      return svg`<text>Entity not found</text>`
    }

    // 1. Define the data
    let entityData = config.data || entity.data
    const entityWithData = { ...entity, data: entityData }

    // 2. Extract dimensions and local variables (removed duplicate block with error here)
    const dataKeysSet = new Set()
    if (config.dataKeys && Array.isArray(config.dataKeys)) {
      config.dataKeys.forEach((key) => dataKeysSet.add(key))
    }

    const style = config.style || {}
    const width =
      parseDimension(config.width || style.width) ||
      parseDimension(entity.width) ||
      800
    let height =
      parseDimension(config.height || style.height) ||
      parseDimension(entity.height) ||
      400
    const padding = calculatePadding(width, height)

    const childrenArray = (
      Array.isArray(children) ? children : [children]
    ).filter(Boolean)
    const hasBrush = childrenArray.some(
      (child) => typeof child === "function" && child.isBrush,
    )
    const brushHeight = hasBrush ? 60 : 0
    const chartHeight = height
    const totalHeight = chartHeight + brushHeight

    const svgStyle = {
      width: style.width || (typeof width === "number" ? `${width}px` : width),
      height:
        style.height ||
        (typeof totalHeight === "number" ? `${totalHeight}px` : totalHeight),
      maxWidth: style.maxWidth,
      maxHeight: style.maxHeight,
      aspectRatio: style.aspectRatio,
      margin: style.margin,
      ...style,
    }

    // 3. Create the UNIQUE context
    const context = createSharedContext(
      entityWithData,
      {
        width,
        height: chartHeight,
        padding,
        usedDataKeys: dataKeysSet,
        chartType: "line",
      },
      api,
    )

    // 4. APPLY ZOOM
    if (entity.brush?.enabled && entity.brush.startIndex !== undefined) {
      const { startIndex, endIndex } = entity.brush
      context.xScale.domain([startIndex, endIndex])
    }

    context.dimensions = { width, height: chartHeight, padding }
    context.totalHeight = totalHeight
    context.entity = entityWithData
    context.fullEntity = entity
    context.api = api

    // Context is now passed directly to renderLine, no need for global cache

    // Separate components using stable flags (survives minification)
    // This ensures correct Z-index ordering: Grid -> Lines -> Axes -> Dots -> Brush
    const grid = []
    const axes = []
    const lines = []
    const dots = []
    const tooltip = []
    const legend = []
    const brush = []
    const others = []

    for (const child of childrenArray) {
      // Use stable flags instead of string matching (survives minification)
      if (typeof child === "function") {
        // If it's already marked, add to the correct bucket
        if (child.isGrid) {
          grid.push(child)
        } else if (child.isAxis) {
          axes.push(child)
        } else if (child.isLine) {
          lines.push(child)
        } else if (child.isDots) {
          dots.push(child)
        } else if (child.isTooltip) {
          tooltip.push(child)
        } else if (child.isLegend) {
          legend.push(child)
        } else {
          // It's a lazy function from index.js - process it to identify its real type
          // Use the real context (already created) to peek at what it returns
          try {
            const result = child(context)
            // If the result is a marked function, use its type
            if (typeof result === "function") {
              if (result.isGrid) {
                grid.push(child) // Keep the original lazy function
              } else if (result.isAxis) {
                axes.push(child)
              } else if (result.isLine) {
                lines.push(child)
              } else if (result.isDots) {
                dots.push(child)
              } else if (result.isTooltip) {
                tooltip.push(child)
              } else if (result.isLegend) {
                legend.push(child)
              } else if (result.isBrush) {
                brush.push(child)
              } else {
                others.push(child)
              }
            } else {
              others.push(child)
            }
          } catch {
            // If processing fails, add to others (will be processed later)
            others.push(child)
          }
        }
      } else {
        others.push(child)
      }
    }

    // Reorder children for correct Z-index: Grid -> Lines -> Axes -> Dots -> Tooltip -> Legend -> Brush -> Others
    // This ensures grid is behind, lines are in the middle, and axes are on top, brush is at the bottom
    const childrenToProcess = [
      ...grid,
      ...lines,
      ...axes,
      ...dots,
      ...tooltip,
      ...legend,
      ...brush,
      ...others,
    ]

    // Build style string
    const styleString = Object.entries(svgStyle)
      .filter(([, value]) => value != null)
      .map(([key, value]) => {
        // Convert camelCase to kebab-case
        const kebabKey = key.replace(/([A-Z])/g, "-$1").toLowerCase()
        return `${kebabKey}: ${value}`
      })
      .join("; ")

    // Process children to handle lazy functions (like renderDots from index.js)
    // Flow:
    // 1. renderCartesianGrid/renderXAxis from index.js return (ctx) => { return chartType.renderCartesianGrid(...) }
    // 2. chartType.renderCartesianGrid (from line.js) returns gridFn which is (ctx) => { return svg... }
    // 3. So we need: child(context) -> gridFn, then gridFn(context) -> svg
    // Simplified deterministic approach: all functions from index.js return (ctx) => ..., so we can safely call with context
    const processedChildren = childrenToProcess.map((child) => {
      // Non-function children are passed through as-is
      if (typeof child !== "function") {
        return child
      }

      // If it's a marked component (isGrid, isLine, etc), it expects context directly
      if (
        child.isGrid ||
        child.isAxis ||
        child.isLine ||
        child.isDots ||
        child.isTooltip ||
        child.isLegend
      ) {
        return child(context)
      }

      // If it's a function from index.js (renderCartesianGrid, etc),
      // it returns another function that also expects context
      const result = child(context)
      // If the result is a function (marked component), call it with context
      if (typeof result === "function") {
        return result(context)
      }
      // Otherwise, return the result directly (already SVG or TemplateResult)
      return result
    })

    const svgContent = svg`
      <svg
        width=${width}
        height=${totalHeight}
        viewBox="0 0 ${width} ${totalHeight}"
        class="iw-chart-svg"
        data-entity-id=${entity.id}
        style=${styleString || undefined}
        @mousemove=${createTooltipMoveHandler({ entity: entityWithData, api })}
      >
      <defs>
          <clipPath id="chart-clip-${entity.id}">
            <rect 
              x=${padding.left} 
              y=${padding.top} 
              width=${width - padding.left - padding.right} 
              height=${height - padding.top - padding.bottom} 
            />
          </clipPath>
        </defs>
        ${processedChildren}
      </svg>
    `

    const tooltipResult = renderTooltip(entityWithData, {}, api)

    const finalResult = html`
      <div
        class="iw-chart"
        style="display: block; position: relative; width: 100%; box-sizing: border-box;"
      >
        ${svgContent} ${tooltipResult}
      </div>
    `
    return finalResult
  },

  // Helper functions moved to utils/data-utils.js as pure functions

  renderCartesianGrid(entity, { config = {} }, api) {
    const gridFn = (ctx) => {
      const { xScale, yScale, dimensions } = ctx
      const entityFromContext = ctx.entity || entity
      const { stroke = "#eee", strokeDasharray = "5 5" } = config
      // For grid, we still need data with indices for X scale
      const transformedData = entityFromContext.data.map((d, i) => ({
        x: i,
        y: 0,
      }))
      // Use same ticks as renderYAxis for consistency (Recharts approach)
      // Recharts uses tickCount: 5 by default, which calls scale.ticks(5)
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
        api,
      )
    }
    // Mark as grid component for stable identification
    gridFn.isGrid = true
    return gridFn
  },

  renderXAxis(entity, { config = {} }, api) {
    const axisFn = (ctx) => {
      const { xScale, yScale, dimensions } = ctx

      const entityFromContext = ctx.entity || entity

      const { dataKey } = config

      const labels = entityFromContext.data.map(
        (d, i) => d[dataKey] || d.name || d.x || d.date || String(i),
      )

      const axisScale = (val) => xScale(val)

      axisScale.bandwidth = () => 0.0001
      axisScale.domain = () => xScale.domain() // Use the [start, end] domain from context
      axisScale.range = () => xScale.range()
      axisScale.copy = () => axisScale

      return renderXAxis(
        {
          ...entityFromContext,
          data: entityFromContext.data.map((_, i) => ({ x: i, y: 0 })),
          xLabels: labels,
        },

        {
          xScale: axisScale,
          yScale,
          ...dimensions,
        },

        api,
      )
    }

    axisFn.isAxis = true

    return axisFn
  },

  renderYAxis(entity, { config = {} }, api) {
    // eslint-disable-next-line no-unused-vars
    const _config = config
    const axisFn = (ctx) => {
      const { yScale, dimensions } = ctx
      const entityFromContext = ctx.entity || entity
      // Use d3-scale's ticks() method like Recharts does
      // Recharts uses tickCount: 5 by default, which calls scale.ticks(5)
      // The d3-scale algorithm automatically chooses "nice" intervals
      const ticks = yScale.ticks ? yScale.ticks(5) : yScale.domain()
      return renderYAxis(
        entityFromContext,
        {
          yScale,
          customTicks: ticks,
          ...dimensions,
        },
        api,
      )
    }
    // Mark as axis component for stable identification
    axisFn.isAxis = true
    return axisFn
  },

  renderLine(entity, { config = {} }, api) {
    const lineFn = (ctx) => {
      const entityFromContext = ctx.entity || entity
      if (!entityFromContext || !entityFromContext.data) return svg``

      // Use context from parent (renderLineChart)
      const {
        dataKey,
        stroke = "#8884d8",
        type: curveType = "linear",
        showDots = false,
        dotFill,
        dotR = "0.25em",
        dotStroke = "white",
        dotStrokeWidth = "0.125em",
      } = config

      // Extract data based on dataKey for this line
      const data = getTransformedData(entityFromContext, dataKey)
      if (!data || data.length === 0) return svg``

      const { xScale, yScale } = ctx

      // Generate path using the line-specific data but shared scales
      const path = generateLinePath(data, xScale, yScale, curveType)

      // If path is null or empty, return empty
      if (!path || path.includes("NaN")) {
        return svg``
      }

      // Render dots if showDots is true
      const dots = showDots
        ? repeat(
            data,
            (d, i) => `${dataKey}-${i}`,
            (d, i) => {
              const x = xScale(d.x)
              const y = yScale(d.y)
              // Use the X-axis label (point index) as label, like config mode
              // Get the original data point to access the name/label from X-axis
              const originalDataPoint = entityFromContext.data[i]
              const xAxisLabel =
                originalDataPoint?.name ||
                originalDataPoint?.label ||
                String(d.x)
              const dotLabel = xAxisLabel // Use X-axis point as label (consistent with config mode)
              const dotValue = d.y

              const {
                onMouseEnter: dotOnMouseEnter,
                onMouseLeave: dotOnMouseLeave,
              } = createTooltipHandlers({
                entity: entityFromContext,
                api: ctx.api || api,
                tooltipData: {
                  label: dotLabel,
                  value: dotValue,
                  color: dotFill || stroke,
                },
              })

              return renderDot({
                cx: x,
                cy: y,
                r: dotR,
                fill: dotFill || stroke,
                stroke: dotStroke,
                strokeWidth: dotStrokeWidth,
                className: "iw-chart-dot",
                onMouseEnter: dotOnMouseEnter,
                onMouseLeave: dotOnMouseLeave,
              })
            },
          )
        : ""

      const pathElement = svg`
        <g 
          class="iw-chart-line-group" 
          data-data-key="${dataKey}"
          clip-path="url(#chart-clip-${entityFromContext.id})"
        >
          <path
            class="iw-chart-line"
            data-entity-id="${entityFromContext.id}"
            data-data-key="${dataKey}"
            d="${path}"
            stroke="${stroke}"
            fill="none"
            stroke-width="2"
            style="stroke: ${stroke} !important;"
          />
          ${dots}
        </g>
      `

      return pathElement
    }
    // Mark as line component for stable identification
    lineFn.isLine = true
    return lineFn
  },

  renderDots(entity, { config = {} }, api) {
    const dotsFn = (ctx) => {
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
        <g class="iw-chart-dots" data-data-key=${dataKey} clip-path="url(#chart-clip-${ctx.entity.id})">
          ${repeat(
            data,
            (d, i) => `${dataKey}-${i}`,
            (d, i) => {
              const x = xScale(d.x)
              const y = yScale(d.y)
              // Use the X-axis label (point index) as label, like config mode
              // Get the original data point to access the name/label from X-axis
              const originalDataPoint = entityFromContext.data[i]
              const xAxisLabel =
                originalDataPoint?.name ||
                originalDataPoint?.label ||
                String(d.x)
              const label = xAxisLabel // Use X-axis point as label (consistent with config mode)
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
    // Mark as dots component for stable identification
    dotsFn.isDots = true
    return dotsFn
  },

  renderLegend(entity, { config = {} }, api) {
    const legendFn = (ctx) => {
      const { dimensions } = ctx
      const { width, padding } = dimensions
      const { dataKeys, labels, colors } = config

      // Create series from dataKeys
      const series = (dataKeys || []).map((dataKey, index) => {
        // Use custom label if provided, otherwise format dataKey (e.g., "productA" -> "Product A")
        const label =
          labels?.[index] ||
          dataKey
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())
            .trim()

        return {
          name: label,
          color: colors?.[index],
        }
      })

      // Default colors if not provided
      const defaultColors = [
        "#8884d8",
        "#82ca9d",
        "#ffc658",
        "#ff7300",
        "#0088fe",
        "#00c49f",
        "#ffbb28",
        "#ff8042",
      ]
      const legendColors = colors || defaultColors

      return renderLegend(
        entity,
        {
          series,
          colors: legendColors,
          width,
          padding,
        },
        api,
      )
    }
    // Mark as legend for identification during processing
    legendFn.isLegend = true
    return legendFn
  },

  renderTooltip: createTooltipComponent(),

  renderBrush: createBrushComponent(),
}

/**
 * Renders line curves using Curve and Dot primitives
 * Similar to Recharts Line component
 */
function renderLineCurves(entity, props, api) {
  const data = entity?.data
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
          <g class="iw-chart-line" data-entity-id=${entity.id}>
            ${renderCurve({
              d: pathData,
              stroke: color,
              className: "iw-chart-line",
              entityId: entity.id,
            })}
            ${
              showPoints
                ? repeat(
                    values,
                    (d, i) => i,
                    (d, i) => {
                      const x = xScale(getDataPointX(d, i))
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
    <g class="iw-chart-line" data-entity-id=${entity.id}>
      ${renderCurve({
        d: pathData,
        stroke: color,
        className: "iw-chart-line",
        entityId: entity.id,
      })}
      ${
        showPoints
          ? repeat(
              data,
              (d, i) => i,
              (d, i) => {
                const x = xScale(getDataPointX(d, i))
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
