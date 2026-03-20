/* eslint-disable no-magic-numbers */

import { svg } from "@inglorious/web"

import { CHART_TYPES, COMPONENT_TYPES } from "../constants.js"
import {
  renderCartesianGrid,
  renderXAxis,
  renderYAxis,
} from "./renderers/cartesian/axes.js"
import {
  renderAreaSeries,
  renderBarSeries,
  renderDots,
  renderLineSeries,
} from "./renderers/cartesian/index.js"
import { renderBrush } from "./renderers/overlays/brush.js"
import { renderLegend } from "./renderers/overlays/legend.js"
import { renderCenterText, renderPieSeries } from "./renderers/polar/index.js"

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

const RENDERERS = {
  [COMPONENT_TYPES.CARTESIAN_GRID]: renderCartesianGrid,
  [COMPONENT_TYPES.X_AXIS]: renderXAxis,
  [COMPONENT_TYPES.Y_AXIS]: renderYAxis,
  [COMPONENT_TYPES.LINE]: renderLineSeries,
  [COMPONENT_TYPES.AREA]: renderAreaSeries,
  [COMPONENT_TYPES.BAR]: renderBarSeries,
  [COMPONENT_TYPES.DOTS]: renderDots,
  [COMPONENT_TYPES.PIE]: renderPieSeries,
  [COMPONENT_TYPES.LEGEND]: renderLegend,
  [COMPONENT_TYPES.BRUSH]: renderBrush,
  [COMPONENT_TYPES.TOOLTIP]: () => svg``,
}

function renderComponent(component, frame) {
  const renderer = RENDERERS[component.type]

  return renderer ? renderer(component, frame) : svg``
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
