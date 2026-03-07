/**
 * @typedef {import('../../../types/feedback/progress').ProgressProps} ProgressProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html } from "@inglorious/web"

function clamp(value) {
  return Math.max(0, Math.min(100, value))
}

/**
 * @param {ProgressProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    variant = "linear",
    value,
    size = 40,
    thickness = 4,
    className = "",
  } = props

  const extraClasses = Object.fromEntries(
    className
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => [name, true]),
  )

  if (variant === "circular") {
    const radius = (size - thickness) / 2
    const circumference = 2 * Math.PI * radius
    const progress = value == null ? null : clamp(value)
    const dashOffset =
      progress == null ? null : circumference * (1 - progress / 100)

    return html`<div
      class=${classMap({
        "iw-progress": true,
        "iw-progress-circular": true,
        "iw-progress-indeterminate": progress == null,
        ...extraClasses,
      })}
      style=${`width: ${size}px; height: ${size}px;`}
    >
      <svg viewBox="0 0 ${size} ${size}">
        <circle
          class="iw-progress-track"
          cx=${size / 2}
          cy=${size / 2}
          r=${radius}
          stroke-width=${thickness}
        ></circle>
        <circle
          class="iw-progress-value"
          cx=${size / 2}
          cy=${size / 2}
          r=${radius}
          stroke-width=${thickness}
          stroke-dasharray=${circumference}
          stroke-dashoffset=${dashOffset ?? circumference * 0.75}
        ></circle>
      </svg>
    </div>`
  }

  const progress = value == null ? null : clamp(value)

  return html`<div
    class=${classMap({
      "iw-progress": true,
      "iw-progress-linear": true,
      "iw-progress-indeterminate": progress == null,
      ...extraClasses,
    })}
  >
    <div class="iw-progress-linear-track">
      <div
        class="iw-progress-linear-bar"
        style=${progress == null ? "" : `width: ${progress}%;`}
      ></div>
    </div>
  </div>`
}
