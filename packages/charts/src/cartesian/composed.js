import { html, svg } from "@inglorious/web"

import { renderTooltip } from "../component/tooltip.js"
import { sortChildrenByLayer } from "../utils/cartesian-renderer.js"
import { extractDataKeysFromChildren } from "../utils/extract-data-keys.js"
import { processDeclarativeChild } from "../utils/process-declarative-child.js"
import { ensureChartRuntimeId } from "../utils/runtime-id.js"
import { createSharedContext } from "../utils/shared-context.js"

const CARTESIAN_SERIES = new Set(["Line", "Area", "Bar"])
const DEFAULT_SERIES_INDEX = 0
const DEFAULT_SERIES_VALUE = 0
const DEFAULT_INDEX_STEP = 1

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
      .filter((child) => child && CARTESIAN_SERIES.has(child.type))
      .map((child) => child.type),
  )

  const hasBarSeries = seriesTypes.has("Bar")
  const hasAreaSeries = seriesTypes.has("Area")
  const hasLineSeries = seriesTypes.has("Line")
  const hasBrush = childrenArray.some((child) => child?.type === "Brush")

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

  const composedData = mergeComposedData(
    entityWithData.data,
    childrenArray.filter(
      (child) =>
        child &&
        CARTESIAN_SERIES.has(child.type) &&
        Array.isArray(child.config?.data),
    ),
  )
  const contextEntity =
    composedData.length > DEFAULT_SERIES_VALUE
      ? entityWithData.__inline
        ? Object.assign(entityWithData, { data: composedData })
        : { ...entityWithData, data: composedData }
      : entityWithData

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
      filteredEntity: contextEntity,
    },
    api,
  )
  context.api = api
  context.tooltipEnabled = tooltipEnabled
  context.tooltipMode = tooltipMode

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
    .map((child) =>
      processDeclarativeChild(child, contextEntity, inferredChartType, api),
    )
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

function inferSeriesDataKey(data, preferredKey) {
  if (!Array.isArray(data) || data.length === DEFAULT_SERIES_VALUE)
    return undefined
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
