/**
 * @typedef {import('../../../types/controls/slider').SliderEntity} SliderEntity
 * @typedef {import('@inglorious/web').Api} Api
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

/**
 * Slider control based on native range input.
 *
 * @param {SliderEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function render(entity, api) {
  const {
    name = "",
    label,
    value = 0,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    showValue = true,
    fullWidth = false,
    ...rest
  } = entity

  const inputId = entity.id || name

  const classes = {
    "iw-slider-field": true,
    "iw-slider-full-width": fullWidth,
  }

  return html`
    <div class=${classMap(classes)}>
      ${(label || showValue) &&
      html`<div class="iw-slider-header">
        ${label
          ? html`<label for=${inputId}>${label}</label>`
          : html`<span></span>`}
        ${showValue
          ? html`<output class="iw-slider-value">${value}</output>`
          : null}
      </div>`}
      <input
        id=${inputId}
        class="iw-slider"
        type="range"
        name=${name}
        min=${min}
        max=${max}
        step=${step}
        .value=${String(value)}
        ?disabled=${disabled}
        @input=${(event) =>
          api.notify(`#${entity.id}:change`, Number(event.target.value))}
        ${ref((element) => applyElementProps(element, rest))}
      />
    </div>
  `
}
