/* eslint-disable no-magic-numbers */

import { svg } from "@inglorious/web"

import { CHART_TYPES, COMPONENT_TYPES } from "../constants.js"
import {
  renderCartesianGrid,
  renderXAxis,
  renderYAxis,
} from "./renderers/axes.js"
import {
  renderAreaSeries,
  renderBarSeries,
  renderDots,
  renderLineSeries,
} from "./renderers/cartesian.js"
import { renderBrush, renderLegend } from "./renderers/overlays.js"
import { renderCenterText, renderPieSeries } from "./renderers/polar.js"

export function renderFrame(frame) {
  const { entity, dimensions } = frame
  const orderedComponents = getRenderComponents(frame)

  return svg`
    <svg
      class="iw-chart"
      width=${dimensions.width}
      height=${dimensions.height}
      viewBox="0 0 ${dimensions.width} ${dimensions.height}"
      role="img"
      aria-label=${entity.id}
    >
      ${orderedComponents.map((component) => renderComponent(component, frame))}
      ${
        entity.centerText && isPolarChart(entity.type)
          ? renderCenterText(frame)
          : ""
      }
    </svg>
  `
}

function getRenderComponents(frame) {
  const orderedComponents = [...frame.components]
  const areaComponents = orderedComponents.filter(
    (component) =>
      component.type === COMPONENT_TYPES.AREA && !component.props?.stackId,
  )

  if (areaComponents.length <= 1) {
    return orderedComponents
  }

  const sortedAreas = [...areaComponents].sort(
    (left, right) => getAreaPeak(frame, right) - getAreaPeak(frame, left),
  )
  let areaIndex = 0

  return orderedComponents.map((component) => {
    if (component.type !== COMPONENT_TYPES.AREA || component.props?.stackId) {
      return component
    }

    const nextComponent = sortedAreas[areaIndex]
    areaIndex += 1
    return nextComponent
  })
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

function isPolarChart(type) {
  return type === CHART_TYPES.PIE || type === CHART_TYPES.DONUT
}

function getAreaPeak(frame, component) {
  const dataKey = component.props?.dataKey
  if (!dataKey || !Array.isArray(frame.entity.data)) return 0

  return Math.max(
    0,
    ...frame.entity.data.map((row) =>
      Number.isFinite(row?.[dataKey]) ? row[dataKey] : 0,
    ),
  )
}
