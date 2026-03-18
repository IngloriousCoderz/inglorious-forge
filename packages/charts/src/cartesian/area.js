/* eslint-disable no-magic-numbers */
import { repeat, svg } from "@inglorious/web"

import { chart } from "../index.js"
import { renderCurve } from "../shape/curve.js"
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
    renderChart: renderComposedChart,
  }),

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
        fill = PALETTE_DEFAULT[0],
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
      const baseEntity = getResolvedEntity(ctx, entity)
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
      const entityFromContext = getResolvedEntity(ctx, entity)
      const { dataKey, fill = PALETTE_DEFAULT[0] } = config
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
}
