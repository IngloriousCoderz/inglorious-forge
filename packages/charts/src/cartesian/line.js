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
import { renderDot } from "../shape/dot.js"
import {
  createBandCenterScale,
  getResolvedEntity,
  inferSeriesDataKey,
  resolveCategoryLabel,
} from "../utils/cartesian-helpers.js"
import { createCartesianRenderer } from "../utils/cartesian-renderer.js"
import { PALETTE_DEFAULT } from "../utils/constants.js"
import { getTransformedData } from "../utils/data-utils.js"
import { generateLinePath } from "../utils/paths.js"
import { ensureChartRuntimeId } from "../utils/runtime-id.js"
import { getFilteredData } from "../utils/scales.js"
import { createTooltipHandlers } from "../utils/tooltip-handlers.js"
import { renderComposedChart } from "./composed.js"

export const line = {
  render: createCartesianRenderer({
    seriesType: "line",
    chartApi: () => chart,
    toDisplayData: ({ entity, transformedData }) =>
      entity.brush?.enabled
        ? getFilteredData({ ...entity, data: transformedData })
        : transformedData,
    buildRenderConfig: ({
      entity,
      entityWithData,
      transformedData,
      dataKeys,
    }) => ({
      width: entityWithData.width,
      height: entityWithData.height,
      dataKeys,
      originalEntity: { ...entity, data: transformedData },
    }),
  }),

  /**
   * Composition rendering entry point for line charts.
   * @param {import('../types/charts').ChartEntity} entity
   * @param {{ children: any[]|any, config?: Record<string, any> }} params
   * @param {import('@inglorious/web').Api} api
   * @returns {import('lit-html').TemplateResult}
   */
  renderLineChart(entity, { children, config = {} }, api) {
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
      const [start, end] = xScale.domain()
      const ticks = []
      for (let i = Math.ceil(start); i <= Math.floor(end); i++) {
        ticks.push(i)
      }

      const customXScale = Object.assign(xScale.copy(), { ticks: () => ticks })

      return renderGrid(
        ctx.entity,
        {
          ...dimensions,
          ...config,
          yScale,
          xScale: customXScale,
          ticks: ticks,
          customXTicks: ticks,
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
      const { xScale, yScale, dimensions, entity: currentEntity } = ctx
      const [viewStart, viewEnd] = xScale.domain()

      const scaleTicks = []
      for (let i = Math.ceil(viewStart); i <= Math.floor(viewEnd); i++) {
        scaleTicks.push(i)
      }

      const labels = scaleTicks.map((tick) => {
        const dataForLabels =
          ctx.fullEntity === ctx.entity ? ctx.entity.data : currentEntity.data
        const item = dataForLabels[tick]
        return item?.[config.dataKey] || item?.name || item?.x || String(tick)
      })

      const customXScaleForAxis = Object.assign(xScale.copy(), {
        ticks: () => scaleTicks,
      })

      return renderXAxis(
        { ...currentEntity, xLabels: labels },
        {
          ...dimensions,
          yScale,
          xScale: customXScaleForAxis,
          customTicks: scaleTicks,
          tickValues: scaleTicks,
          tickFormat: (d) => {
            const idx = Math.round(d)
            const labelIdx = scaleTicks.indexOf(idx)
            return labelIdx !== -1 ? labels[labelIdx] : ""
          },
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
  // eslint-disable-next-line no-unused-vars
  renderYAxis(entity, { config = {} }, api) {
    const axisFn = (ctx) => {
      const ticks = ctx.yScale.ticks ? ctx.yScale.ticks(5) : ctx.yScale.domain()
      return renderYAxis(
        ctx.entity,
        { yScale: ctx.yScale, customTicks: ticks, ...ctx.dimensions },
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
      const { xScale, yScale } = ctx
      const e = getResolvedEntity(ctx, entity)
      const {
        dataKey,
        stroke = PALETTE_DEFAULT[0],
        type = "linear",
        showDots = false,
      } = config
      const resolvedDataKey =
        dataKey ??
        (Array.isArray(config.data)
          ? inferSeriesDataKey(config.data, "line")
          : undefined)
      const dataEntity = Array.isArray(config.data)
        ? { ...e, data: config.data }
        : e
      const plotEntity = ctx.fullEntity || dataEntity
      const indexOffset = ctx.indexOffset ?? 0
      const indexEnd = ctx.indexEnd
      const data = getTransformedData(dataEntity, resolvedDataKey)
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

      const path = generateLinePath(
        clippedChartData,
        scaleForSeries,
        yScale,
        type,
      )
      if (!path || path.includes("NaN")) return svg``
      return svg`
        <g class="iw-chart-line-group" clip-path="url(#${resolveClipPathId(ctx, e)})">
          <path d="${path}" stroke="${stroke}" fill="none" stroke-width="2" />
          ${showDots ? line.renderDots(e, { config: { ...config, fill: stroke } }, api)(ctx) : ""}
        </g>`
    }
    lineFn.isLine = true
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
      const e = getResolvedEntity(ctx, entity)
      const { dataKey, fill = PALETTE_DEFAULT[0], r = "0.25em" } = config
      const resolvedDataKey =
        dataKey ??
        (Array.isArray(config.data)
          ? inferSeriesDataKey(config.data, "line")
          : undefined)
      const dataEntity = Array.isArray(config.data)
        ? { ...e, data: config.data }
        : e
      const plotEntity = ctx.fullEntity || dataEntity
      const indexOffset = ctx.indexOffset ?? 0
      const indexEnd = ctx.indexEnd
      const data = getTransformedData(dataEntity, resolvedDataKey)
      const scaleForSeries = xScale.bandwidth
        ? createBandCenterScale(xScale)
        : xScale

      if (!data || data.length === 0) return svg``
      return svg`
        <g class="iw-chart-dots" clip-path="url(#${resolveClipPathId(ctx, e)})">
          ${repeat(
            data,
            (d, i) => `${resolvedDataKey || "value"}-${i}`,
            (d, i) => {
              const resolvedIndex = i + indexOffset
              const originalDataPoint = plotEntity.data?.[resolvedIndex]
              const label =
                originalDataPoint?.name ??
                originalDataPoint?.label ??
                originalDataPoint?.x ??
                originalDataPoint?.date ??
                String(d.x)

              const { onMouseEnter, onMouseLeave } = createTooltipHandlers({
                entity: e,
                api: ctx.api || api,
                tooltipData: { label: String(label), value: d.y, color: fill },
                enabled:
                  config.showTooltip ??
                  (ctx.tooltipMode
                    ? ctx.tooltipMode === "all"
                    : ctx.tooltipEnabled),
              })
              if (typeof indexEnd === "number" && resolvedIndex > indexEnd) {
                return svg``
              }

              return renderDot({
                cx: scaleForSeries(
                  xScale.bandwidth
                    ? resolveCategoryLabel(plotEntity, resolvedIndex)
                    : resolvedIndex,
                ),
                cy: yScale(d.y),
                r,
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
   * Composition sub-render for legend.
   * @param {import('../types/charts').ChartEntity} entity
   * @param {{ config?: Record<string, any> }} params
   * @param {import('@inglorious/web').Api} api
   * @returns {(ctx: Record<string, any>) => import('lit-html').TemplateResult}
   */
  renderLegend: (entity, { config = {} }, api) => {
    const legendFn = (ctx) => {
      const { dataKeys = [], labels = [], colors = [] } = config
      const series = dataKeys.map((key, i) => ({
        name: labels[i] || key,
        color: colors[i % colors.length] || PALETTE_DEFAULT[0],
      }))
      return renderLegend(entity, { series, ...ctx.dimensions }, api)
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

function ensureClipPathId(entity) {
  return `chart-clip-${ensureChartRuntimeId(entity)}`
}

function resolveClipPathId(ctx, entity) {
  if (ctx.clipPathId) return ctx.clipPathId
  const clipPathId = ensureClipPathId(ctx.fullEntity || entity)
  ctx.clipPathId = clipPathId
  return clipPathId
}
