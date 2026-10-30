/**
 * @typedef {import('../../../types/feedback/progress').ProgressProps} ProgressProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html, nothing } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"

/**
 * Renders a linear or circular progress indicator.
 * Indeterminate mode is used when no explicit value is provided.
 * The linear bar is a native `<progress>`; the circle, which no native element
 * draws, is an SVG with the same `progressbar` semantics.
 * @param {ProgressProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    variant = "linear",
    value,
    size = 40,
    thickness = 4,
    color = "default",
    ariaLabel,
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
        [`iw-progress-${color}`]: true,
        "iw-progress-indeterminate": progress == null,
        ...extraClasses,
      })}
      style=${`width: ${size}px; height: ${size}px;`}
      role="progressbar"
      aria-label=${ariaLabel || nothing}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow=${progress ?? nothing}
    >
      <svg aria-hidden="true" viewBox="0 0 ${size} ${size}">
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

  return html`<progress
    class=${classMap({
      "iw-progress": true,
      "iw-progress-linear": true,
      [`iw-progress-${color}`]: true,
      "iw-progress-indeterminate": progress == null,
      ...extraClasses,
    })}
    max="100"
    value=${progress ?? nothing}
    aria-label=${ariaLabel || nothing}
  ></progress>`
}

function clamp(value) {
  return Math.max(0, Math.min(100, value))
}
