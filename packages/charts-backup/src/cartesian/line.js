/* eslint-disable no-magic-numbers */
import { repeat, svg } from "@inglorious/web"

import { chart } from "../index.js"
import { renderDot } from "../shape/dot.js"
import {
  createBandCenterScale,
  createCartesianRenderer,
  getResolvedEntity,
  inferSeriesDataKey,
  resolveCategoryLabel,
} from "../utils/cartesian-utils.js"
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
    renderChart: renderComposedChart,
  }),

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
