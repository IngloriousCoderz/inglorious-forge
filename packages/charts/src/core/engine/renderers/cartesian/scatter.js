import { svg } from "@inglorious/web"

import {
  canShowTooltip,
  formatTooltipValue,
  getTooltipBindings,
  resolveSeriesColor,
} from "./shared.js"

const POINT_OPACITY = 0.75

/** One series of a scatter chart: a circle per point, sized by its `z`. */
export function renderScatterSeries(primitive, frame) {
  const dataKey = primitive.props?.dataKey
  const series = findSeries(frame, dataKey)
  if (!series) return svg``

  const { scales } = frame
  const fill = primitive.props?.fill || resolveSeriesColor(frame, dataKey)

  return svg`
    <g class="iw-chart-scatter">
      ${series.points.map((point, index) => {
        const tooltip = getTooltipBindings(
          frame,
          primitive,
          { index, dataKey },
          getScatterTooltipText(frame, series.name, point),
        )
        return svg`
          <circle
            cx=${scales.xScale(point.x)}
            cy=${scales.yScale(point.y)}
            r=${primitive.props?.r ?? scales.zScale(point.z)}
            fill=${fill}
            fill-opacity=${primitive.props?.fillOpacity ?? POINT_OPACITY}
            pointer-events="all"
            style=${
              canShowTooltip(primitive, frame) ? "cursor: pointer;" : undefined
            }
            @mouseenter=${tooltip.onEnter}
            @mouseleave=${tooltip.onLeave}
          >
            ${tooltip.title}
          </circle>
        `
      })}
    </g>
  `
}

/** The tooltip of a hovered point: its series, and where it is. */
export function getScatterTooltip(frame, { index, dataKey }) {
  const series = findSeries(frame, dataKey)
  const point = series?.points[index]
  if (!point) return null

  const primitive = frame.primitives.find(
    (item) => item.type === "scatter" && item.props?.dataKey === dataKey,
  )
  return {
    anchor: {
      x: frame.scales.xScale(point.x),
      y: frame.scales.yScale(point.y),
    },
    color: primitive?.props?.fill || resolveSeriesColor(frame, dataKey),
    text: getScatterTooltipText(frame, series.name, point),
  }
}

function findSeries(frame, dataKey) {
  return frame.entity.data.find(({ name }) => name === dataKey)
}

function getScatterTooltipText(frame, name, { x, y, z }) {
  const values = [x, y, ...(z === undefined ? [] : [z])]
  return {
    label: name,
    value: values
      .map((value) => formatTooltipValue(frame, value, name))
      .join(", "),
  }
}
