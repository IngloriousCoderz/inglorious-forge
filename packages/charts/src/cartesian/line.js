/* eslint-disable no-magic-numbers */

import { html, svg } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"

import { renderGrid } from "../component/grid.js"
import { renderLegend } from "../component/legend.js"
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
import { generateLinePath } from "../utils/paths.js"
import { createCartesianContext } from "../utils/scales.js"
import { createTooltipHandlers } from "../utils/tooltip-handlers.js"

// Removed global Maps - now using local context to avoid interference between charts

export const line = {
  renderChart(entity, api) {
    // Line curves - uses Curve and Dot primitives
    const lines = renderLineCurves(entity, {}, api)

    return renderCartesianLayout(
      entity,
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

    // Allow config.data to override entity.data for this specific chart instance
    const entityWithData = config.data
      ? { ...entity, data: config.data }
      : entity

    // Use local variables instead of global Maps
    const dataKeysSet = new Set()
    if (config.dataKeys && Array.isArray(config.dataKeys)) {
      config.dataKeys.forEach((key) => dataKeysSet.add(key))
    }

    // Extract dimensions from config (like Recharts style prop)
    // Support both style object and direct width/height props
    const style = config.style || {}

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

    // Process children to handle lazy functions
    const childrenArray = (
      Array.isArray(children) ? children : [children]
    ).filter(Boolean)

    // Create context with scales - pass composition info directly
    // The dataKeysSet is populated from config.dataKeys (passed explicitly)
    // Use entityWithData to support config.data override
    const context = line._createSharedContext(entityWithData, {
      width,
      height,
      padding,
      usedDataKeys: dataKeysSet,
    })
    context.dimensions = { width, height, padding }
    // Store entityWithData in context so renderLine can use the overridden data
    context.entity = entityWithData
    // Store api in context for tooltip handlers
    context.api = api
    // Store context temporarily for renderLine to access
    // Use a composite key (entityId + chartType) to avoid interference between different chart types
    if (!line._activeContexts) {
      line._activeContexts = new Map()
    }
    const contextKey = `${entity.id}:line`
    line._activeContexts.set(contextKey, context)

    // Separate legend from other children and process legend immediately
    const legendContent = []
    const processedChildren = []

    for (const child of childrenArray) {
      if (typeof child === "function" && !child.isXAxis) {
        // Try to get the actual function (may be wrapped)
        let actualFn = child
        let isLegend = false

        // Check if the function itself is marked as legend
        if (child.isLegend === true) {
          isLegend = true
          actualFn = child
        } else {
          // Try calling it to get the wrapped function
          try {
            const lazyResult = child()
            if (typeof lazyResult === "function") {
              if (lazyResult.isLegend === true) {
                isLegend = true
                actualFn = lazyResult
              } else {
                // Not a legend, keep for later processing
                processedChildren.push(lazyResult)
                continue
              }
            } else {
              // Not a function, keep as is
              processedChildren.push(lazyResult)
              continue
            }
          } catch {
            // If it fails, keep as is
            processedChildren.push(child)
            continue
          }
        }

        // If we identified it as a legend, render it immediately
        if (isLegend) {
          try {
            const renderedLegend = actualFn(context)
            if (renderedLegend) {
              legendContent.push(renderedLegend)
            }
          } catch {
            // If it fails, continue without legend
          }
        }
      } else {
        processedChildren.push(child)
      }
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

    // Process all children for SVG rendering
    const svgChildren = processedChildren.map((child) => {
      // If it's a function, call it with context
      if (typeof child === "function") {
        if (child.isXAxis) {
          return child(context)
        }
        try {
          return child(context)
        } catch {
          // If it fails with context, try without context
          try {
            return child()
          } catch {
            return svg``
          }
        }
      }
      // If it's an object (TemplateResult), render as is
      return child
    })

    const svgContent = svg`
      <svg
        width=${width}
        height=${height}
        viewBox="0 0 ${width} ${height}"
        class="iw-chart-svg"
        data-entity-id=${entity.id}
        style=${styleString || undefined}
      >
        ${legendContent}
        ${svgChildren}
      </svg>
    `

    const tooltipResult = line.renderTooltip(entityWithData, {}, api)(context)

    // Clear active context after rendering to avoid memory leaks
    // Use setTimeout to ensure rendering is complete
    setTimeout(() => {
      if (line._activeContexts) {
        const contextKey = `${entity.id}:line`
        line._activeContexts.delete(contextKey)
      }
    }, 0)

    return html`
      <div class="iw-chart" style="position: relative;">
        ${svgContent} ${tooltipResult}
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
  // Now receives composition info directly instead of using global Maps
  _createSharedContext(entity, compositionInfo = null) {
    // Get dimensions from composition context if available
    const width = compositionInfo?.width || entity.width || 800
    const height = compositionInfo?.height || entity.height || 400
    const padding = compositionInfo?.padding || calculatePadding(width, height)
    const usedDataKeys = compositionInfo?.usedDataKeys

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
    const entityWithDimensions = {
      ...entity,
      data: dataForScale,
      width,
      height,
      padding,
    }

    return createCartesianContext(entityWithDimensions, "line")
  },

  renderCartesianGrid(entity, { config = {} }, api) {
    // Return a lazy function to prevent lit-html from evaluating it prematurely
    // This function will be called by renderLineChart with the correct context
    // eslint-disable-next-line no-unused-vars
    return (ctx) => {
      if (!entity) return svg``
      const { stroke = "#eee", strokeDasharray = "5 5" } = config
      // Use shared context with correct Y scale (all values)
      // The scale already uses .nice() to round domain to nice numbers
      const context = line._createSharedContext(entity, null)
      const { xScale, yScale, dimensions } = context
      // For grid, we still need data with indices for X scale
      const transformedData = entity.data.map((d, i) => ({ x: i, y: 0 }))
      // Use same ticks as renderYAxis for consistency (Recharts approach)
      // Recharts uses tickCount: 5 by default, which calls scale.ticks(5)
      const ticks = yScale.ticks ? yScale.ticks(5) : yScale.domain()
      return renderGrid(
        { ...entity, data: transformedData },
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
  },

  renderXAxis(entity, { config = {} }, api) {
    if (!entity) return svg``

    const { dataKey } = config

    // Use shared context (same scales as grid, Y axis, and lines)
    const context = line._createSharedContext(entity, null)
    const { xScale, yScale, dimensions } = context

    // Create labels map: index -> label (use original entity data)
    const labels = entity.data.map(
      (d, i) => d[dataKey] || d.name || d.x || d.date || String(i),
    )

    // Create transformed data with indices for x (needed by renderXAxis)
    const transformedData = entity.data.map((d, i) => ({ x: i, y: 0 }))

    return renderXAxis(
      {
        ...entity,
        data: transformedData,
        xLabels: labels, // Pass labels for display
      },
      {
        xScale,
        yScale,
        ...dimensions,
      },
      api,
    )
  },

  renderYAxis(entity, { config = {} }, api) {
    // eslint-disable-next-line no-unused-vars
    const _config = config
    if (!entity) return svg``

    // Use shared context with correct Y scale (all values)
    // The scale already uses .nice() to round domain to nice numbers
    // In composition mode, this is called with context from renderLineChart
    // In config-first mode, pass null to use all numeric values
    const context = line._createSharedContext(entity, null)
    const { yScale, dimensions } = context

    // Use d3-scale's ticks() method like Recharts does
    // Recharts uses tickCount: 5 by default, which calls scale.ticks(5)
    // The d3-scale algorithm automatically chooses "nice" intervals
    const ticks = yScale.ticks ? yScale.ticks(5) : yScale.domain()

    return renderYAxis(
      entity,
      {
        yScale,
        customTicks: ticks,
        ...dimensions,
      },
      api,
    )
  },

  renderLine(entity, { config = {}, context = null }, api) {
    if (!entity || !entity.data) return svg``

    // Use provided context if available (from renderLineChart), otherwise try to get from active contexts
    // In composition mode, context should be passed or available in activeContexts
    // In config-first mode, create new context using all numeric values
    // Use composite key to avoid interference with other chart types
    const contextKey = `${entity.id}:line`
    let lineContext = context
    if (!lineContext && line._activeContexts) {
      lineContext = line._activeContexts.get(contextKey)
    }

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
    const data = line._getTransformedData(entity, dataKey)
    if (!data || data.length === 0) return svg``

    // Use the context we already retrieved above
    if (!lineContext) {
      lineContext = line._createSharedContext(entity, null)
    }
    const { xScale, yScale } = lineContext

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
          (d) => {
            const x = xScale(d.x)
            const y = yScale(d.y)
            const dotLabel = d.name || dataKey || "Value"
            const dotValue = d.y

            const {
              onMouseEnter: dotOnMouseEnter,
              onMouseLeave: dotOnMouseLeave,
            } = createTooltipHandlers({
              entity,
              api,
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
      <g class="iw-chart-line-group" data-data-key=${dataKey}>
        <path
          class="iw-chart-line"
          data-entity-id=${entity.id}
          data-data-key=${dataKey}
          d=${path}
          stroke=${stroke}
          fill="none"
          stroke-width="2"
          style="stroke: ${stroke} !important;"
        />
        ${dots}
      </g>
    `

    return pathElement
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

      const data = line._getTransformedData(entityFromContext, dataKey)
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

  renderTooltip(entity, props, api) {
    // eslint-disable-next-line no-unused-vars
    return (ctx) => {
      if (!entity) return html``
      return renderTooltip(entity, {}, api)
    }
  },
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
