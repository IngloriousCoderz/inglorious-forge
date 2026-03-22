/**
 * @typedef {import('../../../types/controls/checkbox').CheckboxProps} CheckboxProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

/**
 * Renders a labeled checkbox for boolean input.
 * Supports disabled/required states plus size and color variants.
 * @param {CheckboxProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    id,
    type, // eslint-disable-line no-unused-vars
    name = "",
    label = "",
    isChecked = false,
    isDisabled = false,
    isRequired = false,
    color = "primary",
    size = "md",
    onChange,
    ...rest
  } = props

  const inputId = id || name

  const classes = {
    "iw-checkbox": true,
    "iw-checkbox-disabled": isDisabled,
    [`iw-checkbox-${color}`]: color !== "primary",
    [`iw-checkbox-${size}`]: size !== "md",
  }

  return html`
    <label class=${classMap(classes)} for=${inputId}>
      <input
        id=${inputId}
        class="iw-checkbox"
        type="checkbox"
        name=${name}
        .checked=${isChecked}
        ?disabled=${isDisabled}
        ?required=${isRequired}
        @change=${(event) => onChange?.(event.target.checked)}
        ${ref((element) => applyElementProps(element, rest))}
      />
      <span class="iw-checkbox-label">${label}</span>
    </label>
  `
}
