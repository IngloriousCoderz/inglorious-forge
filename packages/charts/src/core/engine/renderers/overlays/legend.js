/* eslint-disable no-magic-numbers */

import { svg } from "@inglorious/web"

import { resolveLegendItems } from "../cartesian/shared.js"

export function renderLegend(component, frame) {
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
