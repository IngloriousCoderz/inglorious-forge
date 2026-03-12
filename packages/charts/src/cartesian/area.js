/* eslint-disable no-magic-numbers */
import { svg } from "@inglorious/web"
import { repeat } from "@inglorious/web/directives/repeat"

import { createBrushComponent } from "../component/brush.js"
import { renderGrid } from "../component/grid.js"
import { renderLegend } from "../component/legend.js"
import { createTooltipComponent } from "../component/tooltip.js"
import { renderXAxis } from "../component/x-axis.js"
import { renderYAxis } from "../component/y-axis.js"
import { chart } from "../index.js"
import { renderCurve } from "../shape/curve.js"
import { renderDot } from "../shape/dot.js"
import {
  createBandCenterScale,
  inferSeriesDataKey,
  resolveCategoryLabel,
} from "../utils/cartesian-helpers.js"
import { createCartesianRenderer } from "../utils/cartesian-renderer.js"
import { getTransformedData } from "../utils/data-utils.js"
import {
  generateAreaPath,
  generateLinePath,
  generateStackedAreaPath,
} from "../utils/paths.js"
import { createTooltipHandlers } from "../utils/tooltip-handlers.js"
import { renderComposedChart } from "./composed.js"

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
  renderAreaChart(entity, { children, config = {} }, api) {
    return renderComposedChart(entity, { children, config }, api)
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
      const plotEntity = ctx.fullEntity || baseEntity
      const indexOffset = ctx.indexOffset ?? 0
      const indexEnd = ctx.indexEnd
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
        x: xScale.bandwidth
          ? resolveCategoryLabel(plotEntity, i + indexOffset)
          : i + indexOffset,
      }))

      const clippedChartData =
        typeof indexEnd === "number"
          ? chartData.filter((point) => point.x <= indexEnd)
          : chartData

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
          clippedChartData,
          scaleForSeries,
          yScale,
          seriesStack,
        )
        linePath = generateLinePath(
          clippedChartData.map((d, i) => ({ ...d, y: seriesStack[i][1] })),
          scaleForSeries,
          yScale,
        )
      } else {
        areaPath = generateAreaPath(clippedChartData, scaleForSeries, yScale, 0)
        linePath = generateLinePath(clippedChartData, scaleForSeries, yScale)
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
      const plotEntity = ctx.fullEntity || dataEntity
      const indexOffset = ctx.indexOffset ?? 0
      const indexEnd = ctx.indexEnd
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
              const resolvedIndex = i + indexOffset
              if (typeof indexEnd === "number" && resolvedIndex > indexEnd) {
                return svg``
              }
              const x = scaleForSeries(
                xScale.bandwidth
                  ? resolveCategoryLabel(plotEntity, resolvedIndex)
                  : resolvedIndex,
              )
              const y = yScale(seriesStack ? seriesStack[i]?.[1] : d.y)
              // Get label from original data point (like line chart does)
              const originalDataPoint = plotEntity.data[resolvedIndex]
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
