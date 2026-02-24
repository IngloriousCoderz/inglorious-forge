/**
 * @typedef {import('../../../types/controls/switch').SwitchEntity} SwitchEntity
 * @typedef {import('@inglorious/web').Api} Api
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html } from "@inglorious/web"

/**
 * Switch control implemented with a checkbox input.
 *
 * @param {SwitchEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function render(entity, api) {
  const {
    name = "",
    label = "",
    checked = false,
    disabled = false,
    size = "md",
  } = entity

  const inputId = entity.id || name

  const classes = {
    "iw-switch-field": true,
    [`iw-switch-${size}`]: size !== "md",
    "iw-switch-disabled": disabled,
  }

  return html`
    <label class=${classMap(classes)} for=${inputId}>
      <input
        id=${inputId}
        class="iw-switch-input"
        type="checkbox"
        name=${name}
        .checked=${checked}
        ?disabled=${disabled}
        @change=${(event) =>
          api.notify(`#${entity.id}:change`, event.target.checked)}
      />
      <span class="iw-switch-track" aria-hidden="true">
        <span class="iw-switch-thumb"></span>
      </span>
      ${label ? html`<span class="iw-switch-label">${label}</span>` : null}
    </label>
  `
}
