/**
 * @typedef {import('../../../types/controls/checkbox').CheckboxEntity} CheckboxEntity
 * @typedef {import('@inglorious/web').Api} Api
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html } from "@inglorious/web"

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
    size = "md",
  } = entity

  const inputId = entity.id || name

  const classes = {
    "iw-checkbox-field": true,
    "iw-checkbox-disabled": disabled,
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
      />
      <span class="iw-checkbox-label">${label}</span>
    </label>
  `
}
