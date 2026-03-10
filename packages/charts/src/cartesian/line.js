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
  createCartesianRenderer,
  sortChildrenByLayer,
} from "../utils/cartesian-renderer.js"
import { getTransformedData, parseDimension } from "../utils/data-utils.js"
import { extractDataKeysFromChildren } from "../utils/extract-data-keys.js"
import { generateLinePath } from "../utils/paths.js"
import { processDeclarativeChild } from "../utils/process-declarative-child.js"
import { ensureChartRuntimeId } from "../utils/runtime-id.js"
import { getFilteredData } from "../utils/scales.js"
import { createSharedContext } from "../utils/shared-context.js"
import {
  createTooltipHandlers,
  createTooltipMoveHandler,
} from "../utils/tooltip-handlers.js"

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
  renderLineChart(entity, params = {}, api) {
    if (!entity) return svg`<text>Entity not found</text>`
    const { children, ...config } = params

    const entityForBrush = config.originalEntity || entity
    const entityWithData = { ...entity }
    const clipPathId = ensureClipPathId(entityForBrush)

    // Collect data keys (used for scales and legends)
    const dataKeysSet = new Set()
    if (config.dataKeys && Array.isArray(config.dataKeys)) {
      config.dataKeys.forEach((key) => dataKeysSet.add(key))
    } else if (children) {
      const autoDataKeys = extractDataKeysFromChildren(children)
      autoDataKeys.forEach((key) => dataKeysSet.add(key))
    }

    const { width, height, padding } = resolveChartDimensions({
      configWidth: config.width,
      configHeight: config.height,
      configPadding: config.padding,
      entityWidth: entity.width,
      entityHeight: entity.height,
      entityPadding: entity.padding,
    })

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

    // Adjust domain for Brush
    const brush = entityForBrush.brush
    if (brush?.enabled && brush.startIndex !== undefined) {
      if (config.originalEntity) {
        context.xScale.domain([0, entity.data.length - 1])
      } else {
        context.xScale.domain([brush.startIndex, brush.endIndex])
      }
    }

    context.dimensions = { width, height, padding }
    context.entity = entityWithData
    context.fullEntity = entityForBrush
    context.api = api
    context.clipPathId = clipPathId

    // Process children (Grid, Line, XAxis, etc)
    const processedChildrenArray = (
      Array.isArray(children) ? children : [children]
    )
      .filter(Boolean)
      .map((child) => {
        const targetEntity =
          child && child.type === "Brush" ? entityForBrush : entityWithData
        return processDeclarativeChild(child, targetEntity, "line", api)
      })
      .filter(Boolean)

    const { orderedChildren, buckets } = sortChildrenByLayer(
      processedChildrenArray,
      {
        seriesFlag: "isLine",
        includeBrush: true,
      },
    )

    const processedChildren = orderedChildren.map((child) =>
      typeof child === "function" ? child(context) : child,
    )

    return html`
      <div
        class="iw-chart"
        style="display: block; position: relative; width: 100%; box-sizing: border-box;"
      >
        <svg
          width=${width}
          height=${height + (buckets.brush.length ? 60 : 0)}
          viewBox="0 0 ${width} ${height + (buckets.brush.length ? 60 : 0)}"
          @mousemove=${createTooltipMoveHandler({
            entity: entityWithData,
            api,
          })}
        >
          <defs>
            <clipPath id=${clipPathId}>
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
      const { xScale, yScale, entity: e } = ctx
      const {
        dataKey,
        stroke = "#8884d8",
        type = "linear",
        showDots = false,
      } = config
      const data = getTransformedData(e, dataKey)
      const chartData = data.map((d, i) => ({ ...d, x: i }))

      const path = generateLinePath(chartData, xScale, yScale, type)
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
      const { xScale, yScale, entity: e } = ctx
      const { dataKey, fill = "#8884d8", r = "0.25em" } = config
      const data = getTransformedData(e, dataKey)

      if (!data || data.length === 0) return svg``
      return svg`
        <g class="iw-chart-dots" clip-path="url(#${resolveClipPathId(ctx, e)})">
          ${repeat(
            data,
            (d, i) => `${dataKey}-${i}`,
            (d, i) => {
              const originalDataPoint = e.data?.[i]
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
              })
              return renderDot({
                cx: xScale(i),
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
        color: colors[i % colors.length] || "#8884d8",
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
