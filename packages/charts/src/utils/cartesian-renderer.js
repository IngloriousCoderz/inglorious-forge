/* eslint-disable no-magic-numbers */
import {
  buildCartesianBaseChildren,
  resolveXAxisDataKey,
} from "./cartesian-children.js"
import { PALETTE_DEFAULT } from "./constants.js"
import { isMultiSeries, resolveDataKeys } from "./data-utils.js"

/**
 * Converts long multi-series input into wide rows, reusing the x value as row key.
 * This keeps chart renderers working with one normalized data shape.
 *
 * @param {any[]} multiSeriesData
 * @returns {any[] | null}
 */
export function transformSeriesToWide(multiSeriesData) {
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
export function buildCartesianChildrenFromConfig(
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
 * @returns {(entity: any, api: any) => any}
 */
export function createCartesianRenderer({
  seriesType,
  chartApi,
  toDisplayData = ({ transformedData }) => transformedData,
  buildRenderConfig,
}) {
  const renderMethod = getRenderMethod(seriesType)

  return function render(entity, api) {
    const type = api.getType(entity.type)
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

    return type[renderMethod](
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

function getRenderMethod(seriesType) {
  return seriesType === "area" ? "renderAreaChart" : "renderLineChart"
}
