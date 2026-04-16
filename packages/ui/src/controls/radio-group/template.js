/**
 * @typedef {import('../../../types/controls/radio-group').RadioGroupProps} RadioGroupProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { ref } from "@inglorious/web/directives/ref"

import { applyElementProps } from "../../shared/applyElementProps.js"

/**
 * Renders a group of radio options for single selection.
 * Supports horizontal/vertical layouts and disabled state.
 * @param {RadioGroupProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    id,
    type, // eslint-disable-line no-unused-vars
    name = "",
    label,
    value,
    options = [],
    direction = "column",
    color = "primary",
    isDisabled = false,
    onChange,
    ...rest
  } = props

  const inputId = id || name

  const rootClasses = {
    "iw-radio-group": true,
    [`iw-radio-group-${direction}`]: true,
    [`iw-radio-group-${color}`]: color !== "primary",
    "iw-radio-group-disabled": isDisabled,
  }

  return html`
    <fieldset
      class=${classMap(rootClasses)}
      ?disabled=${isDisabled}
      ${ref((element) => applyElementProps(element, rest))}
    >
      ${label
        ? html`<legend class="iw-radio-group-label">${label}</legend>`
        : null}
      ${options.map((option) => {
        const {
          label: optionLabel,
          value: optionValue,
          isDisabled: optionDisabled = false,
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
              ?disabled=${isDisabled || optionDisabled}
              @change=${(event) => onChange?.(event.target.value)}
              ${ref((element) => applyElementProps(element, optionRest))}
            />
            <span>${optionLabel}</span>
          </label>
        `
      })}
    </fieldset>
  `
}
