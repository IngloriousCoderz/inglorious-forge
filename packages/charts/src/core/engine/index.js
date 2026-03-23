/* eslint-disable no-magic-numbers */

import { svg } from "@inglorious/web"

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
import { renderTooltipOverlay } from "./renderers/overlays/tooltip.js"
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
    (component) => component.type === "area" && !component.props?.stackId,
  )

  if (areaComponents.length <= 1) {
    return orderedComponents
  }

  // Precompute area peaks once to avoid recalculating them inside sort
  // comparator (which would otherwise call getAreaPeak many times).
  // Keeps the same ordering logic: larger peaks first.
  const sortedAreas = areaComponents
    .map((component) => ({
      component,
      peak: getAreaPeak(frame, component),
    }))
    .sort((a, b) => b.peak - a.peak)
    .map(({ component }) => component)
  let areaIndex = 0

  return orderedComponents.map((component) => {
    if (component.type !== "area" || component.props?.stackId) {
      return component
    }

    const nextComponent = sortedAreas[areaIndex]
    areaIndex += 1
    return nextComponent
  })
}

const RENDERERS = {
  "cartesian-grid": renderCartesianGrid,
  "x-axis": renderXAxis,
  "y-axis": renderYAxis,
  line: renderLineSeries,
  area: renderAreaSeries,
  bar: renderBarSeries,
  dots: renderDots,
  pie: renderPieSeries,
  legend: renderLegend,
  brush: renderBrush,
  tooltip: renderTooltipOverlay,
}

function renderComponent(component, frame) {
  const renderer = RENDERERS[component.type]

  return renderer ? renderer(component, frame) : svg``
}

function isPolarChart(type) {
  return type === "pie" || type === "donut"
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
