/* eslint-disable no-magic-numbers */
import {
  DEFAULT_GRID_CONFIG,
  DEFAULT_Y_AXIS_CONFIG,
  PALETTE_DEFAULT,
} from "./constants.js"
import { isMultiSeries, resolveDataKeys } from "./data-utils.js"

export const DEFAULT_SERIES_INDEX = 0

export function inferSeriesDataKey(data, preferredKey) {
  if (!Array.isArray(data) || data.length === DEFAULT_SERIES_INDEX) {
    return undefined
  }
  const sample = data[DEFAULT_SERIES_INDEX]
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
  return numericKeys[DEFAULT_SERIES_INDEX]
}

export function resolveCategoryLabel(entity, index) {
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

export function createBandCenterScale(bandScale) {
  const scale = (value) => {
    const base = bandScale(value)
    if (base == null || Number.isNaN(base)) return base
    return base + bandScale.bandwidth() / 2
  }
  scale.domain = () => bandScale.domain()
  scale.range = () => bandScale.range()
  return scale
}

/**
 * Resolves the most appropriate entity from render context.
 * Prefers context-specific entity, then fullEntity (for brush / overlays),
 * and finally falls back to the original entity argument.
 *
 * @param {Record<string, any>} ctx
 * @param {import("../types/charts").ChartEntity} entity
 * @returns {import("../types/charts").ChartEntity | undefined}
 */
export function getResolvedEntity(ctx, entity) {
  if (!ctx) return entity
  if (ctx.entity) return ctx.entity
  if (ctx.fullEntity) return ctx.fullEntity
  return entity
}

export function resolveXAxisDataKey(entity) {
  let dataKey = entity?.dataKey
  if (!dataKey && Array.isArray(entity?.data) && entity.data.length > 0) {
    const firstItem = entity.data[0]
    dataKey = firstItem?.name || firstItem?.x || firstItem?.date || "name"
  }
  return dataKey || "name"
}

export function buildCartesianBaseChildren(
  entity,
  {
    makeChild = (type, config) => ({ type, config }),
    includeGrid = true,
    includeXAxis = true,
    includeYAxis = true,
    includeTooltip = true,
    includeBrush = true,
    gridConfig = DEFAULT_GRID_CONFIG,
    xAxisConfig = {},
    yAxisConfig = DEFAULT_Y_AXIS_CONFIG,
    tooltipConfig = {},
    brushConfig = {},
  } = {},
) {
  const children = []
  if (!entity) return children

  const xAxisDataKey = resolveXAxisDataKey(entity)

  if (includeGrid && entity.showGrid !== false) {
    children.push(makeChild("CartesianGrid", gridConfig))
  }

  if (includeXAxis) {
    children.push(makeChild("XAxis", { dataKey: xAxisDataKey, ...xAxisConfig }))
  }

  if (includeYAxis) {
    children.push(makeChild("YAxis", { ...yAxisConfig }))
  }

  if (includeTooltip && entity.showTooltip !== false) {
    children.push(makeChild("Tooltip", tooltipConfig))
  }

  if (
    includeBrush &&
    entity.brush?.enabled &&
    entity.brush?.visible !== false
  ) {
    children.push(
      makeChild("Brush", {
        dataKey: xAxisDataKey,
        height: entity.brush.height || 30,
        ...brushConfig,
      }),
    )
  }

  return children
}

/**
 * Converts long multi-series input into wide rows, reusing the x value as row key.
 * This keeps chart renderers working with one normalized data shape.
 *
 * @param {any[]} multiSeriesData
 * @returns {any[] | null}
 */
function transformSeriesToWide(multiSeriesData) {
  if (!isMultiSeries(multiSeriesData)) return null

  const dataMap = new Map()
  const seriesKeys = multiSeriesData.map((series) => {
    return series.dataKey || series.name || "series"
  })

  multiSeriesData.forEach((series, seriesIndex) => {
    const seriesKey = seriesKeys[seriesIndex]
    const values = Array.isArray(series.values) ? series.values : [series]

    values.forEach((point, pointIndex) => {
      const xValue = point?.x ?? pointIndex
      if (!dataMap.has(xValue)) {
        dataMap.set(xValue, { x: xValue, name: String(xValue) })
      }
      dataMap.get(xValue)[seriesKey] = point?.y ?? point?.value ?? 0
    })
  })

  return Array.from(dataMap.values()).sort((a, b) => {
    return typeof a.x === "number"
      ? a.x - b.x
      : String(a.x).localeCompare(String(b.x))
  })
}

/**
 * Creates declarative children from config-mode entity options.
 * This is shared by line and area renderers to keep the same defaults.
 *
 * @param {any} entity
 * @param {Object} options
 * @param {any} options.chartApi
 * @param {"line"|"area"} options.seriesType
 * @param {string[] | null} [options.providedDataKeys]
 * @returns {any[]}
 */
function buildCartesianChildrenFromConfig(
  entity,
  { chartApi, seriesType, providedDataKeys = null },
) {
  const children = buildCartesianBaseChildren(entity, {
    makeChild: (type, config) => chartApi[type](config),
    includeTooltip: false,
    includeBrush: false,
  })

  const dataKeys = providedDataKeys?.length
    ? providedDataKeys
    : resolveDataKeys(entity.data)

  const colors = entity.colors || PALETTE_DEFAULT
  const isStackedArea = seriesType === "area" && entity.stacked === true

  dataKeys.forEach((dataKey, index) => {
    if (seriesType === "line") {
      children.push(
        chartApi.Line({
          dataKey,
          stroke: colors[index % colors.length],
          showDots: entity.showPoints !== false,
        }),
      )
      return
    }

    children.push(
      chartApi.Area({
        dataKey,
        fill: colors[index % colors.length],
        fillOpacity: "0.6",
        stroke: colors[index % colors.length],
        stackId: isStackedArea ? "1" : undefined,
      }),
    )
  })

  if (entity.showPoints !== false && dataKeys.length > 0) {
    dataKeys.forEach((dataKey, index) => {
      children.push(
        chartApi.Dots({
          dataKey,
          fill: colors[index % colors.length],
          stackId: isStackedArea ? "1" : undefined,
        }),
      )
    })
  }

  if (entity.showTooltip !== false) {
    children.push(chartApi.Tooltip({}))
  }

  if (
    seriesType === "line" &&
    entity.showLegend &&
    isMultiSeries(entity.data)
  ) {
    children.push(
      chartApi.Legend({
        dataKeys,
        labels: entity.labels || dataKeys,
        colors: entity.colors,
      }),
    )
  }

  if (
    seriesType === "area" &&
    entity.showLegend === true &&
    dataKeys.length > 1
  ) {
    children.push(
      chartApi.Legend({
        dataKeys,
        colors: colors.slice(0, dataKeys.length),
      }),
    )
  }

  if (entity.brush?.enabled && entity.brush?.visible !== false) {
    children.push(
      chartApi.Brush({
        dataKey: resolveXAxisDataKey(entity),
        height: entity.brush.height || 30,
      }),
    )
  }

  return children
}

/**
 * Sorts processed child functions by render layer.
 * Grid goes first, then series, then axes, and overlays later.
 *
 * @param {any[]} processedChildren
 * @param {Object} options
 * @param {"isLine"|"isArea"} options.seriesFlag
 * @param {boolean} [options.reverseSeries=false]
 * @param {boolean} [options.includeBrush=false]
 * @returns {{ orderedChildren: any[], buckets: Record<string, any[]> }}
 */
export function sortChildrenByLayer(
  processedChildren,
  { seriesFlag, reverseSeries = false, includeBrush = false },
) {
  const seriesFlags = Array.isArray(seriesFlag) ? seriesFlag : [seriesFlag]
  const buckets = {
    grid: [],
    axes: [],
    series: [],
    dots: [],
    tooltip: [],
    legend: [],
    brush: [],
    others: [],
  }

  for (const child of processedChildren) {
    if (typeof child !== "function") {
      buckets.others.push(child)
      continue
    }
    if (child.isGrid) buckets.grid.push(child)
    else if (child.isAxis) buckets.axes.push(child)
    else if (seriesFlags.some((flag) => child[flag])) buckets.series.push(child)
    else if (child.isDots) buckets.dots.push(child)
    else if (child.isTooltip) buckets.tooltip.push(child)
    else if (child.isLegend) buckets.legend.push(child)
    else if (child.isBrush) buckets.brush.push(child)
    else buckets.others.push(child)
  }

  const orderedSeries = reverseSeries
    ? [...buckets.series].reverse()
    : buckets.series

  const orderedChildren = [
    ...buckets.grid,
    ...orderedSeries,
    ...buckets.axes,
    ...buckets.dots,
    ...buckets.tooltip,
    ...buckets.legend,
    ...(includeBrush ? buckets.brush : []),
    ...buckets.others,
  ]

  return { orderedChildren, buckets }
}

/**
 * Creates a config-mode renderer for cartesian charts.
 * It normalizes data, builds declarative children, and delegates to composition render.
 *
 * @param {Object} options
 * @param {"line"|"area"} options.seriesType
 * @param {any | (() => any)} options.chartApi
 * @param {(args: { entity: any; transformedData: any[] }) => any[]} [options.toDisplayData]
 * @param {(args: { entity: any; entityWithData: any; transformedData: any[]; dataKeys: string[] }) => Record<string, any>} options.buildRenderConfig
 * @param {(entity: any, params: any, api: any) => any} options.renderChart
 * @returns {(entity: any, api: any) => any}
 */
export function createCartesianRenderer({
  seriesType,
  chartApi,
  toDisplayData = ({ transformedData }) => transformedData,
  buildRenderConfig,
  renderChart,
}) {
  return function render(entity, api) {
    const resolvedChartApi =
      typeof chartApi === "function" ? chartApi() : chartApi

    let transformedData = entity.data
    let dataKeys = []

    if (isMultiSeries(entity.data)) {
      dataKeys = entity.data.map((series, index) => {
        return series.dataKey || series.name || series.label || `series${index}`
      })
      transformedData = transformSeriesToWide(entity.data)
    }

    const displayData = toDisplayData({ entity, transformedData })
    const entityWithData = {
      ...entity,
      data: displayData,
      dataKey:
        entity.dataKey ||
        (transformedData?.[0]?.x !== undefined ? "x" : "name"),
    }

    const children = buildCartesianChildrenFromConfig(entityWithData, {
      chartApi: resolvedChartApi,
      seriesType,
      providedDataKeys: dataKeys,
    })

    const resolvedDataKeys =
      dataKeys.length > 0 ? dataKeys : resolveDataKeys(entityWithData.data)

    return renderChart(
      entityWithData,
      {
        children,
        config: buildRenderConfig({
          entity,
          entityWithData,
          transformedData,
          dataKeys: resolvedDataKeys,
        }),
      },
      api,
    )
  }
}
