/* eslint-disable no-magic-numbers */
import { html, svg } from "@inglorious/web"
import { repeat } from "@inglorious/web/directives/repeat"

import { createBrushComponent } from "../component/brush.js"
import { renderGrid } from "../component/grid.js"
import { renderLegend } from "../component/legend.js"
import { createTooltipComponent, renderTooltip } from "../component/tooltip.js"
import { renderXAxis } from "../component/x-axis.js"
import { renderYAxis } from "../component/y-axis.js"
import { chart } from "../index.js"
import { renderCurve } from "../shape/curve.js"
import { renderDot } from "../shape/dot.js"
import {
  createCartesianRenderer,
  sortChildrenByLayer,
} from "../utils/cartesian-renderer.js"
import { getTransformedData } from "../utils/data-utils.js"
import { extractDataKeysFromChildren } from "../utils/extract-data-keys.js"
import {
  generateAreaPath,
  generateLinePath,
  generateStackedAreaPath,
} from "../utils/paths.js"
import { processDeclarativeChild } from "../utils/process-declarative-child.js"
import { ensureChartRuntimeId } from "../utils/runtime-id.js"
import { createSharedContext } from "../utils/shared-context.js"
import { createTooltipHandlers } from "../utils/tooltip-handlers.js"

export const area = {
  render: createCartesianRenderer({
    seriesType: "area",
    chartApi: () => chart,
    toDisplayData: ({ transformedData }) => transformedData,
    buildRenderConfig: ({ entity, entityWithData, dataKeys }) => ({
      width: entityWithData.width,
      height: entityWithData.height,
      stacked: entity.stacked === true,
      dataKeys,
    }),
  }),

  /**
   * Composition rendering entry point for area charts.
   * @param {import('../types/charts').ChartEntity} entity
   * @param {{ children: any[]|any, config?: Record<string, any> }} params
   * @param {import('@inglorious/web').Api} api
   * @returns {import('lit-html').TemplateResult}
   */
  renderAreaChart(entity, params = {}, api) {
    if (!entity) return svg`<text>Entity not found</text>`
    const { children, ...config } = params

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

    // Collect data keys (used for scales and legends)
    const dataKeysSet = new Set()
    if (config.dataKeys && Array.isArray(config.dataKeys)) {
      config.dataKeys.forEach((key) => dataKeysSet.add(key))
    } else if (children) {
      const autoDataKeys = extractDataKeysFromChildren(children)
      autoDataKeys.forEach((key) => dataKeysSet.add(key))
    }

    const context = createSharedContext(
      entityWithData,
      {
        width: config.width,
        height: config.height,
        padding: config.padding,
        chartType: "area",
        stacked: isStacked,
        usedDataKeys: dataKeysSet,
        filteredEntity: entityWithData,
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
    const hasLineChildren = childrenArray.some(
      (child) => child && child.type === "Line",
    )
    const clipPathId = hasLineChildren
      ? `chart-clip-${ensureChartRuntimeId(entityWithData)}`
      : null
    if (clipPathId) context.clipPathId = clipPathId

    const processedChildrenArray = childrenArray
      .map((child) =>
        processDeclarativeChild(child, entityWithData, "area", api),
      )
      .filter(Boolean)

    const { orderedChildren: sortedChildren } = sortChildrenByLayer(
      processedChildrenArray,
      {
        seriesFlag: ["isArea", "isLine"],
        reverseSeries: !isStacked,
      },
    )

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
          ${clipPathId
            ? html`
                <defs>
                  <clipPath id=${clipPathId}>
                    <rect
                      x=${context.dimensions.padding.left}
                      y=${context.dimensions.padding.top}
                      width=${context.dimensions.width -
                      context.dimensions.padding.left -
                      context.dimensions.padding.right}
                      height=${context.dimensions.height -
                      context.dimensions.padding.top -
                      context.dimensions.padding.bottom}
                    />
                  </clipPath>
                </defs>
              `
            : ""}
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
  renderYAxis(entity, { config = {} } = {}, api) {
    const axisFn = (ctx) => {
      const { yScale, dimensions } = ctx
      return renderYAxis(
        ctx.entity || entity,
        { yScale, ...dimensions, ...config },
        api,
      )
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
  renderArea(entity, { config = {} }, api) {
    const areaFn = (ctx) => {
      const { xScale, yScale } = ctx
      const {
        dataKey,
        fill = "#8884d8",
        fillOpacity = "0.6",
        stroke,
        stackId,
        showDots = false,
        showTooltip = undefined,
      } = config
      const resolvedDataKey =
        dataKey ??
        (Array.isArray(config.data)
          ? inferSeriesDataKey(config.data, "area")
          : undefined)
      const baseEntity = ctx.entity || entity
      const dataEntity = Array.isArray(config.data)
        ? { ...baseEntity, data: config.data }
        : baseEntity
      const data = getTransformedData(dataEntity, resolvedDataKey)
      if (!data) return svg``

      const isStacked = Boolean(stackId) && Boolean(ctx.stack)
      let areaPath, linePath

      const scaleForSeries = xScale.bandwidth
        ? createBandCenterScale(xScale)
        : xScale
      const chartData = data.map((d, i) => ({
        ...d,
        x: xScale.bandwidth ? resolveCategoryLabel(dataEntity, i) : i,
      }))

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
        areaPath = generateStackedAreaPath(
          chartData,
          scaleForSeries,
          yScale,
          seriesStack,
        )
        linePath = generateLinePath(
          chartData.map((d, i) => ({ ...d, y: seriesStack[i][1] })),
          scaleForSeries,
          yScale,
        )
      } else {
        areaPath = generateAreaPath(chartData, scaleForSeries, yScale, 0)
        linePath = generateLinePath(chartData, scaleForSeries, yScale)
      }

      return svg`
        <g class="iw-chart-area">
          ${renderCurve({ d: areaPath, fill, fillOpacity })}
          ${linePath ? renderCurve({ d: linePath, stroke: stroke || fill }) : ""}
          ${
            showDots || showTooltip
              ? area.renderDots(
                  dataEntity,
                  {
                    config: {
                      ...config,
                      fill: stroke || fill,
                      showTooltip,
                    },
                  },
                  api,
                )(ctx)
              : ""
          }
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
      const resolvedDataKey =
        dataKey ??
        (Array.isArray(config.data)
          ? inferSeriesDataKey(config.data, "area")
          : undefined)
      const dataEntity = Array.isArray(config.data)
        ? { ...entityFromContext, data: config.data }
        : entityFromContext
      const data = getTransformedData(dataEntity, resolvedDataKey)
      const scaleForSeries = xScale.bandwidth
        ? createBandCenterScale(xScale)
        : xScale
      if (!data || data.length === 0) return svg``

      const seriesStack = ctx.stack?.computedByKey.get(
        `${config.stackId}:${dataKey}`,
      )

      return svg`
        <g class="iw-chart-dots">
          ${repeat(
            data,
            (d, i) => `${resolvedDataKey || "value"}-${i}`,
            (d, i) => {
              const x = scaleForSeries(
                xScale.bandwidth ? resolveCategoryLabel(dataEntity, i) : d.x,
              )
              const y = yScale(seriesStack ? seriesStack[i]?.[1] : d.y)
              // Get label from original data point (like line chart does)
              const originalDataPoint = dataEntity.data[i]
              const label =
                originalDataPoint?.name ||
                originalDataPoint?.label ||
                String(d.x)
              const value = seriesStack ? seriesStack[i]?.[1] : d.y

              const { onMouseEnter, onMouseLeave } = createTooltipHandlers({
                entity: entityFromContext,
                api: ctx.api || api,
                tooltipData: { label, value, color: fill },
                enabled:
                  config.showTooltip ??
                  (ctx.tooltipMode
                    ? ctx.tooltipMode === "all"
                    : ctx.tooltipEnabled),
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

function inferSeriesDataKey(data, preferredKey) {
  if (!Array.isArray(data) || data.length === 0) return undefined
  const sample = data[0]
  if (!sample || typeof sample !== "object") return undefined

  if (preferredKey && typeof sample[preferredKey] === "number") {
    return preferredKey
  }

  if (typeof sample.value === "number") return "value"
  if (typeof sample.y === "number") return "y"

  const numericKeys = Object.keys(sample).filter(
    (key) =>
      !["name", "label", "x", "date"].includes(key) &&
      typeof sample[key] === "number",
  )
  return numericKeys[0]
}

function resolveCategoryLabel(entity, index) {
  const item = entity?.data?.[index]
  return (
    item?.label ??
    item?.name ??
    item?.category ??
    item?.x ??
    item?.date ??
    String(index)
  )
}

function createBandCenterScale(bandScale) {
  const scale = (value) => {
    const base = bandScale(value)
    if (base == null || Number.isNaN(base)) return base
    return base + bandScale.bandwidth() / 2
  }
  scale.domain = () => bandScale.domain()
  scale.range = () => bandScale.range()
  return scale
}
