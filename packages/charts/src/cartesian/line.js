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

    let dataKeys = []
    if (isMultiSeries(entity.data)) {
      dataKeys = entity.data.map(
        (series, idx) =>
          series.dataKey || series.name || series.label || `series${idx}`,
      )
    } else {
      dataKeys = ["y", "value"].filter(
        (key) => entity.data?.[0]?.[key] !== undefined,
      )
      if (dataKeys.length === 0) dataKeys = ["value"]
    }

    // Use the unified motor (renderLineChart)
    // Pass original entity in config so brush can access unfiltered data
    return type.renderLineChart(
      entityWithFilteredData,
      {
        children,
        config: {
          width: entity.width,
          height: entity.height,
          dataKeys,
          originalEntity: entity, // Reference to full data
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
    if (!entity) return svg`<text>Entity not found</text>`

    // 1. Always calculate filtered data for current view
    // This ensures both Config and Composition modes react to Brush
    const entityData = entity.brush?.enabled
      ? getFilteredData(entity)
      : config.data || entity.data

    const entityWithData = { ...entity, data: entityData }

    const dataKeysSet = new Set()
    if (config.dataKeys && Array.isArray(config.dataKeys)) {
      config.dataKeys.forEach((key) => dataKeysSet.add(key))
    } else if (children) {
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
    const entityForBrush = config.originalEntity || entity

    const processedChildrenArray = childrenArray
      .map((child) => {
        // Brush needs full data, other components (Line, Dots) use filtered data
        const targetEntity =
          child && child.type === "Brush" ? entityForBrush : entityWithData
        return processDeclarativeChild(child, targetEntity, "line", api)
      })
      .filter(Boolean)

    // 2. Create scale context based on FULL data (entityForBrush)
    // so that X and Y scales don't "jump" when filter changes
    const context = createSharedContext(
      entityForBrush,
      {
        width,
        height,
        padding,
        usedDataKeys: dataKeysSet,
        chartType: "line",
        filteredEntity: entityWithData,
      },
      api,
    )

    // 3. Synchronize X scale domain with Brush window
    if (entity.brush?.enabled && entity.brush.startIndex !== undefined) {
      context.xScale.domain([entity.brush.startIndex, entity.brush.endIndex])
    }

    context.dimensions = { width, height, padding }
    context.entity = entityWithData
    context.fullEntity = entityForBrush
    context.api = api

    const cat = {
      grid: [],
      axes: [],
      lines: [],
      dots: [],
      tooltip: [],
      legend: [],
      brush: [],
      others: [],
    }
    for (const child of processedChildrenArray) {
      if (typeof child === "function") {
        if (child.isGrid) cat.grid.push(child)
        else if (child.isAxis) cat.axes.push(child)
        else if (child.isLine) cat.lines.push(child)
        else if (child.isDots) cat.dots.push(child)
        else if (child.isTooltip) cat.tooltip.push(child)
        else if (child.isLegend) cat.legend.push(child)
        else if (child.isBrush) cat.brush.push(child)
        else cat.others.push(child)
      } else {
        cat.others.push(child)
      }
    }

    const childrenToProcess = [
      ...cat.grid,
      ...cat.lines,
      ...cat.axes,
      ...cat.dots,
      ...cat.tooltip,
      ...cat.legend,
      ...cat.brush,
      ...cat.others,
    ]
    const processedChildren = childrenToProcess.map((child) =>
      typeof child === "function" ? child(context) : child,
    )

    return html`
      <div
        class="iw-chart"
        style="display: block; position: relative; width: 100%; box-sizing: border-box;"
      >
        <svg
          width=${width}
          height=${height + (cat.brush.length ? 60 : 0)}
          viewBox="0 0 ${width} ${height + (cat.brush.length ? 60 : 0)}"
          class="iw-chart-svg"
          @mousemove=${createTooltipMoveHandler({
            entity: entityWithData,
            api,
          })}
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
        ${renderTooltip(entityWithData, {}, api)}
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
      const { stroke = "#eee", strokeDasharray = "5 5" } = config
      const ticks = yScale.ticks ? yScale.ticks(5) : yScale.domain()
      return renderGrid(
        ctx.entity,
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
      const { xScale, yScale, dimensions, fullEntity } = ctx
      const { dataKey } = config
      const allData = fullEntity.data || []
      const [viewStart, viewEnd] = xScale.domain()

      const visibleIndices = allData
        .map((_, i) => i)
        .filter((i) => i >= Math.floor(viewStart) && i <= Math.ceil(viewEnd))

      const labels = visibleIndices.map((i) => allData[i][dataKey] || String(i))

      return renderXAxis(
        { ...ctx.entity, xLabels: labels },
        { xScale, yScale, customTicks: visibleIndices, ...dimensions },
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
    const axisFn = (ctx) => {
      const { yScale, dimensions } = ctx
      const ticks = yScale.ticks ? yScale.ticks(5) : yScale.domain()
      return renderYAxis(
        ctx.entity,
        { yScale, customTicks: ticks, ...dimensions },
        api,
      )
    }
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
      const { xScale, yScale, entity: e } = ctx
      const {
        dataKey,
        stroke = "#8884d8",
        type = "linear",
        showDots = false,
        dotR = "0.25em",
        dotStroke = "white",
        dotStrokeWidth = "0.125em",
      } = config

      const data = getTransformedData(e, dataKey)
      const startIndex = e.brush?.startIndex || 0
      const chartData = data.map((d, i) => ({ ...d, x: startIndex + i }))

      const path = generateLinePath(chartData, xScale, yScale, type)
      if (!path || path.includes("NaN")) return svg``

      return svg`
        <g class="iw-chart-line-group" clip-path="url(#chart-clip-${e.id})">
          <path d="${path}" stroke="${stroke}" fill="none" stroke-width="2" />
          ${showDots ? line.renderDots(e, { config: { ...config, r: dotR, stroke: dotStroke, strokeWidth: dotStrokeWidth, fill: stroke } }, api)(ctx) : ""}
        </g>
      `
    }
    lineFn.isLine = true
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
      const { xScale, yScale, entity: e } = ctx
      const {
        dataKey,
        fill = "#8884d8",
        r = "0.25em",
        stroke = "white",
        strokeWidth = "0.125em",
      } = config

      const data = getTransformedData(e, dataKey)
      if (!data || data.length === 0) return svg``
      const startIndex = e.brush?.startIndex || 0

      return svg`
        <g class="iw-chart-dots" clip-path="url(#chart-clip-${e.id})">
          ${repeat(
            data,
            (d, i) => `${dataKey}-${startIndex + i}`,
            (d, i) => {
              const x = xScale(startIndex + i),
                y = yScale(d.y)
              const { onMouseEnter, onMouseLeave } = createTooltipHandlers({
                entity: e,
                api: ctx.api || api,
                tooltipData: {
                  label: String(startIndex + i),
                  value: d.y,
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
                onMouseEnter,
                onMouseLeave,
              })
            },
          )}
        </g>
      `
    }
    dotsFn.isDots = true
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
      const { dataKeys = [], labels = [], colors = [] } = config
      const series = dataKeys.map((key, i) => ({
        name: labels[i] || key,
        color: colors[i % colors.length] || "#8884d8",
      }))
      return renderLegend(entity, { series, ...dimensions }, api)
    }
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
