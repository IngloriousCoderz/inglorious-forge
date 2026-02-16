/* eslint-disable no-magic-numbers */
import { html, repeat, svg } from "@inglorious/web"

import { createBrushComponent } from "../component/brush.js"
import { renderGrid } from "../component/grid.js"
import { renderLegend } from "../component/legend.js"
import { createTooltipComponent, renderTooltip } from "../component/tooltip.js"
import { renderXAxis } from "../component/x-axis.js"
import { renderYAxis } from "../component/y-axis.js"
import { chart } from "../index.js"
import { renderCurve } from "../shape/curve.js"
import { renderDot } from "../shape/dot.js"
import { getTransformedData, isMultiSeries } from "../utils/data-utils.js"
import {
  generateAreaPath,
  generateLinePath,
  generateStackedAreaPath,
} from "../utils/paths.js"
import { processDeclarativeChild } from "../utils/process-declarative-child.js"
import { createSharedContext } from "../utils/shared-context.js"
import { createTooltipHandlers } from "../utils/tooltip-handlers.js"

export const area = {
  /**
   * Config-based rendering entry point.
   * Builds default composition children from entity options and delegates to
   * `renderAreaChart`.
   * @param {import('../types/charts').ChartEntity} entity
   * @param {import('@inglorious/web').Api} api
   * @returns {import('lit-html').TemplateResult}
   */
  render(entity, api) {
    const type = api.getType(entity.type)

    // Transform multi-series data to wide format if needed
    let transformedData = entity.data
    let dataKeys = []

    if (isMultiSeries(entity.data)) {
      // Extract dataKeys before transformation
      dataKeys = entity.data.map(
        (series, idx) =>
          series.dataKey || series.name || series.label || `series${idx}`,
      )
      // Transform to wide format for rendering
      transformedData = transformMultiSeriesToWide(entity.data)
    }

    // Create entity with transformed data
    const entityWithData = {
      ...entity,
      data: transformedData,
      dataKey:
        entity.dataKey || (transformedData[0]?.x !== undefined ? "x" : "name"),
    }

    // Convert entity config to declarative children
    const children = buildChildrenFromConfig(entityWithData, dataKeys)

    // Extract dataKeys for config if not already extracted
    if (dataKeys.length === 0) {
      if (entityWithData.data && entityWithData.data.length > 0) {
        const first = entityWithData.data[0]
        dataKeys = Object.keys(first).filter(
          (key) =>
            !["name", "x", "date"].includes(key) &&
            typeof first[key] === "number",
        )
        if (dataKeys.length === 0) {
          dataKeys = ["y", "value"].filter((k) => first[k] !== undefined)
        }
        if (dataKeys.length === 0) {
          dataKeys = ["value"]
        }
      }
    }

    return type.renderAreaChart(
      entityWithData,
      {
        children,
        config: {
          width: entityWithData.width,
          height: entityWithData.height,
          stacked: entity.stacked === true,
          dataKeys: dataKeys.length > 0 ? dataKeys : undefined,
        },
      },
      api,
    )
  },

  /**
   * Composition rendering entry point for area charts.
   * @param {import('../types/charts').ChartEntity} entity
   * @param {{ children: any[]|any, config?: Record<string, any> }} params
   * @param {import('@inglorious/web').Api} api
   * @returns {import('lit-html').TemplateResult}
   */
  renderAreaChart(entity, { children, config = {} }, api) {
    if (!entity) return svg`<text>Entity not found</text>`

    const entityWithData = config.data
      ? { ...entity, data: config.data }
      : entity

    // Auto-detect stacked mode: if config.stacked is not explicitly set,
    // check if any Area component has a stackId
    let isStacked = config.stacked === true
    if (config.stacked === undefined) {
      const childrenArray = Array.isArray(children) ? children : [children]
      const hasStackId = childrenArray.some(
        (child) =>
          child &&
          typeof child === "object" &&
          child.type === "Area" &&
          child.config &&
          child.config.stackId !== undefined,
      )
      if (hasStackId) {
        isStacked = true
        config.stacked = true
      }
    }

    const context = createSharedContext(
      entityWithData,
      {
        width: config.width,
        height: config.height,
        padding: config.padding,
        chartType: "area",
        stacked: isStacked,
      },
      api,
    )
    context.api = api

    if (isStacked) {
      context.stack = {
        sumsByStackId: new Map(),
        computedByKey: new Map(),
      }
    }

    const childrenArray = Array.isArray(children) ? children : [children]

    const processedChildrenArray = childrenArray
      .map((child) =>
        processDeclarativeChild(child, entityWithData, "area", api),
      )
      .filter(Boolean)

    const grid = [],
      axes = [],
      areas = [],
      dots = [],
      tooltip = [],
      legend = [],
      others = []

    for (const child of processedChildrenArray) {
      if (typeof child === "function") {
        if (child.isGrid) grid.push(child)
        else if (child.isAxis) axes.push(child)
        else if (child.isArea) areas.push(child)
        else if (child.isDots) dots.push(child)
        else if (child.isTooltip) tooltip.push(child)
        else if (child.isLegend) legend.push(child)
        else others.push(child)
      } else {
        others.push(child)
      }
    }

    const sortedChildren = [
      ...grid,
      ...(isStacked ? areas : [...areas].reverse()),
      ...axes,
      ...dots,
      ...tooltip,
      ...legend,
      ...others,
    ]

    const finalRendered = sortedChildren.map((child) => {
      if (typeof child !== "function") return child
      const result = child(context)
      return typeof result === "function" ? result(context) : result
    })

    return html`
      <div
        class="iw-chart"
        style="display: block; position: relative; width: 100%;"
      >
        <svg
          width=${context.dimensions.width}
          height=${context.dimensions.height}
          viewBox="0 0 ${context.dimensions.width} ${context.dimensions.height}"
        >
          ${finalRendered}
        </svg>
        ${renderTooltip(entityWithData, {}, api)}
      </div>
    `
  },

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
      return renderGrid(
        ctx.entity || entity,
        { xScale, yScale, ...dimensions, ...config },
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
      const { xScale, yScale, dimensions } = ctx
      const ent = ctx.entity || entity
      const labels = ent.data.map(
        (d, i) => d[config.dataKey] || d.name || String(i),
      )
      return renderXAxis(
        { ...ent, xLabels: labels },
        { xScale, yScale, ...dimensions },
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
  /**
   * Composition sub-render for Y axis.
   * @param {import('../types/charts').ChartEntity} entity
   * @param {{ config?: Record<string, any> }} params
   * @param {import('@inglorious/web').Api} api
   * @returns {(ctx: Record<string, any>) => import('lit-html').TemplateResult}
   */
  // eslint-disable-next-line no-unused-vars
  renderYAxis(entity, { config = {} }, api) {
    const axisFn = (ctx) => {
      const { yScale, dimensions } = ctx
      return renderYAxis(ctx.entity || entity, { yScale, ...dimensions }, api)
    }
    axisFn.isAxis = true
    return axisFn
  },

  /**
   * Composition sub-render for area paths.
   * @param {import('../types/charts').ChartEntity} entity
   * @param {{ config?: Record<string, any> }} params
   * @param {import('@inglorious/web').Api} api
   * @returns {(ctx: Record<string, any>) => import('lit-html').TemplateResult}
   */
  // eslint-disable-next-line no-unused-vars
  renderArea(entity, { config = {} }, api) {
    const areaFn = (ctx) => {
      const { xScale, yScale } = ctx
      const {
        dataKey,
        fill = "#8884d8",
        fillOpacity = "0.6",
        stroke,
        stackId,
      } = config
      const data = getTransformedData(ctx.entity || entity, dataKey)
      if (!data) return svg``

      const isStacked = Boolean(stackId) && Boolean(ctx.stack)
      let areaPath, linePath

      if (isStacked) {
        const stackKey = String(stackId)
        const sums =
          ctx.stack.sumsByStackId.get(stackKey) || Array(data.length).fill(0)
        const seriesStack = data.map((d, i) => [sums[i], sums[i] + (d.y || 0)])
        ctx.stack.sumsByStackId.set(
          stackKey,
          seriesStack.map((p) => p[1]),
        )
        ctx.stack.computedByKey.set(`${stackKey}:${dataKey}`, seriesStack)
        areaPath = generateStackedAreaPath(data, xScale, yScale, seriesStack)
        linePath = generateLinePath(
          data.map((d, i) => ({ ...d, y: seriesStack[i][1] })),
          xScale,
          yScale,
        )
      } else {
        areaPath = generateAreaPath(data, xScale, yScale, 0)
        linePath = generateLinePath(data, xScale, yScale)
      }

      return svg`
        <g class="iw-chart-area">
          ${renderCurve({ d: areaPath, fill, fillOpacity })}
          ${linePath ? renderCurve({ d: linePath, stroke: stroke || fill }) : ""}
        </g>`
    }
    areaFn.isArea = true
    return areaFn
  },

  /**
   * Composition sub-render for area dots.
   * @param {import('../types/charts').ChartEntity} entity
   * @param {{ config?: Record<string, any> }} params
   * @param {import('@inglorious/web').Api} api
   * @returns {(ctx: Record<string, any>) => import('lit-html').TemplateResult}
   */
  renderDots(entity, { config = {} }, api) {
    const dotsFn = (ctx) => {
      const { xScale, yScale } = ctx
      const entityFromContext = ctx.entity || entity
      const { dataKey, fill = "#8884d8" } = config
      const data = getTransformedData(entityFromContext, dataKey)
      if (!data || data.length === 0) return svg``

      const seriesStack = ctx.stack?.computedByKey.get(
        `${config.stackId}:${dataKey}`,
      )

      return svg`
        <g class="iw-chart-dots">
          ${repeat(
            data,
            (d, i) => `${dataKey}-${i}`,
            (d, i) => {
              const x = xScale(d.x)
              const y = yScale(seriesStack ? seriesStack[i]?.[1] : d.y)
              // Get label from original data point (like line chart does)
              const originalDataPoint = entityFromContext.data[i]
              const label =
                originalDataPoint?.name ||
                originalDataPoint?.label ||
                String(d.x)
              const value = seriesStack ? seriesStack[i]?.[1] : d.y

              const { onMouseEnter, onMouseLeave } = createTooltipHandlers({
                entity: entityFromContext,
                api: ctx.api || api,
                tooltipData: { label, value, color: fill },
              })
              return renderDot({
                cx: x,
                cy: y,
                fill,
                onMouseEnter,
                onMouseLeave,
              })
            },
          )}
        </g>`
    }
    dotsFn.isDots = true
    return dotsFn
  },

  /**
   * Composition sub-render for tooltip overlay.
   * @type {(entity: import('../types/charts').ChartEntity, params: { config?: Record<string, any> }, api: import('@inglorious/web').Api) => (ctx: Record<string, any>) => import('lit-html').TemplateResult}
   */
  renderTooltip: createTooltipComponent(),

  renderLegend(entity, { config = {} }, api) {
    const legendFn = (ctx) => {
      const { dimensions } = ctx
      const { dataKeys, colors } = config

      if (!dataKeys || dataKeys.length === 0) {
        return svg``
      }

      // Convert dataKeys and colors to series format expected by renderLegend
      const series = dataKeys.map((dataKey, index) => ({
        name: dataKey,
        color: colors && colors[index] ? colors[index] : undefined,
      }))

      return renderLegend(
        ctx.entity || entity,
        {
          series,
          colors: colors || [],
          width: dimensions.width,
          padding: dimensions.padding,
        },
        api,
      )
    }
    legendFn.isLegend = true
    return legendFn
  },

  /**
   * Composition sub-render for brush control.
   * @type {(entity: import('../types/charts').ChartEntity, params: { config?: Record<string, any> }, api: import('@inglorious/web').Api) => (ctx: Record<string, any>) => import('lit-html').TemplateResult}
   */
  renderBrush: createBrushComponent(),
}

/**
 * Builds declarative children from entity config for render (config style)
 * Converts entity configuration into children objects that renderAreaChart can process
 * @param {import('../types/charts').ChartEntity} entity
 * @param {string[]} [providedDataKeys] - Optional dataKeys if already extracted (e.g., from multi-series before transformation)
 */
function buildChildrenFromConfig(entity, providedDataKeys = null) {
  const children = []

  if (entity.showGrid !== false) {
    children.push(
      chart.CartesianGrid({ stroke: "#eee", strokeDasharray: "5 5" }),
    )
  }

  // XAxis - determine dataKey from entity or data structure
  let xAxisDataKey = entity.dataKey
  if (!xAxisDataKey && entity.data?.length > 0) {
    const first = entity.data[0]
    xAxisDataKey = first.name || first.x || first.date || "name"
  }
  if (!xAxisDataKey) {
    xAxisDataKey = "name"
  }
  children.push(chart.XAxis({ dataKey: xAxisDataKey }))
  children.push(chart.YAxis({ width: "auto" }))

  // Extract dataKeys from entity data or use provided ones
  let dataKeys = providedDataKeys
  if (!dataKeys || dataKeys.length === 0) {
    if (isMultiSeries(entity.data)) {
      // Multi-series: use series names as dataKeys
      dataKeys = entity.data.map((s, i) => s.dataKey || s.name || `series${i}`)
    } else if (entity.data?.length > 0) {
      // Wide format: extract numeric keys
      const first = entity.data[0]
      dataKeys = Object.keys(first).filter(
        (key) =>
          !["name", "x", "date"].includes(key) && typeof first[key] === "number",
      )
      if (dataKeys.length === 0) {
        dataKeys = ["y", "value"].filter((k) => first[k] !== undefined)
      }
      if (dataKeys.length === 0) {
        dataKeys = ["value"]
      }
    } else {
      dataKeys = ["value"]
    }
  }

  const colors = entity.colors || ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"]
  const isStacked = entity.stacked === true

  dataKeys.forEach((key, i) => {
    children.push(
      chart.Area({
        dataKey: key,
        fill: colors[i % colors.length],
        fillOpacity: "0.6",
        stroke: colors[i % colors.length],
        stackId: isStacked ? "1" : undefined,
      }),
    )
  })

  if (entity.showPoints !== false) {
    dataKeys.forEach((key, i) => {
      children.push(
        chart.Dots({
          dataKey: key,
          fill: colors[i % colors.length],
          stackId: isStacked ? "1" : undefined,
        }),
      )
    })
  }

  if (entity.showTooltip !== false) children.push(chart.Tooltip({}))

  // Legend
  if (entity.showLegend === true && dataKeys.length > 1) {
    children.push(
      chart.Legend({ dataKeys, colors: colors.slice(0, dataKeys.length) }),
    )
  }

  if (entity.brush?.enabled) {
    children.push(chart.Brush({ dataKey: xAxisDataKey || "name" }))
  }

  return children
}

function transformMultiSeriesToWide(multiSeriesData) {
  if (!isMultiSeries(multiSeriesData)) return null
  const dataMap = new Map()
  const seriesKeys = multiSeriesData.map((s) => s.dataKey || s.name || "series")

  multiSeriesData.forEach((series, seriesIdx) => {
    const key = seriesKeys[seriesIdx]
    const values = Array.isArray(series.values) ? series.values : [series]
    values.forEach((point, index) => {
      const xVal = point?.x ?? index
      if (!dataMap.has(xVal)) dataMap.set(xVal, { x: xVal, name: String(xVal) })
      dataMap.get(xVal)[key] = point?.y ?? point?.value ?? 0
    })
  })

  return Array.from(dataMap.values()).sort((a, b) => {
    return typeof a.x === "number"
      ? a.x - b.x
      : String(a.x).localeCompare(String(b.x))
  })
}
