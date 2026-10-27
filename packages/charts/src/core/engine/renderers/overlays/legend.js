/* eslint-disable no-magic-numbers */

import { svg } from "@inglorious/web"

import {
  LEGEND_ITEM_WIDTH,
  LEGEND_ROW_HEIGHT,
  legendItemsPerRow,
} from "../../../defaults.js"
import { themeColor } from "../../theme.js"
import { resolveLegendItems } from "../cartesian/shared.js"
import { getPieLegendItems } from "../polar/index.js"
import { getRadialLegendItems } from "../polar/radial.js"

export function renderLegend(primitive, frame) {
  const items = getLegendItems(primitive, frame)
  const startX = frame.dimensions.plotLeft
  const y = frame.dimensions.padding.top + 12
  const perRow = legendItemsPerRow(frame.dimensions.plotWidth)

  return svg`
    <g class="iw-chart-legend">
      ${items.map(
        (item, index) => svg`
          <g transform="translate(${startX + (index % perRow) * LEGEND_ITEM_WIDTH}, ${y + Math.floor(index / perRow) * LEGEND_ROW_HEIGHT})">
            <circle cx="0" cy="0" r="5" fill=${item.color} />
            <text
              x="12"
              y="4"
              style="fill: ${themeColor("text-muted", "#475569")}"
              font-size="12"
            >${item.label}</text>
          </g>
        `,
      )}
    </g>
  `
}

// A pie or radial chart names its rows; any other chart, its series.
function getLegendItems(primitive, frame) {
  const types = new Set(frame.primitives?.map((item) => item.type))
  if (types.has("pie")) return getPieLegendItems(frame)
  if (types.has("radial-bar")) return getRadialLegendItems(frame)
  return resolveLegendItems(primitive, frame)
}
