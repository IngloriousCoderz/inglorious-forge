/**
 * @typedef {import('../../../types/controls/radio-group').RadioGroupEntity} RadioGroupEntity
 * @typedef {import('@inglorious/web').Api} Api
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

/**
 * Radio group control for selecting one option.
 *
 * @param {RadioGroupEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function render(entity, api) {
  const {
    id,
    type, // eslint-disable-line no-unused-vars
    name = "",
    label,
    value,
    options = [],
    direction = "column",
    color = "primary",
    disabled = false,
    ...rest
  } = entity

  const inputId = id || name

  const rootClasses = {
    "iw-radio-group": true,
    [`iw-radio-group-${direction}`]: true,
    [`iw-radio-group-${color}`]: color !== "primary",
    "iw-radio-group-disabled": disabled,
  }

  return html`
    <fieldset
      class=${classMap(rootClasses)}
      ?disabled=${disabled}
      ${ref((element) => applyElementProps(element, rest))}
    >
      ${label
        ? html`<legend class="iw-radio-group-label">${label}</legend>`
        : null}
      ${options.map((option) => {
        const {
          label: optionLabel,
          value: optionValue,
          disabled: optionDisabled = false,
          ...optionRest
        } = option

        return html`
          <label class="iw-radio-option">
            <input
              id=${inputId}
              class="iw-radio"
              type="radio"
              name=${name}
              value=${optionValue}
              .checked=${value === optionValue}
              ?disabled=${disabled || optionDisabled}
              @change=${(event) =>
                api.notify(`#${id}:change`, event.target.value)}
              ${ref((element) => applyElementProps(element, optionRest))}
            />
            <span>${optionLabel}</span>
          </label>
        `
      })}
    </fieldset>
  `
}
