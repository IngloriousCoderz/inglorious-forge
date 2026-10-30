/* eslint-disable no-magic-numbers */

import { svg } from "@inglorious/web"
import { when } from "@inglorious/web/directives/when"

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
import { renderScatterSeries } from "./renderers/cartesian/scatter.js"
import { renderBrush } from "./renderers/overlays/brush.js"
import { renderLegend } from "./renderers/overlays/legend.js"
import { renderTooltip } from "./renderers/overlays/tooltip.js"
import { renderCenterText, renderPieSeries } from "./renderers/polar/index.js"
import {
  renderPolarAngleAxis,
  renderPolarGrid,
  renderRadarSeries,
} from "./renderers/polar/radar.js"
import { renderRadialBars } from "./renderers/polar/radial.js"

export function renderFrame(frame) {
  const { entity, dimensions } = frame
  const orderedPrimitives = getRenderPrimitives(frame)

  return svg`
    <svg
      class="iw-chart"
      width=${dimensions.width}
      height=${dimensions.height}
      viewBox="0 0 ${dimensions.width} ${dimensions.height}"
      role="img"
      aria-label=${entity.ariaLabel || `${entity.type} chart`}
    >
      ${orderedPrimitives.map((primitive) => renderPrimitive(primitive, frame))}
      ${when(entity.centerText && isPolarChart(entity.type), () =>
        renderCenterText(frame),
      )}
      ${renderTooltip(frame)}
    </svg>
  `
}

function getRenderPrimitives(frame) {
  const orderedPrimitives = [...frame.primitives]
  const areaPrimitives = orderedPrimitives.filter(
    (primitive) => primitive.type === "area" && !primitive.props?.stackId,
  )

  if (areaPrimitives.length <= 1) {
    return orderedPrimitives
  }

  const sortedAreas = areaPrimitives
    .map((primitive) => ({
      primitive,
      peak: getAreaPeak(frame, primitive),
    }))
    .sort((a, b) => b.peak - a.peak)
    .map(({ primitive }) => primitive)
  let areaIndex = 0

  return orderedPrimitives.map((primitive) => {
    if (primitive.type !== "area" || primitive.props?.stackId) {
      return primitive
    }

    const nextPrimitive = sortedAreas[areaIndex]
    areaIndex += 1
    return nextPrimitive
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
  scatter: renderScatterSeries,
  "polar-grid": renderPolarGrid,
  "polar-angle-axis": renderPolarAngleAxis,
  radar: renderRadarSeries,
  "radial-bar": renderRadialBars,
  pie: renderPieSeries,
  legend: renderLegend,
  brush: renderBrush,
}

function renderPrimitive(primitive, frame) {
  const renderer = RENDERERS[primitive.type]

  return when(renderer, () => renderer(primitive, frame))
}

function isPolarChart(type) {
  return type === "pie" || type === "donut"
}

function getAreaPeak(frame, primitive) {
  const dataKey = primitive.props?.dataKey
  if (!dataKey || !Array.isArray(frame.entity.data)) return 0

  return Math.max(
    0,
    ...frame.entity.data.map((row) =>
      Number.isFinite(row?.[dataKey]) ? row[dataKey] : 0,
    ),
  )
}
