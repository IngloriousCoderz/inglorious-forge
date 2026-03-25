/* eslint-disable no-magic-numbers */

import { svg } from "@inglorious/web"

export function renderSeriesTitles(component, frame) {
  if (!canShowTooltip(component, frame)) return ""

  const points = createSeriesPoints(component, frame)

  return svg`
    ${points.map(
      (point) => svg`
        <circle
          cx=${point.x}
          cy=${point.y}
          r="2"
          fill="transparent"
          pointer-events="all"
        >
          ${resolveTooltipTitle(
            frame.entity,
            component,
            point.row,
            component.props?.dataKey,
          )}
        </circle>
      `,
    )}
  `
}

export function createSeriesPoints(component, frame) {
  const { entity, scales } = frame
  const dataKey = component.props?.dataKey
  const stackId = component.props?.stackId
  const stackedKeys = stackId
    ? frame.components
        .filter(
          (item) => item.type === "area" && item.props?.stackId === stackId,
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
      x: getCategoryX(scales, label),
      y: scales.yScale(yValue),
      y0: stackId ? scales.yScale(previousStackValue) : scales.yScale(0),
    }
  })
}

export function resolveSeriesColor(frame, dataKey) {
  const plottedKeys = frame.scales.plottedKeys || frame.entity.seriesKeys
  const index = Math.max(0, plottedKeys.indexOf(dataKey))
  return frame.entity.colors[index % frame.entity.colors.length]
}

export function resolveTooltipTitle(entity, component, row, dataKey) {
  const enabled =
    entity.isTooltipEnabled || component.props?.hasTooltip === true
  if (!enabled) return ""

  const label = row?.[entity.xKey] ?? row?.label ?? row?.name ?? "item"
  const value = dataKey ? row?.[dataKey] : row?.value
  return svg`<title>${label}: ${value}</title>`
}

export function canShowTooltip(component, frame) {
  return Boolean(frame.entity?.isTooltipEnabled || component.props?.hasTooltip)
}

export function resolveLegendItems(component, frame) {
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

export function getBarGroupWidth(frame) {
  const { scales, dimensions, entity } = frame

  if (scales.xScaleMode === "band") {
    return scales.xScale.bandwidth()
  }

  if (typeof scales.xScale.step === "function") {
    return Math.max(12, scales.xScale.step() * 0.6)
  }

  return Math.max(12, dimensions.plotWidth / Math.max(1, entity.data.length))
}

export function getCategoryX(scales, label) {
  return bandCenter(scales.xScale(label), scales.xScale.bandwidth())
}

export function maximumValue(rows, dataKey) {
  return Math.max(
    ...rows.map((row) => (Number.isFinite(row?.[dataKey]) ? row[dataKey] : 0)),
  )
}

export function minimumValue(rows, dataKey) {
  return Math.min(
    ...rows.map((row) => (Number.isFinite(row?.[dataKey]) ? row[dataKey] : 0)),
  )
}

export function bandCenter(start, bandwidth) {
  return (start ?? 0) + bandwidth / 2
}
