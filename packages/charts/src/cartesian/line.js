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
  render(entity, api) {
    const type = api.getType(entity.type)
    const filteredData = entity.brush?.enabled
      ? getFilteredData(entity)
      : entity.data
    const entityWithFilteredData = { ...entity, data: filteredData }
    const children = buildChildrenFromConfig(entityWithFilteredData)

    return type.renderLineChart(
      entityWithFilteredData,
      {
        children,
        config: {
          width: entity.width,
          height: entity.height,
          originalEntity: entity,
        },
      },
      api,
    )
  },

  renderLineChart(entity, { children, config = {} }, api) {
    if (!entity) return svg`<text>Entity not found</text>`

    const entityForBrush = config.originalEntity || entity
    const entityWithData = { ...entity }

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

    const brush = entityForBrush.brush
    if (brush?.enabled && brush.startIndex !== undefined) {
      if (config.originalEntity) {
        // CONFIG MODE: Domain is fixed to the filtered data size
        context.xScale.domain([0, entity.data.length - 1])
      } else {
        // COMPOSITION MODE: Domain follows the Brush indices
        context.xScale.domain([brush.startIndex, brush.endIndex])
      }
    }

    context.dimensions = { width, height, padding }
    context.entity = entityWithData
    context.fullEntity = entityForBrush
    context.api = api

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

  renderCartesianGrid(entity, { config = {} }, api) {
    const gridFn = (ctx) => {
      const { xScale, yScale, dimensions } = ctx
      const [start, end] = xScale.domain()

      const ticks = []
      // Ensure grid only draws lines at actual data indices
      for (let i = Math.ceil(start); i <= Math.floor(end); i++) {
        ticks.push(i)
      }

      const customXScale = Object.assign(xScale.copy(), {
        ticks: () => ticks,
      })

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

  renderYAxis(entity, props, api) {
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

      // Absolute alignment: In Composition or Config mode, X is always
      // relative to the index of the array the component received
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
              // cx: xScale(i) ensures the dot aligns with the center of the tick/grid line
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

  renderTooltip: createTooltipComponent(),
  renderBrush: createBrushComponent(),
}

function buildChildrenFromConfig(entity) {
  const children = []
  if (entity.showGrid !== false)
    children.push(
      chart.CartesianGrid({ stroke: "#eee", strokeDasharray: "5 5" }),
    )

  let xAxisDataKey = entity.dataKey
  if (!xAxisDataKey && entity.data?.length > 0) {
    const first = entity.data[0]
    xAxisDataKey = first.name || first.x || first.date || "name"
  }
  children.push(chart.XAxis({ dataKey: xAxisDataKey || "name" }))
  children.push(chart.YAxis({ width: "auto" }))

  let dataKeys = []
  if (isMultiSeries(entity.data)) {
    dataKeys = entity.data.map((s, i) => s.dataKey || s.name || `series${i}`)
  } else if (entity.data?.length > 0) {
    const first = entity.data[0]
    dataKeys = Object.keys(first).filter(
      (k) => !["name", "x", "date"].includes(k) && typeof first[k] === "number",
    )
    if (dataKeys.length === 0)
      dataKeys = ["y", "value"].filter((k) => first[k] !== undefined)
    if (dataKeys.length === 0) dataKeys = ["value"]
  }

  const colors = entity.colors || ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"]
  dataKeys.forEach((key, i) => {
    children.push(
      chart.Line({
        dataKey: key,
        stroke: colors[i % colors.length],
        showDots: entity.showPoints !== false,
      }),
    )
  })

  if (entity.showTooltip !== false) children.push(chart.Tooltip({}))

  if (entity.showLegend === true) {
    children.push(
      chart.Legend({ dataKeys, labels: entity.labels || dataKeys, colors }),
    )
  }

  if (entity.brush?.enabled) {
    children.push(
      chart.Brush({
        dataKey: xAxisDataKey || "name",
        height: entity.brush.height || 30,
      }),
    )
  }

  return children
}
