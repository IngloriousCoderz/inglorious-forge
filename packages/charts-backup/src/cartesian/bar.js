/* eslint-disable no-magic-numbers */
import { svg } from "@inglorious/web"
import { scaleBand } from "d3-scale"

import { chart } from "../index.js"
import { renderRectangle } from "../shape/rectangle.js"
import {
  buildCartesianBaseChildren,
  getResolvedEntity,
  inferSeriesDataKey,
} from "../utils/cartesian-utils.js"
import { PALETTE_DEFAULT } from "../utils/constants.js"
import { createTooltipHandlers } from "../utils/tooltip-handlers.js"
import { renderComposedChart } from "./composed.js"

export const bar = {
  /**
   * Config-based rendering entry point.
   * Builds default composition children from entity options and delegates to
   * composed rendering.
   * @param {import('../types/charts').ChartEntity} entity
   * @param {import('@inglorious/web').Api} api
   * @returns {import('lit-html').TemplateResult}
   */
  render(entity, api) {
    const children = buildCartesianBaseChildren(entity, {
      makeChild: (typeKey, config) => chart[typeKey](config),
    })
    children.push(chart.Bar({ dataKey: "value", multiColor: false }))

    return renderComposedChart(
      entity,
      {
        children,
        config: {
          width: entity.width,
          height: entity.height,
        },
      },
      api,
    )
  },

  /**
   * Composition sub-render for bars.
   * @param {import('../types/charts').ChartEntity} entity
   * @param {{ config?: Record<string, any> }} params
   * @param {import('@inglorious/web').Api} api
   * @returns {(ctx: Record<string, any>, barIndex: number, totalBars: number) => import('lit-html').TemplateResult}
   */
  renderBar(entity, { config = {} }, api) {
    // Preserve config values in closure
    const { dataKey, fill, multiColor = false } = config
    const resolvedDataKey =
      dataKey ??
      (Array.isArray(config.data)
        ? inferSeriesDataKey(config.data, "bar")
        : "value")
    const drawFn = (ctx, barIndex, totalBars) => {
      const entityFromContext = getResolvedEntity(ctx, entity)
      if (!entityFromContext) return svg``
      const dataSource = Array.isArray(config.data)
        ? config.data
        : entityFromContext.data
      const entityColors = entityFromContext.colors || PALETTE_DEFAULT
      const { xScale, yScale, dimensions } = ctx

      // When there's only one bar, center it in the band without using subScale
      let barWidth, xOffset
      if (totalBars === 1) {
        // Single bar: occupies 80% of the band and is centered
        const bandwidth = xScale.bandwidth()
        barWidth = bandwidth * 0.8
        xOffset = (bandwidth - barWidth) / 2 // Center
      } else {
        // Multiple bars: use subScale to group them
        const subScale = scaleBand()
          .domain(Array.from({ length: totalBars }, (_, i) => i))
          .range([0, xScale.bandwidth()])
          .padding(0.1)
        barWidth = subScale.bandwidth()
        xOffset = subScale(barIndex)
      }

      return svg`
        ${dataSource.map((d, i) => {
          const category = d.label || d.name || d.category
          const label = category ?? String(i)
          const value = d[resolvedDataKey] ?? 0
          const bandStart = xScale(category)

          // Skip if bandStart is undefined or NaN (invalid category)
          if (bandStart == null || isNaN(bandStart)) {
            return svg``
          }

          const x = bandStart + xOffset
          const y = yScale(value)

          // Calculate bar height: distance from top (y) to bottom of chart area
          const chartBottom = dimensions.height - dimensions.padding.bottom
          const barHeight = Math.max(0, chartBottom - y)

          // Skip if bar has no height or invalid dimensions
          if (barHeight <= 0 || isNaN(barHeight) || isNaN(x) || isNaN(y)) {
            return svg``
          }

          const color = multiColor
            ? d.color || entityColors[i % entityColors.length]
            : fill || d.color || entityColors[barIndex % entityColors.length]

          const { onMouseEnter, onMouseLeave } = createTooltipHandlers({
            entity: entityFromContext,
            api,
            tooltipData: { label, value, color },
            enabled:
              config.showTooltip ??
              (ctx.tooltipMode
                ? ctx.tooltipMode === "all"
                : ctx.tooltipEnabled),
          })
          return renderRectangle({
            x,
            y,
            width: barWidth,
            height: barHeight,
            fill: color,
            onMouseEnter,
            onMouseLeave,
          })
        })}
      `
    }

    drawFn.isBar = true
    drawFn.dataKey = resolvedDataKey || "value"
    return drawFn
  },
}
