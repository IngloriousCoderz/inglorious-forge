/* eslint-disable no-magic-numbers */
import { html, svg } from "@inglorious/web"

import { renderTooltip } from "../component/tooltip.js"
import {
  DEFAULT_SERIES_INDEX,
  inferSeriesDataKey,
} from "../utils/cartesian-helpers.js"
import { sortChildrenByLayer } from "../utils/cartesian-renderer.js"
import { extractDataKeysFromChildren } from "../utils/extract-data-keys.js"
import { processDeclarativeChild } from "../utils/process-declarative-child.js"
import { ensureChartRuntimeId } from "../utils/runtime-id.js"
import { getFilteredData } from "../utils/scales.js"
import { createSharedContext } from "../utils/shared-context.js"
import { createTooltipMoveHandler } from "../utils/tooltip-handlers.js"

const CARTESIAN_SERIES = new Set(["Line", "Area", "Bar"])
const KIND_TO_TYPE = {
  area: "Area",
  bar: "Bar",
  line: "Line",
}
const DEFAULT_SERIES_VALUE = DEFAULT_SERIES_INDEX
const DEFAULT_INDEX_STEP = 1

export const composed = {
  render: renderComposedConfig,
}

export function renderComposedChart(entity, { children, config = {} }, api) {
  if (!entity) return svg`<text>Entity not found</text>`

  const entityWithData = config.data
    ? entity?.__inline
      ? Object.assign(entity, { data: config.data })
      : { ...entity, data: config.data }
    : entity
  const childrenArray = Array.isArray(children) ? children : [children]

  const seriesTypes = new Set(
    childrenArray
      .map((child) => {
        if (!child) return null
        if (child.type && CARTESIAN_SERIES.has(child.type)) return child.type
        if (typeof child === "function") {
          if (child.isBar) return "Bar"
          if (child.isArea) return "Area"
          if (child.isLine) return "Line"
        }
        return null
      })
      .filter(Boolean),
  )

  const hasBarSeries = seriesTypes.has("Bar")
  const hasAreaSeries = seriesTypes.has("Area")
  const hasLineSeries = seriesTypes.has("Line")
  const hasBrush = childrenArray.some(
    (child) => child?.type === "Brush" || child?.isBrush,
  )

  const inferredChartType = hasBarSeries
    ? "bar"
    : hasAreaSeries
      ? "area"
      : "line"

  let isStacked = config.stacked === true
  if (config.stacked === undefined && hasAreaSeries) {
    const hasStackId = childrenArray.some(
      (child) =>
        child &&
        child.type === "Area" &&
        child.config &&
        child.config.stackId !== undefined,
    )
    if (hasStackId) {
      isStacked = true
      config.stacked = true
    }
  }

  const dataKeysSet = new Set()
  if (config.dataKeys && Array.isArray(config.dataKeys)) {
    config.dataKeys.forEach((key) => dataKeysSet.add(key))
  } else if (childrenArray.length) {
    const autoDataKeys = extractDataKeysFromChildren(childrenArray)
    autoDataKeys.forEach((key) => dataKeysSet.add(key))
  }

  const baseEntity = entityWithData
  const seriesChildrenWithData = childrenArray.filter(
    (child) =>
      child &&
      CARTESIAN_SERIES.has(child.type) &&
      Array.isArray(child.config?.data),
  )
  const composedData =
    seriesChildrenWithData.length > DEFAULT_SERIES_VALUE
      ? mergeComposedData(entityWithData.data, seriesChildrenWithData)
      : entityWithData.data
  const contextEntity =
    composedData.length > DEFAULT_SERIES_VALUE
      ? entityWithData.__inline
        ? Object.assign(entityWithData, { data: composedData })
        : { ...entityWithData, data: composedData }
      : entityWithData

  const brushSource = config.originalEntity || baseEntity
  const brush = brushSource?.brush
  const shouldFilter =
    (inferredChartType === "line" || inferredChartType === "area") &&
    brush?.enabled &&
    !config.originalEntity
  const filteredEntity = shouldFilter
    ? { ...contextEntity, data: getFilteredData({ ...contextEntity, brush }) }
    : contextEntity

  const hasTooltip = childrenArray.some(
    (child) => child?.type === "Tooltip" || child?.type === "renderTooltip",
  )
  const hasSeriesTooltip = childrenArray.some(
    (child) => child?.config?.showTooltip === true,
  )
  const tooltipEnabled = hasTooltip || hasSeriesTooltip
  const tooltipMode = hasTooltip ? "all" : hasSeriesTooltip ? "series" : "none"

  if (tooltipEnabled) {
    if (contextEntity?.showTooltip === undefined) {
      contextEntity.showTooltip = true
    }
  } else if (contextEntity) {
    contextEntity.showTooltip = false
    contextEntity.tooltip = null
  }

  const context = createSharedContext(
    contextEntity,
    {
      width: config.width,
      height: config.height,
      padding: config.padding,
      chartType: inferredChartType,
      stacked: isStacked,
      usedDataKeys: dataKeysSet,
      filteredEntity,
    },
    api,
  )
  context.api = api
  context.tooltipEnabled = tooltipEnabled
  context.tooltipMode = tooltipMode
  context.fullEntity = brushSource
  context.indexOffset =
    shouldFilter && brush?.startIndex !== undefined
      ? brush.startIndex
      : DEFAULT_SERIES_INDEX
  context.indexEnd =
    shouldFilter && brush?.endIndex !== undefined ? brush.endIndex : undefined
  if (
    (inferredChartType === "line" || inferredChartType === "area") &&
    brush?.enabled &&
    brush.startIndex !== undefined
  ) {
    const endIndex =
      brush.endIndex ??
      Math.max(DEFAULT_SERIES_INDEX, brushSource.data.length - 1)
    if (config.originalEntity) {
      context.xScale.domain([
        DEFAULT_SERIES_INDEX,
        Math.max(DEFAULT_SERIES_INDEX, contextEntity.data.length - 1),
      ])
    } else {
      context.xScale.domain([brush.startIndex, endIndex])
    }
  }

  if (isStacked) {
    context.stack = {
      sumsByStackId: new Map(),
      computedByKey: new Map(),
    }
  }

  const clipPathId = hasLineSeries
    ? `chart-clip-${ensureChartRuntimeId(contextEntity)}`
    : null
  if (clipPathId) context.clipPathId = clipPathId

  const processedChildrenArray = childrenArray
    .map((child) => {
      const targetEntity =
        child && child.type === "Brush" ? context.fullEntity : contextEntity
      return processDeclarativeChild(
        child,
        targetEntity,
        inferredChartType,
        api,
      )
    })
    .filter(Boolean)

  const { orderedChildren } = sortChildrenByLayer(processedChildrenArray, {
    seriesFlag: ["isArea", "isBar", "isLine"],
    reverseSeries: false,
    includeBrush: hasBrush,
  })

  const barSeries = orderedChildren.filter(
    (child) => typeof child === "function" && child.isBar,
  )

  const finalRendered = orderedChildren.map((child) => {
    if (typeof child !== "function") return child
    if (child.isBar) {
      const barIndex = barSeries.indexOf(child)
      return child(context, barIndex, barSeries.length)
    }
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
        @mousemove=${tooltipEnabled
          ? createTooltipMoveHandler({ entity: contextEntity, api })
          : null}
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
      ${renderTooltip(contextEntity, {}, api)}
    </div>
  `
}

export function buildComposedChildren(entity) {
  const children = []
  if (!entity) return children

  if (entity.showGrid !== false) {
    children.push({
      type: "CartesianGrid",
      config: { stroke: "#eee", strokeDasharray: "5 5" },
    })
  }

  children.push({
    type: "XAxis",
    config: { dataKey: resolveXAxisDataKey(entity) },
  })
  children.push({ type: "YAxis", config: { width: "auto" } })

  const series = Array.isArray(entity.series) ? entity.series : []
  series.forEach((item) => {
    if (!item || typeof item !== "object") return
    const kind = (item.kind || item.type || "").toLowerCase()
    const type = KIND_TO_TYPE[kind]
    if (!type) return
    /* eslint-disable no-unused-vars */
    const { kind: _kind, type: _type, ...config } = item
    children.push({ type, config })
  })

  if (entity.showTooltip !== false) {
    children.push({ type: "Tooltip", config: {} })
  }

  if (entity.brush?.enabled && entity.brush?.visible !== false) {
    children.push({
      type: "Brush",
      config: {
        dataKey: resolveXAxisDataKey(entity),
        height: entity.brush.height || 30,
      },
    })
  }

  return children
}

function renderComposedConfig(entity, api) {
  if (!entity) return svg`<text>Entity not found</text>`
  const children = buildComposedChildren(entity)
  return renderComposedChart(
    entity,
    {
      children,
      config: {
        width: entity.width,
        height: entity.height,
        padding: entity.padding,
      },
    },
    api,
  )
}

function mergeComposedData(baseData, seriesChildren) {
  const merged = Array.isArray(baseData)
    ? baseData.map((item) => ({ ...item }))
    : []

  let maxLength = merged.length
  for (const child of seriesChildren) {
    const data = child?.config?.data
    if (Array.isArray(data)) {
      maxLength = Math.max(maxLength, data.length)
    }
  }

  if (maxLength === DEFAULT_SERIES_VALUE) return merged

  for (let i = merged.length; i < maxLength; i += DEFAULT_INDEX_STEP) {
    merged[i] = {}
  }

  for (const child of seriesChildren) {
    const data = child?.config?.data
    const dataKey =
      child?.config?.dataKey ??
      inferSeriesDataKey(data, child?.type?.toLowerCase())
    if (!Array.isArray(data) || !dataKey) continue

    data.forEach((point, index) => {
      const target = merged[index] || (merged[index] = {})
      if (target.name == null && point?.name != null) target.name = point.name
      if (target.label == null && point?.label != null)
        target.label = point.label
      if (target.x == null && point?.x != null) target.x = point.x
      if (target.date == null && point?.date != null) target.date = point.date

      const value =
        typeof point?.[dataKey] === "number"
          ? point[dataKey]
          : typeof point?.value === "number"
            ? point.value
            : typeof point?.y === "number"
              ? point.y
              : undefined
      if (typeof value === "number") {
        target[dataKey] = value
      }
    })
  }

  return merged
}

function resolveXAxisDataKey(entity) {
  let dataKey = entity?.dataKey
  if (!dataKey && Array.isArray(entity?.data) && entity.data.length > 0) {
    const firstItem = entity.data[0]
    dataKey = firstItem?.name || firstItem?.x || firstItem?.date || "name"
  }
  return dataKey || "name"
}
