/* eslint-disable no-magic-numbers */

import { svg } from "@inglorious/web"
import { arc, pie as createPieLayout } from "d3-shape"

export function renderPieSeries(component, frame) {
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

export function renderCenterText(frame) {
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
