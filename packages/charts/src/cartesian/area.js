/* eslint-disable no-magic-numbers */
import { html, repeat, svg } from "@inglorious/web"

import { createBrushComponent } from "../component/brush.js"
import { renderGrid } from "../component/grid.js"
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
} from "../utils/data-utils.js"
import {
  calculateStackedData,
  generateAreaPath,
  generateLinePath,
  generateStackedAreaPath,
} from "../utils/paths.js"
import { createCartesianContext } from "../utils/scales.js"
import { createSharedContext } from "../utils/shared-context.js"
import { createTooltipHandlers } from "../utils/tooltip-handlers.js"

// Helper functions are now imported from utils as pure functions

export const area = {
  /**
   * Traditional render mode using entity configuration
   */
  renderChart(entity, api) {
    const areas = renderAreaCurves(entity, {}, api)

    return renderCartesianLayout(
      entity,
      {
        chartType: "area",
        chartContent: areas,
      },
      api,
    )
  },

  /**
   * Compositional render mode (Recharts-style).
   * Acts as a context provider for all nested functional children.
   */
  renderAreaChart(entity, { children, config = {} }, api) {
    if (!entity) return svg`<text>Entity not found</text>`

    const entityWithData = config.data
      ? { ...entity, data: config.data }
      : entity
    const context = createSharedContext(
      entityWithData,
      {
        width: config.width,
        height: config.height,
        padding: config.padding,
        usedDataKeys: config.dataKeys ? new Set(config.dataKeys) : null,
        chartType: "area",
        stacked: config.stacked === true,
      },
      api,
    )
    // Store api in context for tooltip handlers
    context.api = api
    // Local (per-render) stack state for composition stacking (no globals)
    if (config.stacked === true) {
      context.stack = {
        sumsByStackId: new Map(), // stackId -> number[] running sums (y0 for next series)
        computedByKey: new Map(), // `${stackId}:${dataKey}` -> [y0,y1][]
      }
    }
    const childrenArray = Array.isArray(children) ? children : [children]

    // When not stacked, reverse order of Area components so first series renders on top
    // This matches the behavior of config-first mode and prevents last area from covering others
    // Dots should always render on top (after all areas) - both stacked and non-stacked
    const isStacked = config.stacked === true
    let childrenToProcess = childrenArray

    // Separate components using stable flags (survives minification)
    // First, we need to process lazy functions from index.js to identify their real types
    const grid = []
    const axes = []
    const areas = []
    const dots = []
    const tooltip = []
    const others = []

    for (const child of childrenArray) {
      // Use stable flags instead of string matching (survives minification)
      if (typeof child === "function") {
        // If it's already marked, add to the correct bucket
        if (child.isGrid) {
          grid.push(child)
        } else if (child.isAxis) {
          axes.push(child)
        } else if (child.isArea) {
          areas.push(child)
        } else if (child.isDots) {
          dots.push(child)
        } else if (child.isTooltip) {
          tooltip.push(child)
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
              } else if (result.isArea) {
                areas.push(child)
              } else if (result.isDots) {
                dots.push(child)
              } else if (result.isTooltip) {
                tooltip.push(child)
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

    if (isStacked) {
      // Stacked: render areas in order, then all dots on top
      // Render order: Grid -> Areas -> Axes -> Dots -> Tooltip -> Others
      childrenToProcess = [
        ...grid,
        ...areas,
        ...axes,
        ...dots,
        ...tooltip,
        ...others,
      ]
    } else {
      // Non-stacked: reverse areas so first series renders on top
      // Render order: Grid -> Reversed Areas -> Axes -> Dots -> Tooltip -> Others
      childrenToProcess = [
        ...grid,
        ...areas.reverse(),
        ...axes,
        ...dots,
        ...tooltip,
        ...others,
      ]
    }

    // Process children to handle lazy functions (like renderDots from index.js)
    // Flow:
    // 1. renderCartesianGrid/renderXAxis from index.js return (ctx) => { return chartType.renderCartesianGrid(...) }
    // 2. chartType.renderCartesianGrid (from area.js) returns gridFn which is (ctx) => { return svg... }
    // 3. So we need: child(context) -> gridFn, then gridFn(context) -> svg
    // Simplified deterministic approach: all functions from index.js return (ctx) => ..., so we can safely call with context
    const processedChildren = childrenToProcess.map((child) => {
      // Non-function children are passed through as-is
      if (typeof child !== "function") {
        return child
      }

      // If it's a marked component (isGrid, isArea, etc), it expects context directly
      if (
        child.isGrid ||
        child.isAxis ||
        child.isArea ||
        child.isDots ||
        child.isTooltip
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

    return html`
      <div
        class="iw-chart"
        style="display: block; position: relative; width: 100%; box-sizing: border-box;"
      >
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
    const gridFn = (ctx) => {
      const { xScale, yScale, dimensions } = ctx
      const entityFromContext = ctx.entity || entity
      const { stroke = "#eee", strokeDasharray = "5 5" } = config
      const transformedData = entityFromContext.data.map((d, i) => ({
        x: i,
        y: 0,
      }))
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
      const transformedData = entityFromContext.data.map((d, i) => ({
        x: i,
        y: 0,
      }))

      return renderXAxis(
        { ...entityFromContext, data: transformedData, xLabels: labels },
        {
          xScale,
          yScale,
          ...dimensions,
        },
        api,
      )
    }
    // Mark as axis component for stable identification
    axisFn.isAxis = true
    return axisFn
  },

  renderYAxis(entity, props, api) {
    const axisFn = (ctx) => {
      const { yScale, dimensions } = ctx
      const entityFromContext = ctx.entity || entity
      const ticks = yScale.ticks ? yScale.ticks(5) : yScale.domain()
      return renderYAxis(
        entityFromContext,
        { yScale, customTicks: ticks, ...dimensions },
        api,
      )
    }
    // Mark as axis component for stable identification
    axisFn.isAxis = true
    return axisFn
  },

  // eslint-disable-next-line no-unused-vars
  renderArea(entity, { config = {} }, api) {
    const areaFn = (ctx) => {
      const { xScale, yScale } = ctx
      const entityFromContext = ctx.entity || entity
      const {
        dataKey,
        fill = "#8884d8",
        fillOpacity = "0.6",
        stroke,
        type: curveType = "linear",
        stackId,
      } = config

      const data = getTransformedData(entityFromContext, dataKey)
      if (!data) return svg``

      // Stacked (Recharts-like): if stackId is provided and chart is configured as stacked
      const isStacked = Boolean(stackId) && Boolean(ctx.stack)

      let areaPath
      let linePath

      if (isStacked) {
        const stackKey = String(stackId)
        const sums =
          ctx.stack.sumsByStackId.get(stackKey) ||
          Array.from({ length: data.length }, () => 0)

        const seriesStack = data.map((d, i) => {
          const y0 = sums[i] || 0
          const y1 = y0 + (typeof d.y === "number" ? d.y : 0)
          return [y0, y1]
        })

        ctx.stack.sumsByStackId.set(
          stackKey,
          seriesStack.map((pair) => pair[1]),
        )
        ctx.stack.computedByKey.set(`${stackKey}:${dataKey}`, seriesStack)

        areaPath = generateStackedAreaPath(
          data,
          xScale,
          yScale,
          seriesStack,
          curveType,
        )
        // Line sits on top of the stack (y1)
        linePath = generateLinePath(
          data.map((d, i) => ({ ...d, y: seriesStack[i]?.[1] ?? d.y })),
          xScale,
          yScale,
          curveType,
        )
      } else {
        areaPath = generateAreaPath(data, xScale, yScale, 0, curveType)
        linePath = stroke
          ? generateLinePath(data, xScale, yScale, curveType)
          : null
      }

      return svg`
        <g class="iw-chart-area">
          ${renderCurve({
            d: areaPath,
            fill,
            fillOpacity,
            className: "iw-chart-area-fill",
            entityId: entityFromContext.id,
          })}
          ${
            linePath
              ? renderCurve({
                  d: linePath,
                  stroke: stroke || fill,
                  className: "iw-chart-area-line",
                  entityId: entityFromContext.id,
                })
              : ""
          }
        </g>
      `
    }
    // Mark as area component for stable identification (survives minification)
    areaFn.isArea = true
    return areaFn
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
        stackId,
      } = config

      const data = getTransformedData(entityFromContext, dataKey)
      if (!data || data.length === 0) return svg``

      const isStacked = Boolean(stackId) && Boolean(ctx.stack)
      const stackKey = isStacked ? String(stackId) : null
      const seriesStack =
        isStacked && stackKey
          ? ctx.stack.computedByKey.get(`${stackKey}:${dataKey}`)
          : null

      return svg`
        <g class="iw-chart-dots" data-data-key=${dataKey}>
          ${repeat(
            data,
            (d, i) => `${dataKey}-${i}`,
            (d, i) => {
              const x = xScale(d.x)
              const y = yScale(
                isStacked && seriesStack ? seriesStack[i]?.[1] : d.y,
              )
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
    // Mark as dots component for stable identification (survives minification)
    dotsFn.isDots = true
    return dotsFn
  },

  renderTooltip: createTooltipComponent(),

  renderBrush: createBrushComponent(),
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
    const areasAndLines = (stacked ? data : [...data].reverse()).map(
      (series, idx) => {
        const originalIdx = stacked ? idx : data.length - 1 - idx
        const values = getSeriesValues(series)
        const color = series.color || colors[originalIdx % colors.length]

        let areaPath, linePath
        if (stacked) {
          const seriesStack = processData[idx] || []
          areaPath = generateStackedAreaPath(
            values,
            xScale,
            yScale,
            seriesStack,
          )
          linePath = generateLinePath(
            values.map((d, i) => ({ ...d, y: seriesStack[i]?.[1] ?? d.y })),
            xScale,
            yScale,
          )
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
      },
    )

    const points = showPoints
      ? (stacked ? data : [...data].reverse()).map((series, idx) => {
          const originalIdx = stacked ? idx : data.length - 1 - idx
          const values = getSeriesValues(series)
          const color = series.color || colors[originalIdx % colors.length]
          const seriesStackedData = stacked ? processData[idx] : null

          return repeat(
            values,
            (d, i) => `${originalIdx}-${i}`,
            (d, i) => {
              const x = xScale(getDataPointX(d, i))
              const y = yScale(
                stacked ? seriesStackedData[i]?.[1] : getDataPointY(d),
              )
              const value = stacked
                ? seriesStackedData[i]?.[1]
                : getDataPointY(d)
              const label = getDataPointLabel(
                d,
                series.name || `Series ${originalIdx + 1}`,
              )

              const { onMouseEnter, onMouseLeave } = createTooltipHandlers({
                entity,
                api,
                tooltipData: { label, value, color },
              })

              return renderDot({
                cx: x,
                cy: y,
                fill: color,
                onMouseEnter,
                onMouseLeave,
              })
            },
          )
        })
      : []

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
      ${
        showPoints
          ? repeat(
              data,
              (d, i) => i,
              (d, i) => {
                const { onMouseEnter, onMouseLeave } = createTooltipHandlers({
                  entity,
                  api,
                  tooltipData: {
                    label: getDataPointLabel(d),
                    value: getDataPointY(d),
                    color,
                  },
                })
                return renderDot({
                  cx: xScale(getDataPointX(d, i)),
                  cy: yScale(getDataPointY(d)),
                  fill: color,
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
