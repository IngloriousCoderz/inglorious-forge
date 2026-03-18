/* eslint-disable no-magic-numbers */

import { svg } from "@inglorious/web"
import { format } from "d3-format"
import {
  arc,
  area as createAreaPath,
  line as createLinePath,
  pie as createPieLayout,
} from "d3-shape"

import {
  CHART_TYPES,
  COMPONENT_TYPES,
  DEFAULT_DOT_RADIUS,
  DEFAULT_TICK_COUNT,
} from "./constants.js"

const formatTick = format(",")

export function renderFrame(frame) {
  const { entity, components, dimensions } = frame

  return svg`
    <svg
      class="iw-chart"
      width=${dimensions.width}
      height=${dimensions.height}
      viewBox="0 0 ${dimensions.width} ${dimensions.height}"
      role="img"
      aria-label=${entity.id}
    >
      ${components.map((component) => renderComponent(component, frame))}
      ${
        entity.centerText && isPolarChart(entity.type)
          ? renderCenterText(frame)
          : ""
      }
    </svg>
  `
}

function renderComponent(component, frame) {
  if (component.type === COMPONENT_TYPES.CARTESIAN_GRID) {
    return renderCartesianGrid(component, frame)
  }

  if (component.type === COMPONENT_TYPES.X_AXIS) {
    return renderXAxis(component, frame)
  }

  if (component.type === COMPONENT_TYPES.Y_AXIS) {
    return renderYAxis(component, frame)
  }

  if (component.type === COMPONENT_TYPES.LINE) {
    return renderLineSeries(component, frame)
  }

  if (component.type === COMPONENT_TYPES.AREA) {
    return renderAreaSeries(component, frame)
  }

  if (component.type === COMPONENT_TYPES.BAR) {
    return renderBarSeries(component, frame)
  }

  if (component.type === COMPONENT_TYPES.DOTS) {
    return renderDots(component, frame)
  }

  if (component.type === COMPONENT_TYPES.PIE) {
    return renderPieSeries(component, frame)
  }

  if (component.type === COMPONENT_TYPES.LEGEND) {
    return renderLegend(component, frame)
  }

  if (component.type === COMPONENT_TYPES.BRUSH) {
    return renderBrush(component, frame)
  }

  if (component.type === COMPONENT_TYPES.TOOLTIP) {
    return svg``
  }

  return svg``
}

function renderCartesianGrid(component, frame) {
  const { scales, dimensions } = frame
  const stroke = component.props?.stroke || "#e5e7eb"
  const dasharray = component.props?.strokeDasharray || "5 5"

  return svg`
    <g class="iw-chart-grid">
      ${scales.xScale.domain().map((label) => {
        const x = bandCenter(scales.xScale(label), scales.xScale.bandwidth())
        return svg`
          <line
            x1=${x}
            y1=${dimensions.plotTop}
            x2=${x}
            y2=${dimensions.plotBottom}
            stroke=${stroke}
            stroke-dasharray=${dasharray}
          />
        `
      })}
      ${scales.yScale.ticks(DEFAULT_TICK_COUNT).map((tick) => {
        const y = scales.yScale(tick)
        return svg`
          <line
            x1=${dimensions.plotLeft}
            y1=${y}
            x2=${dimensions.plotRight}
            y2=${y}
            stroke=${stroke}
            stroke-dasharray=${dasharray}
          />
        `
      })}
    </g>
  `
}

function renderXAxis(component, frame) {
  const { entity, scales, dimensions } = frame
  const dataKey = component.props?.dataKey || entity.xKey
  const labels = entity.data.map((row, index) => row?.[dataKey] ?? `${index}`)

  return svg`
    <g class="iw-chart-axis iw-chart-axis-x">
      <line
        x1=${dimensions.plotLeft}
        y1=${dimensions.plotBottom}
        x2=${dimensions.plotRight}
        y2=${dimensions.plotBottom}
        stroke="#cbd5e1"
      />
      ${labels.map((label, index) => {
        const domainValue = scales.xScale.domain()[index]
        const x = bandCenter(
          scales.xScale(domainValue),
          scales.xScale.bandwidth(),
        )
        return svg`
          <text
            x=${x}
            y=${dimensions.plotBottom + 24}
            fill="#64748b"
            font-size="12"
            text-anchor="middle"
          >
            ${label}
          </text>
        `
      })}
    </g>
  `
}

function renderYAxis(frameComponent, frame) {
  const { scales, dimensions } = frame
  void frameComponent

  return svg`
    <g class="iw-chart-axis iw-chart-axis-y">
      <line
        x1=${dimensions.plotLeft}
        y1=${dimensions.plotTop}
        x2=${dimensions.plotLeft}
        y2=${dimensions.plotBottom}
        stroke="#cbd5e1"
      />
      ${scales.yScale.ticks(DEFAULT_TICK_COUNT).map((tick) => {
        const y = scales.yScale(tick)
        return svg`
          <text
            x=${dimensions.plotLeft - 12}
            y=${y + 4}
            fill="#64748b"
            font-size="12"
            text-anchor="end"
          >
            ${formatTick(tick)}
          </text>
        `
      })}
    </g>
  `
}

function renderLineSeries(component, frame) {
  const { entity } = frame
  const dataKey = component.props?.dataKey
  const stroke = component.props?.stroke || resolveSeriesColor(frame, dataKey)
  const series = createSeriesPoints(component, frame)
  const linePath = createLinePath()
    .defined((point) => Number.isFinite(point.y))
    .x((point) => point.x)
    .y((point) => point.y)

  return svg`
    <g class="iw-chart-line">
      <path
        d=${linePath(series) || ""}
        fill="none"
        stroke=${stroke}
        stroke-width=${component.props?.strokeWidth || 3}
      />
      ${component.props?.showDots ? renderDots(component, frame) : ""}
      ${
        entity.tooltipEnabled && !component.props?.showDots
          ? renderSeriesTitles(component, frame)
          : ""
      }
    </g>
  `
}

function renderAreaSeries(component, frame) {
  const dataKey = component.props?.dataKey
  const fill = component.props?.fill || resolveSeriesColor(frame, dataKey)
  const stroke = component.props?.stroke || fill
  const fillOpacity = component.props?.fillOpacity ?? 0.3
  const series = createSeriesPoints(component, frame)
  const areaPath = createAreaPath()
    .defined((point) => Number.isFinite(point.y))
    .x((point) => point.x)
    .y0((point) => point.y0)
    .y1((point) => point.y)
  const linePath = createLinePath()
    .defined((point) => Number.isFinite(point.y))
    .x((point) => point.x)
    .y((point) => point.y)

  return svg`
    <g class="iw-chart-area">
      <path d=${areaPath(series) || ""} fill=${fill} fill-opacity=${fillOpacity} />
      <path
        d=${linePath(series) || ""}
        fill="none"
        stroke=${stroke}
        stroke-width=${component.props?.strokeWidth || 3}
      />
      ${component.props?.showDots ? renderDots(component, frame) : ""}
      ${
        frame.entity.tooltipEnabled && !component.props?.showDots
          ? renderSeriesTitles(component, frame)
          : ""
      }
    </g>
  `
}

function renderBarSeries(component, frame) {
  const { entity, scales, dimensions } = frame
  const barComponents = frame.components.filter(
    (item) => item.type === COMPONENT_TYPES.BAR,
  )
  const barIndex = barComponents.indexOf(component)
  const barWidth = Math.max(
    6,
    scales.xScale.bandwidth() / Math.max(1, barComponents.length),
  )
  const bandWidth = scales.xScale.bandwidth()
  const offset =
    (bandWidth - barWidth * barComponents.length) / 2 + barWidth * barIndex

  return svg`
    <g class="iw-chart-bar">
      ${entity.data.map((row, index) => {
        const label = `${row?.[entity.xKey] ?? index}`
        const value = Number.isFinite(row?.[component.props?.dataKey])
          ? row[component.props.dataKey]
          : 0
        const x = (scales.xScale(label) ?? dimensions.plotLeft) + offset
        const y = value >= 0 ? scales.yScale(value) : scales.yScale(0)
        const baseY = value >= 0 ? scales.yScale(0) : scales.yScale(value)
        const height = Math.abs(baseY - y)
        const fill =
          component.props?.fill ||
          resolveSeriesColor(frame, component.props?.dataKey)

        return svg`
          <rect
            x=${x}
            y=${Math.min(y, baseY)}
            width=${barWidth}
            height=${height}
            fill=${fill}
          >
            ${resolveTooltipTitle(frame.entity, component, row, component.props?.dataKey)}
          </rect>
        `
      })}
    </g>
  `
}

function renderDots(component, frame) {
  const series = createSeriesPoints(component, frame)
  const fill =
    component.props?.fill ||
    component.props?.stroke ||
    resolveSeriesColor(frame, component.props?.dataKey)
  const radius = component.props?.r || DEFAULT_DOT_RADIUS

  return svg`
    <g class="iw-chart-dots">
      ${series.map(
        (point) => svg`
        <circle cx=${point.x} cy=${point.y} r=${radius} fill=${fill}>
          ${resolveTooltipTitle(frame.entity, component, point.row, component.props?.dataKey)}
        </circle>
      `,
      )}
    </g>
  `
}

function renderPieSeries(component, frame) {
  const { entity, scales } = frame
  const dataKey = component.props?.dataKey || entity.dataKey
  const nameKey = component.props?.nameKey || entity.nameKey
  const layout = createPieLayout()
    .sort(null)
    .value((row) => row?.[dataKey] ?? 0)(entity.data)
  const createArc = arc()
    .innerRadius(scales.innerRadius)
    .outerRadius(scales.outerRadius)
  const labelArc = arc()
    .innerRadius((scales.innerRadius + scales.outerRadius) / 2)
    .outerRadius((scales.innerRadius + scales.outerRadius) / 2)

  return svg`
    <g
      class="iw-chart-pie"
      transform="translate(${scales.centerX}, ${scales.centerY})"
    >
      ${layout.map((slice, index) => {
        const fill =
          entity.data[index]?.color ||
          entity.colors[index % entity.colors.length]
        const label = entity.data[index]?.[nameKey] ?? entity.data[index]?.label
        const value = entity.data[index]?.[dataKey] ?? 0
        const [labelX, labelY] = labelArc.centroid(slice)

        return svg`
          <g>
            <path d=${createArc(slice) || ""} fill=${fill}>
              ${
                frame.entity.tooltipEnabled || component.props?.showTooltip
                  ? svg`<title>${label}: ${value}</title>`
                  : ""
              }
            </path>
            ${
              component.props?.label
                ? svg`
                  <text
                    x=${labelX}
                    y=${labelY}
                    fill="#0f172a"
                    font-size="12"
                    text-anchor="middle"
                  >
                    ${label}
                  </text>
                `
                : ""
            }
          </g>
        `
      })}
    </g>
  `
}

function renderLegend(component, frame) {
  const items = resolveLegendItems(component, frame)
  const startX = frame.dimensions.plotLeft
  const y = frame.dimensions.padding.top + 12

  return svg`
    <g class="iw-chart-legend">
      ${items.map(
        (item, index) => svg`
        <g transform="translate(${startX + index * 130}, ${y})">
          <circle cx="0" cy="0" r="5" fill=${item.color} />
          <text x="12" y="4" fill="#475569" font-size="12">${item.label}</text>
        </g>
      `,
      )}
    </g>
  `
}

function renderBrush(component, frame) {
  const { entity, dimensions } = frame
  if (!entity.brush?.enabled || !Array.isArray(entity.fullData)) return svg``

  const dataKey =
    component.props?.dataKey ||
    frame.scales.plottedKeys?.[0] ||
    entity.seriesKeys?.[0]

  if (!dataKey) return svg``

  const brushWidth = dimensions.plotWidth
  const brushHeight = component.props?.height || entity.brush.height || 30
  const xStep =
    entity.fullData.length > 1
      ? brushWidth / (entity.fullData.length - 1)
      : brushWidth
  const previewMin = minimumValue(entity.fullData, dataKey)
  const previewMax = maximumValue(entity.fullData, dataKey)
  const previewRange = previewMax - previewMin || 1
  const previewPath = createLinePath()
    .defined((point) => Number.isFinite(point.y))
    .x((point) => point.x)
    .y((point) => point.y)
  const previewPoints = entity.fullData.map((row, index) => ({
    x: dimensions.plotLeft + xStep * index,
    y:
      dimensions.brushTop +
      brushHeight -
      (((row?.[dataKey] ?? 0) - previewMin) / previewRange) * brushHeight,
  }))
  const startRatio =
    entity.fullData.length > 1
      ? entity.brush.startIndex / (entity.fullData.length - 1)
      : 0
  const endRatio =
    entity.fullData.length > 1
      ? entity.brush.endIndex / (entity.fullData.length - 1)
      : 1
  const selectionX = dimensions.plotLeft + brushWidth * startRatio
  const selectionWidth = Math.max(12, brushWidth * (endRatio - startRatio))

  return svg`
    <g class="iw-chart-brush">
      <rect
        x=${dimensions.plotLeft}
        y=${dimensions.brushTop}
        width=${brushWidth}
        height=${brushHeight}
        fill="#f8fafc"
        stroke="#cbd5e1"
      />
      <path
        d=${previewPath(previewPoints) || ""}
        fill="none"
        stroke="#94a3b8"
        stroke-width="1.5"
      />
      <rect
        x=${selectionX}
        y=${dimensions.brushTop}
        width=${selectionWidth}
        height=${brushHeight}
        fill="rgba(59, 130, 246, 0.16)"
        stroke="#3b82f6"
      />
    </g>
  `
}

function renderCenterText(frame) {
  return svg`
    <text
      x=${frame.scales.centerX}
      y=${frame.scales.centerY}
      text-anchor="middle"
      dominant-baseline="middle"
      fill="#0f172a"
      font-size="18"
      font-weight="600"
    >
      ${frame.entity.centerText}
    </text>
  `
}

function createSeriesPoints(component, frame) {
  const { entity, scales } = frame
  const dataKey = component.props?.dataKey
  const stackId = component.props?.stackId
  const stackedKeys = stackId
    ? frame.components
        .filter(
          (item) =>
            item.type === COMPONENT_TYPES.AREA &&
            item.props?.stackId === stackId,
        )
        .map((item) => item.props?.dataKey)
    : []
  const currentStackIndex = stackedKeys.indexOf(dataKey)

  return entity.data.map((row, index) => {
    const label = `${row?.[entity.xKey] ?? index}`
    const value = Number.isFinite(row?.[dataKey]) ? row[dataKey] : 0
    const previousStackValue =
      currentStackIndex > 0
        ? stackedKeys
            .slice(0, currentStackIndex)
            .reduce(
              (total, key) =>
                total + (Number.isFinite(row?.[key]) ? row[key] : 0),
              0,
            )
        : 0
    const stackedValue = previousStackValue + value
    const yValue = stackId ? stackedValue : value

    return {
      row,
      x: bandCenter(scales.xScale(label), scales.xScale.bandwidth()),
      y: scales.yScale(yValue),
      y0: stackId ? scales.yScale(previousStackValue) : scales.yScale(0),
    }
  })
}

function renderSeriesTitles(component, frame) {
  const points = createSeriesPoints(component, frame)

  return svg`
    ${points.map(
      (point) => svg`
      <circle cx=${point.x} cy=${point.y} r="0" fill="transparent">
        ${resolveTooltipTitle(frame.entity, component, point.row, component.props?.dataKey)}
      </circle>
    `,
    )}
  `
}

function resolveLegendItems(component, frame) {
  const dataKeys =
    component.props?.dataKeys ||
    frame.scales.plottedKeys ||
    frame.entity.seriesKeys

  return dataKeys.map((dataKey, index) => ({
    label: dataKey,
    color:
      component.props?.colors?.[index] ||
      resolveSeriesColor(frame, dataKey) ||
      frame.entity.colors[index % frame.entity.colors.length],
  }))
}

function resolveSeriesColor(frame, dataKey) {
  const plottedKeys = frame.scales.plottedKeys || frame.entity.seriesKeys
  const index = Math.max(0, plottedKeys.indexOf(dataKey))
  return frame.entity.colors[index % frame.entity.colors.length]
}

function resolveTooltipTitle(entity, component, row, dataKey) {
  const enabled = entity.tooltipEnabled || component.props?.showTooltip
  if (!enabled) return ""

  const label = row?.[entity.xKey] ?? row?.label ?? row?.name ?? "item"
  const value = dataKey ? row?.[dataKey] : row?.value
  return svg`<title>${label}: ${value}</title>`
}

function bandCenter(start, bandwidth) {
  return (start ?? 0) + bandwidth / 2
}

function maximumValue(rows, dataKey) {
  return Math.max(
    ...rows.map((row) => (Number.isFinite(row?.[dataKey]) ? row[dataKey] : 0)),
  )
}

function minimumValue(rows, dataKey) {
  return Math.min(
    ...rows.map((row) => (Number.isFinite(row?.[dataKey]) ? row[dataKey] : 0)),
  )
}

function isPolarChart(type) {
  return type === CHART_TYPES.PIE || type === CHART_TYPES.DONUT
}
