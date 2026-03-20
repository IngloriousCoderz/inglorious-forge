/* eslint-disable no-magic-numbers */
import { svg } from "@inglorious/web"

const TOOLTIP_WIDTH = 140
const TOOLTIP_HEIGHT = 60

export function renderTooltipOverlay(component, frame) {
  if (!frame.entity?.tooltipEnabled) return svg``

  const tooltip = frame.interactionEntity?.tooltip
  if (!tooltip) return svg``

  const { x, y, label, value, color } = tooltip
  const safeX = Number.isFinite(x) ? x : 0
  const safeY = Number.isFinite(y) ? y : 0

  return svg`
    <g class="iw-chart-modal" transform="translate(${safeX}, ${safeY})">
      <rect
        x="0"
        y="0"
        width=${TOOLTIP_WIDTH}
        height=${TOOLTIP_HEIGHT}
        rx="6"
        ry="6"
        fill="rgba(255, 255, 255, 0.95)"
        stroke="#cbd5e1"
      />
      <circle cx="12" cy="18" r="5" fill=${color || "#3b82f6"} />
      <text x="24" y="19" fill="#475569" font-size="12">${label ?? ""}</text>
      <text
        x="24"
        y="41"
        fill="#0f172a"
        font-size="14"
        font-weight="600"
      >
        ${value ?? ""}
      </text>
    </g>
  `
}
