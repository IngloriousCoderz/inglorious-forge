/**
 * @typedef {import('../../../types/controls/slider').SliderProps} SliderProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

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
      ${(label || isValueVisible) &&
      html`<div class="iw-slider-header">
        ${label
          ? html`<label for=${inputId}>${label}</label>`
          : html`<span></span>`}
        ${isValueVisible
          ? html`<output class="iw-slider-value">${value}</output>`
          : null}
      </div>`}
      <input
        id=${inputId}
        class="iw-slider-input"
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
