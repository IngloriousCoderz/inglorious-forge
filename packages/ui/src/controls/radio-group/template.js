/**
 * @typedef {import('../../../types/controls/radio-group').RadioGroupEntity} RadioGroupEntity
 * @typedef {import('@inglorious/web').Api} Api
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html } from "@inglorious/web"

/**
 * Radio group control for selecting one option.
 *
 * @param {RadioGroupEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function render(entity, api) {
  const {
    name = entity.id || "radio",
    label,
    value,
    options = [],
    direction = "column",
    disabled = false,
  } = entity

  const rootClasses = {
    "iw-radio-group": true,
    [`iw-radio-group-${direction}`]: true,
    "iw-radio-group-disabled": disabled,
  }

  return html`
    <fieldset class=${classMap(rootClasses)} ?disabled=${disabled}>
      ${label
        ? html`<legend class="iw-radio-group-label">${label}</legend>`
        : null}
      ${options.map(
        (option) => html`
          <label class="iw-radio-option">
            <input
              class="iw-radio"
              type="radio"
              name=${name}
              value=${option.value}
              .checked=${value === option.value}
              ?disabled=${disabled || !!option.disabled}
              @change=${(event) =>
                api.notify(`#${entity.id}:change`, event.target.value)}
            />
            <span>${option.label}</span>
          </label>
        `,
      )}
    </fieldset>
  `
}
