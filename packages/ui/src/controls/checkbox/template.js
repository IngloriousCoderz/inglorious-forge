/**
 * @typedef {import('../../../types/controls/checkbox').CheckboxEntity} CheckboxEntity
 * @typedef {import('@inglorious/web').Api} Api
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

/**
 * Checkbox control for boolean values.
 *
 * @param {CheckboxEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function render(entity, api) {
  const {
    name = "",
    label = "",
    checked = false,
    disabled = false,
    required = false,
    color = "primary",
    size = "md",
    ...rest
  } = entity

  const inputId = entity.id || name

  const classes = {
    "iw-checkbox-field": true,
    "iw-checkbox-disabled": disabled,
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
        .checked=${checked}
        ?disabled=${disabled}
        ?required=${required}
        @change=${(event) =>
          api.notify(`#${entity.id}:change`, event.target.checked)}
        ${ref((element) => applyElementProps(element, rest))}
      />
      <span class="iw-checkbox-label">${label}</span>
    </label>
  `
}
