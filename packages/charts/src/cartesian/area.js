/* eslint-disable no-magic-numbers */
import { html, repeat, svg } from "@inglorious/web"

import { createBrushComponent } from "../component/brush.js"
import { renderGrid } from "../component/grid.js"
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
    const children = buildChildrenFromConfig(entity)

    return type.renderAreaChart(
      entity,
      {
        children,
        config: {
          width: entity.width,
          height: entity.height,
          stacked: entity.stacked === true,
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
    const context = createSharedContext(
      entityWithData,
      {
        width: config.width,
        height: config.height,
        padding: config.padding,
        chartType: "area",
        stacked: config.stacked === true,
      },
      api,
    )
    context.api = api

    if (config.stacked === true) {
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
      others = []

    for (const child of processedChildrenArray) {
      if (typeof child === "function") {
        if (child.isGrid) grid.push(child)
        else if (child.isAxis) axes.push(child)
        else if (child.isArea) areas.push(child)
        else if (child.isDots) dots.push(child)
        else if (child.isTooltip) tooltip.push(child)
        else others.push(child)
      } else {
        others.push(child)
      }
    }

    const isStacked = config.stacked === true
    const sortedChildren = [
      ...grid,
      ...(isStacked ? areas : [...areas].reverse()),
      ...axes,
      ...dots,
      ...tooltip,
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
  renderYAxis(entity, props, api) {
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

  /**
   * Composition sub-render for brush control.
   * @type {(entity: import('../types/charts').ChartEntity, params: { config?: Record<string, any> }, api: import('@inglorious/web').Api) => (ctx: Record<string, any>) => import('lit-html').TemplateResult}
   */
  renderBrush: createBrushComponent(),
}

/**
 * Builds declarative children from entity config for render (config style)
 * Converts entity configuration into children objects that renderAreaChart can process
 */
function buildChildrenFromConfig(entity) {
  const children = []

  if (entity.showGrid !== false) {
    children.push(
      chart.CartesianGrid({ stroke: "#eee", strokeDasharray: "5 5" }),
    )
  }

  let xAxisDataKey = entity.dataKey
  if (!xAxisDataKey && entity.data && entity.data.length > 0) {
    const firstItem = entity.data[0]
    xAxisDataKey = firstItem.name || firstItem.x || firstItem.date || "name"
  }
  children.push(chart.XAxis({ dataKey: xAxisDataKey || "name" }))
  children.push(chart.YAxis({ width: "auto" }))

  let dataKeys = []
  if (isMultiSeries(entity.data)) {
    dataKeys = entity.data.map(
      (series, idx) => series.dataKey || series.name || `series${idx}`,
    )
  } else {
    dataKeys = ["y", "value"].filter(
      (key) =>
        entity.data &&
        entity.data.length > 0 &&
        entity.data[0][key] !== undefined,
    )
    if (dataKeys.length === 0) dataKeys = ["value"]
  }

  const colors = entity.colors || ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"]
  const isStacked = entity.stacked === true

  dataKeys.forEach((dataKey, index) => {
    children.push(
      chart.Area({
        dataKey,
        fill: colors[index % colors.length],
        fillOpacity: "0.6",
        stroke: colors[index % colors.length],
        stackId: isStacked ? "1" : undefined,
      }),
    )
  })

  if (entity.showPoints !== false) {
    dataKeys.forEach((dataKey, index) => {
      children.push(
        chart.Dots({
          dataKey,
          fill: colors[index % colors.length],
          stackId: isStacked ? "1" : undefined,
        }),
      )
    })
  }

  if (entity.showTooltip !== false) children.push(chart.Tooltip({}))

  return children
}
