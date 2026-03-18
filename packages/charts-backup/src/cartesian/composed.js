/* eslint-disable no-magic-numbers */
import { html, svg } from "@inglorious/web"

import { createBrushComponent } from "../component/brush.js"
import { renderGrid } from "../component/grid.js"
import { renderLegend } from "../component/legend.js"
import { createTooltipComponent, renderTooltip } from "../component/tooltip.js"
import { renderXAxis } from "../component/x-axis.js"
import { renderYAxis } from "../component/y-axis.js"
import {
  buildCartesianBaseChildren,
  DEFAULT_SERIES_INDEX,
  getResolvedEntity,
  inferSeriesDataKey,
  resolveXAxisDataKey,
  sortChildrenByLayer,
} from "../utils/cartesian-utils.js"
import { DEFAULT_GRID_CONFIG, PALETTE_DEFAULT } from "../utils/constants.js"
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

  /**
   * Composition sub-render for cartesian grid (shared for line/area/bar).
   */
  renderCartesianGrid(entity, { config = {} }, api) {
    const gridFn = (ctx) => {
      return renderCartesianGrid(ctx, entity, config, api)
    }
    gridFn.isGrid = true
    return gridFn
  },

  /**
   * Composition sub-render for X axis (shared for line/area/bar).
   */
  renderXAxis(entity, { config = {} }, api) {
    const axisFn = (ctx) => {
      return renderCartesianXAxis(ctx, entity, config, api)
    }
    axisFn.isAxis = true
    return axisFn
  },

  /**
   * Composition sub-render for Y axis (shared for line/area/bar).
   */
  renderYAxis(entity, { config = {} }, api) {
    const axisFn = (ctx) => {
      return renderCartesianYAxis(ctx, entity, config, api)
    }
    axisFn.isAxis = true
    return axisFn
  },

  /**
   * Composition sub-render for tooltip overlay.
   */
  renderTooltip: createTooltipComponent(),

  /**
   * Composition sub-render for brush control.
   */
  renderBrush: createBrushComponent(),

  /**
   * Composition sub-render for legend.
   */
  renderLegend(entity, { config = {} }, api) {
    const legendFn = (ctx) => {
      const { dataKeys = [], labels = [], colors = [] } = config
      if (!dataKeys.length) return svg``

      const series = dataKeys.map((key, i) => ({
        name: labels[i] || key,
        color: colors[i % colors.length] || PALETTE_DEFAULT[0],
      }))

      return renderLegend(
        getResolvedEntity(ctx, entity),
        { series, ...ctx.dimensions },
        api,
      )
    }
    legendFn.isLegend = true
    return legendFn
  },
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
    // For area charts, render higher-value series first so lower ones stay visible on top
    reverseSeries: inferredChartType === "area",
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

function renderCartesianGrid(ctx, entity, config, api) {
  const { xScale, yScale, dimensions } = ctx
  const resolvedEntity = getResolvedEntity(ctx, entity)
  const mergedConfig = { ...DEFAULT_GRID_CONFIG, ...config }

  if (!xScale?.bandwidth && ctx.chartType === "line") {
    const [start, end] = xScale.domain()
    const ticks = []
    for (let i = Math.ceil(start); i <= Math.floor(end); i++) {
      ticks.push(i)
    }

    const customXScale = Object.assign(xScale.copy(), {
      ticks: () => ticks,
    })

    return renderGrid(
      resolvedEntity,
      {
        ...dimensions,
        ...mergedConfig,
        yScale,
        xScale: customXScale,
        ticks,
        customXTicks: ticks,
      },
      api,
    )
  }

  return renderGrid(
    resolvedEntity,
    { xScale, yScale, ...dimensions, ...mergedConfig },
    api,
  )
}

function renderCartesianXAxis(ctx, entity, config, api) {
  const { xScale, yScale, dimensions } = ctx
  const resolvedEntity = getResolvedEntity(ctx, entity)

  if (!xScale?.bandwidth && ctx.chartType === "line") {
    const [viewStart, viewEnd] = xScale.domain()
    const scaleTicks = []
    for (let i = Math.ceil(viewStart); i <= Math.floor(viewEnd); i++) {
      scaleTicks.push(i)
    }

    const labels = scaleTicks.map((tick) => {
      const dataForLabels =
        ctx.fullEntity === ctx.entity ? ctx.entity.data : resolvedEntity.data
      const item = dataForLabels[tick]
      return item?.[config.dataKey] || item?.name || item?.x || String(tick)
    })

    const customXScaleForAxis = Object.assign(xScale.copy(), {
      ticks: () => scaleTicks,
    })

    return renderXAxis(
      { ...resolvedEntity, xLabels: labels },
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

  if (ctx.chartType === "area" && config.dataKey) {
    const labels = resolvedEntity.data.map(
      (d, i) => d[config.dataKey] || d.name || String(i),
    )
    return renderXAxis(
      { ...resolvedEntity, xLabels: labels },
      { xScale, yScale, ...dimensions },
      api,
    )
  }

  return renderXAxis(resolvedEntity, { xScale, yScale, ...dimensions }, api)
}

function renderCartesianYAxis(ctx, entity, config, api) {
  const resolvedEntity = getResolvedEntity(ctx, entity)
  const ticks = ctx.yScale.ticks ? ctx.yScale.ticks(5) : ctx.yScale.domain()

  if (ctx.chartType === "area") {
    return renderYAxis(
      resolvedEntity,
      { yScale: ctx.yScale, ...ctx.dimensions, ...config },
      api,
    )
  }

  return renderYAxis(
    resolvedEntity,
    { yScale: ctx.yScale, customTicks: ticks, ...ctx.dimensions },
    api,
  )
}

export function buildComposedChildren(entity) {
  const children = buildCartesianBaseChildren(entity, {
    includeTooltip: false,
    includeBrush: false,
  })

  const series = Array.isArray(entity.series) ? entity.series : []
  series.forEach((item) => {
    if (!item || typeof item !== "object") return
    const kind = (item.kind || item.type || "").toLowerCase()
    const type = KIND_TO_TYPE[kind]
    if (!type) return
    // eslint-disable-next-line no-unused-vars
    const { kind: kindValue, type: typeValue, ...config } = item
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
