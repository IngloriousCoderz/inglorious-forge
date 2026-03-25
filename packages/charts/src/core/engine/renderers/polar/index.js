/* eslint-disable no-magic-numbers */

import { svg } from "@inglorious/web"
import { arc, pie as createPieLayout } from "d3-shape"

import { hideTooltip, showTooltip } from "../overlays/tooltip.js"

export function renderPieSeries(component, frame) {
  const { entity, scales } = frame
  const dataKey = component.props?.dataKey || entity.dataKey
  const nameKey = component.props?.nameKey || entity.nameKey
  const showLabel = component.props?.label
  const labelPosition = component.props?.labelPosition || "outside"
  const layout = createPieLayout()
    .sort(null)
    .value((row) => row?.[dataKey] ?? 0)(entity.data)
  const total = layout.reduce((sum, slice) => sum + (slice.value || 0), 0)
  const createArc = arc()
    .innerRadius(scales.innerRadius)
    .outerRadius(scales.outerRadius)
  const innerLabelArc = arc()
    .innerRadius((scales.innerRadius + scales.outerRadius) / 2)
    .outerRadius((scales.innerRadius + scales.outerRadius) / 2)
  const connectorArc = arc()
    .innerRadius(scales.outerRadius)
    .outerRadius(scales.outerRadius)
  const outerLabelArc = arc()
    .innerRadius(scales.outerRadius + 18)
    .outerRadius(scales.outerRadius + 18)

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
        const percentage = getSlicePercentage(value, total)
        const [insideLabelX, insideLabelY] = innerLabelArc.centroid(slice)
        const [connectorStartX, connectorStartY] = connectorArc.centroid(slice)
        const [connectorEndX, connectorEndY] = outerLabelArc.centroid(slice)
        const labelOffsetX = connectorEndX >= 0 ? 14 : -14
        const outsideLabelX = connectorEndX + labelOffsetX
        const outsideLabelY = connectorEndY
        const textAnchor = connectorEndX >= 0 ? "start" : "end"

        return svg`
          <g>
            <path d=${createArc(slice) || ""} fill=${fill}>
              ${
                !frame.entity.tooltipEnabled && component.props?.showTooltip
                  ? svg`<title>${label}: ${value}</title>`
                  : ""
              }
            </path>
            <path
              d=${createArc(slice) || ""}
              fill="transparent"
              pointer-events="all"
              style="cursor: pointer;"
              @mouseenter=${(event) =>
                updatePolarTooltip(event, frame, {
                  label,
                  value,
                  fill,
                  percentage,
                })}
              @mousemove=${(event) =>
                updatePolarTooltip(event, frame, {
                  label,
                  value,
                  fill,
                  percentage,
                })}
              @mouseleave=${(event) => clearPolarTooltip(frame, event)}
            />
            ${
              showLabel
                ? labelPosition === "inside"
                  ? svg`
                      <text
                        x=${insideLabelX}
                        y=${insideLabelY}
                        fill="#0f172a"
                        font-size="12"
                        text-anchor="middle"
                        dominant-baseline="middle"
                      >
                        ${
                          component.props?.showPercentage === false
                            ? label
                            : `${label} ${percentage}`
                        }
                      </text>
                    `
                  : svg`
                      <polyline
                        points=${`${connectorStartX},${connectorStartY} ${connectorEndX},${connectorEndY} ${outsideLabelX},${outsideLabelY}`}
                        fill="none"
                        stroke="#94a3b8"
                        stroke-width="1.5"
                      />
                      <text
                        x=${outsideLabelX}
                        y=${outsideLabelY}
                        fill="#0f172a"
                        font-size="12"
                        text-anchor=${textAnchor}
                        dominant-baseline="auto"
                      >
                        ${label}
                      </text>
                      ${
                        component.props?.showPercentage === false
                          ? ""
                          : svg`
                              <text
                                x=${outsideLabelX}
                                y=${outsideLabelY + 14}
                                fill="#64748b"
                                font-size="12"
                                text-anchor=${textAnchor}
                                dominant-baseline="auto"
                              >
                                ${percentage}
                              </text>
                            `
                      }
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

function updatePolarTooltip(event, frame, { label, fill, percentage }) {
  if (!frame.entity?.tooltipEnabled) return

  const svgEl = event.currentTarget?.closest?.("svg") || event.target
  const svgRect = svgEl?.getBoundingClientRect?.()
  if (!svgRect) return

  const relativeX = event.clientX - svgRect.left
  const relativeY = event.clientY - svgRect.top
  const offset = 15
  const x = Math.max(
    0,
    Math.min((frame.dimensions?.width ?? 0) - 140, relativeX + offset),
  )
  const y = Math.max(
    0,
    Math.min((frame.dimensions?.height ?? 0) - 56, relativeY - offset),
  )

  showTooltip(svgEl, x, y, label, percentage, fill)
}

function clearPolarTooltip(frame, event) {
  void frame
  hideTooltip(event?.currentTarget?.closest?.("svg"))
}

function getSlicePercentage(value, total) {
  if (!total) return "0%"
  return `${Math.round((value / total) * 100)}%`
}
