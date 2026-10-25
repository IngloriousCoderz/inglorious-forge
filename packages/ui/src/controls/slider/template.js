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

/**
 * Renders a range slider with optional label and current value display.
 * Supports min/max/step, color, disabled state, and full-width layout.
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
    onChange,
    ...rest
  } = props

  const inputId = id || name

  const classes = {
    "iw-slider": true,
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
              ? html`<output class="iw-slider-value">${value}</output>`
              : null
          }
        </div>`
      }
      <input
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
      />
    </div>
  `
}
