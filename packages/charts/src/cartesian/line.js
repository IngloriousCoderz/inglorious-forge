/* eslint-disable no-magic-numbers */

import { html, repeat, svg } from "@inglorious/web"

import { createBrushComponent } from "../component/brush.js"
import { renderGrid } from "../component/grid.js"
import { renderLegend } from "../component/legend.js"
import { createTooltipComponent, renderTooltip } from "../component/tooltip.js"
import { renderXAxis } from "../component/x-axis.js"
import { renderYAxis } from "../component/y-axis.js"
import { chart } from "../index.js"
import { renderDot } from "../shape/dot.js"
import {
  getTransformedData,
  isMultiSeries,
  parseDimension,
} from "../utils/data-utils.js"
import { extractDataKeysFromChildren } from "../utils/extract-data-keys.js"
import { calculatePadding } from "../utils/padding.js"
import { generateLinePath } from "../utils/paths.js"
import { processDeclarativeChild } from "../utils/process-declarative-child.js"
import { getFilteredData } from "../utils/scales.js"
import { createSharedContext } from "../utils/shared-context.js"
import {
  createTooltipHandlers,
  createTooltipMoveHandler,
} from "../utils/tooltip-handlers.js"

// Removed global Maps - now using local context to avoid interference between charts

export const line = {
  /**
   * Config-based rendering entry point.
   * Builds default composition children from entity options and delegates to
   * `renderLineChart`.
   * @param {import('../types/charts').ChartEntity} entity
   * @param {import('@inglorious/web').Api} api
   * @returns {import('lit-html').TemplateResult}
   */
  render(entity, api) {
    const type = api.getType(entity.type)

    // Apply data filtering if brush is enabled
    const entityData = entity.brush?.enabled
      ? getFilteredData(entity)
      : entity.data

    // Create entity with filtered data for rendering
    const entityWithFilteredData = { ...entity, data: entityData }

    // Convert entity config to declarative children
    const children = buildChildrenFromConfig(entityWithFilteredData)

    // Extract dataKeys for config
    let dataKeys = []
    if (isMultiSeries(entityWithFilteredData.data)) {
      dataKeys = entityWithFilteredData.data.map(
        (series, idx) =>
          series.dataKey || series.name || series.label || `series${idx}`,
      )
    } else {
      dataKeys = ["y", "value"].filter(
        (key) =>
          entityWithFilteredData.data &&
          entityWithFilteredData.data.length > 0 &&
          entityWithFilteredData.data[0][key] !== undefined,
      )
      if (dataKeys.length === 0) {
        dataKeys = ["value"]
      }
    }

    // Use the unified motor (renderLineChart)
    // Pass original entity in config so brush can access unfiltered data
    return type.renderLineChart(
      entityWithFilteredData,
      {
        children,
        config: {
          width: entityWithFilteredData.width,
          height: entityWithFilteredData.height,
          dataKeys,
          originalEntity: entity, // Pass original entity for brush
        },
      },
      api,
    )
  },

  /**
   * Composition rendering entry point for line charts.
   * @param {import('../types/charts').ChartEntity} entity
   * @param {{ children: any[]|any, config?: Record<string, any> }} params
   * @param {import('@inglorious/web').Api} api
   * @returns {import('lit-html').TemplateResult}
   */
  renderLineChart(entity, { children, config = {} }, api) {
    if (!entity) {
      return svg`<text>Entity not found</text>`
    }

    // 1. Define the data
    let entityData = config.data || entity.data
    const entityWithData = { ...entity, data: entityData }

    // 2. Extract dataKeys from config or auto-extract from children
    const dataKeysSet = new Set()
    if (config.dataKeys && Array.isArray(config.dataKeys)) {
      config.dataKeys.forEach((key) => dataKeysSet.add(key))
    } else if (children) {
      // Auto-extract dataKeys from children
      const autoDataKeys = extractDataKeysFromChildren(children)
      autoDataKeys.forEach((key) => dataKeysSet.add(key))
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

    // Process declarative children before creating the context
    // For brush, use original entity data (if available) to ensure correct positioning
    const entityForBrush = config.originalEntity || entityWithData
    const processedChildrenArray = childrenArray
      .map((child) => {
        // If this is a Brush component, use original entity data
        if (child && typeof child === "object" && child.type === "Brush") {
          return processDeclarativeChild(child, entityForBrush, "line", api)
        }
        return processDeclarativeChild(child, entityWithData, "line", api)
      })
      .filter(Boolean)

    const chartHeight = height

    // For X scale creation, use original entity data if available (config mode with brush)
    // Otherwise use entityWithData (composition mode)
    // This ensures X scale always has access to original data with valid x/date values
    const entityForXScale = config.originalEntity || entityWithData

    const context = createSharedContext(
      entityForXScale,
      {
        width,
        height: chartHeight,
        padding,
        usedDataKeys: dataKeysSet,
        chartType: "line",
        // Pass filtered entity for Y scale calculation (uses filtered data for maxValue)
        filteredEntity: entityWithData,
      },
      api,
    )

    // Simplified check: processDeclarativeChild now guarantees the flag is set
    const hasBrush = processedChildrenArray.some(
      (child) => child && child.isBrush,
    )
    const brushHeight = hasBrush ? 60 : 0
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

    // 4. APPLY ZOOM
    if (entity.brush?.enabled && entity.brush.startIndex !== undefined) {
      const { startIndex, endIndex } = entity.brush
      context.xScale.domain([startIndex, endIndex])
    }

    context.dimensions = { width, height: chartHeight, padding }
    context.totalHeight = totalHeight
    context.entity = entityWithData
    // Use originalEntity from config if available (for brush in config mode)
    // Otherwise use entity (for composition mode)
    context.fullEntity = config.originalEntity || entity
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

    // Simplified categorization: processDeclarativeChild now guarantees flags are set
    for (const child of processedChildrenArray) {
      if (typeof child === "function") {
        // Flags MUST exist now thanks to processDeclarativeChild
        if (child.isGrid) grid.push(child)
        else if (child.isAxis) axes.push(child)
        else if (child.isLine) lines.push(child)
        else if (child.isDots) dots.push(child)
        else if (child.isTooltip) tooltip.push(child)
        else if (child.isLegend) legend.push(child)
        else if (child.isBrush) brush.push(child)
        else others.push(child)
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
        child.isLegend ||
        child.isBrush
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

  /**
   * Composition sub-render for cartesian grid.
   * @param {import('../types/charts').ChartEntity} entity
   * @param {{ config?: Record<string, any> }} params
   * @param {import('@inglorious/web').Api} api
   * @returns {(ctx: Record<string, any>) => import('lit-html').TemplateResult}
   */
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

  /**
   * Composition sub-render for X axis.
   * @param {import('../types/charts').ChartEntity} entity
   * @param {{ config?: Record<string, any> }} params
   * @param {import('@inglorious/web').Api} api
   * @returns {(ctx: Record<string, any>) => import('lit-html').TemplateResult}
   */
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

  /**
   * Composition sub-render for Y axis.
   * @param {import('../types/charts').ChartEntity} entity
   * @param {{ config?: Record<string, any> }} params
   * @param {import('@inglorious/web').Api} api
   * @returns {(ctx: Record<string, any>) => import('lit-html').TemplateResult}
   */
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

  /**
   * Composition sub-render for line paths.
   * @param {import('../types/charts').ChartEntity} entity
   * @param {{ config?: Record<string, any> }} params
   * @param {import('@inglorious/web').Api} api
   * @returns {(ctx: Record<string, any>) => import('lit-html').TemplateResult}
   */
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

      // CRITICAL: Preserve original index for filtered data
      // When brush is enabled, entity.data is filtered (e.g., indices 31-99)
      // But getTransformedData creates data with x: 0, 1, 2... (reset indices)
      // We need to map these back to their original positions in the full dataset
      // This ensures the line is drawn at the correct X position matching the xScale domain
      const startIndex = entityFromContext.brush?.startIndex || 0
      const chartData = data.map((d, i) => ({
        ...d,
        x: startIndex + i, // The 'x' must be the real position in the total series
      }))

      // Generate path using the corrected data with original indices
      const path = generateLinePath(chartData, xScale, yScale, curveType)

      // If path is null or empty, return empty
      if (!path || path.includes("NaN")) {
        return svg``
      }

      // Render dots if showDots is true
      // Use chartData (with corrected indices) instead of data
      const dots = showDots
        ? repeat(
            chartData,
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
    // Expose dataKey for automatic extraction
    lineFn.dataKey = config.dataKey
    return lineFn
  },

  /**
   * Composition sub-render for line dots.
   * @param {import('../types/charts').ChartEntity} entity
   * @param {{ config?: Record<string, any> }} params
   * @param {import('@inglorious/web').Api} api
   * @returns {(ctx: Record<string, any>) => import('lit-html').TemplateResult}
   */
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

      // CRITICAL: Preserve original index for filtered data (same as renderLine)
      // When brush is enabled, entity.data is filtered (e.g., indices 31-99)
      // But getTransformedData creates data with x: 0, 1, 2... (reset indices)
      // We need to map these back to their original positions in the full dataset
      const startIndex = entityFromContext.brush?.startIndex || 0
      const chartData = data.map((d, i) => ({
        ...d,
        x: startIndex + i, // The 'x' must be the real position in the total series
      }))

      return svg`
        <g class="iw-chart-dots" data-data-key=${dataKey} clip-path="url(#chart-clip-${ctx.entity.id})">
          ${repeat(
            chartData,
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
    // Expose dataKey for automatic extraction
    dotsFn.dataKey = config.dataKey
    return dotsFn
  },

  /**
   * Composition sub-render for legend.
   * @param {import('../types/charts').ChartEntity} entity
   * @param {{ config?: Record<string, any> }} params
   * @param {import('@inglorious/web').Api} api
   * @returns {(ctx: Record<string, any>) => import('lit-html').TemplateResult}
   */
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

  /**
   * Composition sub-render for tooltip overlay.
   * @type {(entity: import('../types/charts').ChartEntity, params: { config?: Record<string, any> }, api: import('@inglorious/web').Api) => (ctx: Record<string, any>) => import('lit-html').TemplateResult}
   */
  renderTooltip: createTooltipComponent(),

  /**
   * Composition sub-render for brush control.
   * @type {(entity: import('../types/charts').ChartEntity, params: { config?: Record<string, any> }, api: import('@inglorious/web').Api) => (ctx: Record<string, any>) => import('lit-html').TemplateResult}
   */
  renderBrush: createBrushComponent(),
}

/**
 * Builds declarative children from entity config for renderChart (config style)
 * Converts entity configuration into children objects that renderLineChart can process
 */
function buildChildrenFromConfig(entity) {
  const children = []

  // Grid
  if (entity.showGrid !== false) {
    children.push(
      chart.CartesianGrid({ stroke: "#eee", strokeDasharray: "5 5" }),
    )
  }

  // XAxis - determine dataKey from entity or data structure
  let xAxisDataKey = entity.dataKey
  if (!xAxisDataKey && entity.data && entity.data.length > 0) {
    const firstItem = entity.data[0]
    xAxisDataKey = firstItem.name || firstItem.x || firstItem.date || "name"
  }
  if (!xAxisDataKey) {
    xAxisDataKey = "name"
  }
  children.push(chart.XAxis({ dataKey: xAxisDataKey }))

  // YAxis
  children.push(chart.YAxis({ width: "auto" }))

  // Extract dataKeys from entity data
  let dataKeys = []
  if (isMultiSeries(entity.data)) {
    // Multi-series: use series names as dataKeys
    dataKeys = entity.data.map((series, idx) => {
      // Try to get dataKey from series, or use index
      return series.dataKey || series.name || series.label || `series${idx}`
    })
  } else {
    // Single series: use "y" or "value" as dataKey
    dataKeys = ["y", "value"].filter(
      (key) =>
        entity.data &&
        entity.data.length > 0 &&
        entity.data[0][key] !== undefined,
    )
    if (dataKeys.length === 0) {
      dataKeys = ["value"] // Default fallback
    }
  }

  // Lines (one per dataKey)
  const colors = entity.colors || ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"]
  dataKeys.forEach((dataKey, index) => {
    children.push(
      chart.Line({
        dataKey,
        stroke: colors[index % colors.length],
        showDots: entity.showPoints !== false,
      }),
    )
  })

  // Dots (if showPoints is true)
  if (entity.showPoints !== false && dataKeys.length > 0) {
    dataKeys.forEach((dataKey, index) => {
      children.push(
        chart.Dots({
          dataKey,
          fill: colors[index % colors.length],
        }),
      )
    })
  }

  // Tooltip
  if (entity.showTooltip !== false) {
    children.push(chart.Tooltip({}))
  }

  // Legend
  if (entity.showLegend && isMultiSeries(entity.data)) {
    children.push(
      chart.Legend({
        dataKeys,
        labels: entity.labels || dataKeys,
        colors: entity.colors,
      }),
    )
  }

  // Brush
  if (entity.brush?.enabled) {
    children.push(
      chart.Brush({
        dataKey: xAxisDataKey,
        height: entity.brush.height || 30,
      }),
    )
  }

  return children
}
