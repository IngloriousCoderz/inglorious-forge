/**
 * @typedef {import('../../../types/controls/slider').SliderProps} SliderProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html, nothing } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { ref } from "@inglorious/web/directives/ref"

import { applyElementProps } from "../../shared/apply-element-props.js"
import { fallbackLabel } from "../../shared/fallback-label.js"

const DEFAULT_VALUE = 0
const DEFAULT_MIN = 0
const DEFAULT_MAX = 100
const DEFAULT_STEP = 1
const PERCENT = 100
/** Past this many steps, marks would be a smear rather than a scale. */
const MAX_MARKS = 100
const RANGE_LENGTH = 2

/**
 * Renders a range slider with optional label and current value display.
 * Supports min/max/step, color, disabled state, and full-width layout.
 * With a `[low, high]` value it has two thumbs, one for each end of a range:
 * two native range inputs on one track, so each keeps the keyboard and
 * assistive tech support of the platform. `hasMarks` draws a tick per step.
 * @param {SliderProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    id,
    type, // eslint-disable-line no-unused-vars
    name = "",
    label,
    value = DEFAULT_VALUE,
    min = DEFAULT_MIN,
    max = DEFAULT_MAX,
    step = DEFAULT_STEP,
    isDisabled = false,
    color = "primary",
    isValueVisible = true,
    isFullWidth = false,
    hasMarks = false,
    onChange,
    ...rest
  } = props

  const inputId = id || name
  const isRange = Array.isArray(value) && value.length === RANGE_LENGTH
  const shown = isRange ? `${value[0]} – ${value[1]}` : value

  const classes = {
    "iw-slider": true,
    "iw-slider-range": isRange,
    [`iw-slider-${color}`]: color !== "primary",
    "iw-slider-full-width": isFullWidth,
  }

  return html`
    <div class=${classMap(classes)}>
      ${
        (label || isValueVisible) &&
        html`<div class="iw-slider-header">
          ${
            label
              ? html`<label for=${inputId || nothing}>${label}</label>`
              : html`<span></span>`
          }
          ${
            isValueVisible
              ? html`<output class="iw-slider-value">${shown}</output>`
              : null
          }
        </div>`
      }
      ${
        isRange
          ? renderRange({
              inputId,
              name,
              label,
              value,
              min,
              max,
              step,
              isDisabled,
              onChange,
              rest,
            })
          : html`<input
              id=${inputId || nothing}
              class="iw-slider-input"
              aria-label=${fallbackLabel(inputId, label)}
              type="range"
              name=${name}
              min=${min}
              max=${max}
              step=${step}
              .value=${String(value)}
              ?disabled=${isDisabled}
              @input=${(event) => onChange?.(Number(event.target.value))}
              ${ref((element) => applyElementProps(element, rest))}
            />`
      }
      ${hasMarks ? renderMarks({ min, max, step }) : nothing}
    </div>
  `
}

/**
 * Two thumbs on one track. Each input stops at the other's value, so the
 * range never turns inside out, and the track is filled between them.
 */
function renderRange({
  inputId,
  name,
  label,
  value,
  min,
  max,
  step,
  isDisabled,
  onChange,
  rest,
}) {
  const [low, high] = value
  const span = max - min || DEFAULT_STEP
  const fill = `--iw-slider-low: ${((low - min) / span) * PERCENT}%; --iw-slider-high: ${((high - min) / span) * PERCENT}%`
  const endName = (end) => (name ? `${name}-${end}` : nothing)
  // Each thumb is named for its end of the range, after the slider's label.
  const endLabel = (end) =>
    typeof label === "string" && label ? `${label} ${end}` : end

  return html`<div class="iw-slider-track" style=${fill}>
    <input
      id=${inputId || nothing}
      class="iw-slider-input"
      aria-label=${endLabel("minimum")}
      type="range"
      name=${endName("min")}
      min=${min}
      max=${max}
      step=${step}
      .value=${String(low)}
      ?disabled=${isDisabled}
      @input=${(event) => {
        const next = Math.min(Number(event.target.value), high)
        event.target.value = String(next)
        onChange?.([next, high])
      }}
      ${ref((element) => applyElementProps(element, rest))}
    />
    <input
      class="iw-slider-input"
      aria-label=${endLabel("maximum")}
      type="range"
      name=${endName("max")}
      min=${min}
      max=${max}
      step=${step}
      .value=${String(high)}
      ?disabled=${isDisabled}
      @input=${(event) => {
        const next = Math.max(Number(event.target.value), low)
        event.target.value = String(next)
        onChange?.([low, next])
      }}
    />
  </div>`
}

/** A tick per step, spread along the track. Decorative. */
function renderMarks({ min, max, step }) {
  const count = Math.floor((max - min) / step) + 1
  if (!(count > 1) || count > MAX_MARKS) return nothing

  return html`<div class="iw-slider-marks" aria-hidden="true">
    ${Array.from({ length: count }, () => html`<span></span>`)}
  </div>`
}
