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

    // Apply data filtering if brush is enabled
    const entityData = entity.brush?.enabled
      ? getFilteredData({ ...entity, data: transformedData })
      : transformedData

    // Create entity with transformed and filtered data
    const entityWithData = {
      ...entity,
      data: entityData,
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

    // Use the unified motor (renderLineChart)
    // Pass original entity in config so brush can access unfiltered data
    return type.renderLineChart(
      entityWithData,
      {
        children,
        config: {
          width: entityWithData.width,
          height: entityWithData.height,
          dataKeys,
          originalEntity: { ...entity, data: transformedData },
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

    const entityForBrush = config.originalEntity || entity
    const entityWithData = { ...entity }

    // Collect data keys (used for scales and legends)
    const dataKeysSet = new Set()
    if (config.dataKeys && Array.isArray(config.dataKeys)) {
      config.dataKeys.forEach((key) => dataKeysSet.add(key))
    } else if (children) {
      const autoDataKeys = extractDataKeysFromChildren(children)
      autoDataKeys.forEach((key) => dataKeysSet.add(key))
    }

    const width = parseDimension(config.width || entity.width) || 800
    const height = parseDimension(config.height || entity.height) || 400
    const padding = calculatePadding(width, height)

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
      } else cat.others.push(child)
    }

    const processedChildren = [
      ...cat.grid,
      ...cat.lines,
      ...cat.axes,
      ...cat.dots,
      ...cat.tooltip,
      ...cat.legend,
      ...cat.brush,
      ...cat.others,
    ].map((child) => (typeof child === "function" ? child(context) : child))

    return html`
      <div
        class="iw-chart"
        style="display: block; position: relative; width: 100%; box-sizing: border-box;"
      >
        <svg
          width=${width}
          height=${height + (cat.brush.length ? 60 : 0)}
          viewBox="0 0 ${width} ${height + (cat.brush.length ? 60 : 0)}"
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
      const dataForLabels =
        ctx.fullEntity === ctx.entity ? ctx.entity.data : currentEntity.data
      const isTimeAxis =
        (config.xAxisType || currentEntity.xAxisType) === "time"

      const start = Math.ceil(viewStart)
      const end = Math.floor(viewEnd)
      const visibleCount = Math.max(1, end - start + 1)
      const availableWidth =
        (dimensions.width || 800) -
        (dimensions.padding?.left || 0) -
        (dimensions.padding?.right || 0)
      const maxTicks = Math.max(2, Math.floor(availableWidth / 110))
      const roughStep = Math.max(1, visibleCount / maxTicks)
      const step = getNiceStep(roughStep)

      let scaleTicks = []
      let labels = []
      if (isTimeAxis) {
        const timeTicks = buildTimeAxisTicks(
          dataForLabels,
          start,
          end,
          maxTicks,
          config.dataKey,
        )
        scaleTicks = timeTicks.ticks
        labels = timeTicks.labels
      } else {
        const rawTicks = []
        const anchoredStart = Math.ceil(start / step) * step
        for (let i = anchoredStart; i <= end; i += step) {
          rawTicks.push(i)
        }
        if (!rawTicks.length) {
          rawTicks.push(start)
        }
        if (
          rawTicks[rawTicks.length - 1] !== end &&
          end > rawTicks[rawTicks.length - 1]
        ) {
          rawTicks.push(end)
        }

        const rawLabels = rawTicks.map((tick) => {
          const item = dataForLabels[tick]
          return item?.[config.dataKey] || item?.name || item?.x || String(tick)
        })

        const compact = rawTicks.reduce(
          (acc, tick, index) => {
            const label = rawLabels[index]
            if (
              label === undefined ||
              label === null ||
              label === "" ||
              label === "\u00A0"
            ) {
              return acc
            }

            acc.ticks.push(tick)
            acc.labels.push(label)
            return acc
          },
          { ticks: [], labels: [] },
        )

        scaleTicks = compact.ticks.length ? compact.ticks : rawTicks
        labels = compact.labels.length ? compact.labels : rawLabels
      }

      if (!scaleTicks.length) {
        scaleTicks = [start, end].filter(
          (tick, idx, arr) => arr.indexOf(tick) === idx,
        )
        labels = scaleTicks.map((tick) => {
          const item = dataForLabels[tick]
          return item?.[config.dataKey] || item?.name || item?.x || String(tick)
        })
      }

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
        <g class="iw-chart-line-group" clip-path="url(#chart-clip-${e.id})">
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
        <g class="iw-chart-dots" clip-path="url(#chart-clip-${e.id})">
          ${repeat(
            data,
            (d, i) => `${dataKey}-${i}`,
            (d, i) => {
              const { onMouseEnter, onMouseLeave } = createTooltipHandlers({
                entity: e,
                api: ctx.api || api,
                tooltipData: { label: String(i), value: d.y, color: fill },
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

/**
 * Computes a stable, human-friendly tick step (1, 2, 5, 10, 20, 50, ...)
 * so ticks add/remove progressively while zooming.
 * @param {number} roughStep
 * @returns {number}
 */
function getNiceStep(roughStep) {
  if (!Number.isFinite(roughStep) || roughStep <= 1) return 1

  const exponent = Math.floor(Math.log10(roughStep))
  const base = 10 ** exponent
  const fraction = roughStep / base

  if (fraction <= 1) return base
  if (fraction <= 2) return 2 * base
  if (fraction <= 5) return 5 * base
  return 10 * base
}

function buildTimeAxisTicks(data, start, end, maxTicks, dataKey) {
  const getDate = (index) => {
    const item = data[index]
    const raw = item?.[dataKey] ?? item?.date ?? item?.name ?? item?.x
    const parsed = parseDateSafe(raw)
    return parsed
  }

  const firstDate = getDate(start)
  const lastDate = getDate(end)
  if (!firstDate || !lastDate) return { ticks: [], labels: [] }

  const rangeMs = lastDate.getTime() - firstDate.getTime()
  const granularity =
    rangeMs > 365 * 24 * 60 * 60 * 1000
      ? "month"
      : rangeMs > 90 * 24 * 60 * 60 * 1000
        ? "week"
        : "day"

  const ticks = []
  const labels = []
  let prevDate = null

  for (let i = start; i <= end; i += 1) {
    const currentDate = getDate(i)
    if (!currentDate) continue

    if (!prevDate || hasBoundaryChanged(prevDate, currentDate, granularity)) {
      ticks.push(i)
      labels.push(formatTimeLabel(currentDate, granularity))
      prevDate = currentDate
    }
  }

  if (!ticks.length || ticks[0] !== start) {
    const startDate = getDate(start)
    if (startDate) {
      ticks.unshift(start)
      labels.unshift(formatTimeLabel(startDate, granularity))
    }
  }

  if (ticks[ticks.length - 1] !== end) {
    const endDate = getDate(end)
    if (endDate) {
      ticks.push(end)
      labels.push(formatTimeLabel(endDate, granularity))
    }
  }

  if (ticks.length <= maxTicks) return { ticks, labels }

  const thinStep = Math.max(1, Math.ceil(ticks.length / maxTicks))
  const thinTicks = []
  const thinLabels = []

  for (let i = 0; i < ticks.length; i += thinStep) {
    thinTicks.push(ticks[i])
    thinLabels.push(labels[i])
  }

  if (thinTicks[thinTicks.length - 1] !== ticks[ticks.length - 1]) {
    thinTicks.push(ticks[ticks.length - 1])
    thinLabels.push(labels[labels.length - 1])
  }

  return { ticks: thinTicks, labels: thinLabels }
}

function parseDateSafe(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function hasBoundaryChanged(prevDate, currentDate, granularity) {
  if (granularity === "month") {
    return (
      prevDate.getUTCFullYear() !== currentDate.getUTCFullYear() ||
      prevDate.getUTCMonth() !== currentDate.getUTCMonth()
    )
  }

  if (granularity === "week") {
    return getUtcWeekKey(prevDate) !== getUtcWeekKey(currentDate)
  }

  return (
    prevDate.getUTCFullYear() !== currentDate.getUTCFullYear() ||
    prevDate.getUTCMonth() !== currentDate.getUTCMonth() ||
    prevDate.getUTCDate() !== currentDate.getUTCDate()
  )
}

function getUtcWeekKey(date) {
  const utc = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  )
  const day = utc.getUTCDay() || 7
  utc.setUTCDate(utc.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((utc - yearStart) / 86400000 + 1) / 7)
  return `${utc.getUTCFullYear()}-${weekNo}`
}

function formatTimeLabel(date, granularity) {
  const month = String(date.getUTCMonth() + 1)
  const day = String(date.getUTCDate())
  const year = String(date.getUTCFullYear())

  if (granularity === "month") {
    return `${month}/1/${year}`
  }

  return `${month}/${day}/${year}`
}

/**
 * Builds declarative children from entity config for renderChart (config style)
 * Converts entity configuration into children objects that renderLineChart can process
 * @param {import('../types/charts').ChartEntity} entity
 * @param {string[]} [providedDataKeys] - Optional dataKeys if already extracted (e.g., from multi-series before transformation)
 */
function buildChildrenFromConfig(entity, providedDataKeys = null) {
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

  // Extract dataKeys from entity data or use provided ones
  let dataKeys = providedDataKeys
  if (!dataKeys || dataKeys.length === 0) {
    if (isMultiSeries(entity.data)) {
      // Multi-series: use series names as dataKeys
      dataKeys = entity.data.map((series, idx) => {
        return series.dataKey || series.name || series.label || `series${idx}`
      })
    } else if (entity.data && entity.data.length > 0) {
      // Wide format: extract numeric keys
      const first = entity.data[0]
      dataKeys = Object.keys(first).filter(
        (key) =>
          !["name", "x", "date"].includes(key) &&
          typeof first[key] === "number",
      )
      if (dataKeys.length === 0) {
        dataKeys = ["y", "value"].filter((k) => first[k] !== undefined)
      }
      if (dataKeys.length === 0) {
        dataKeys = ["value"] // Default fallback
      }
    } else {
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
