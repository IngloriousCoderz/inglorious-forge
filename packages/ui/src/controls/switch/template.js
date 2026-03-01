/**
 * @typedef {import('../../../types/controls/switch').SwitchProps} SwitchProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

/**
 * Switch control implemented with a checkbox input.
 *
 * @param {SwitchProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    id,
    type, // eslint-disable-line no-unused-vars
    name = "",
    label = "",
    checked = false,
    disabled = false,
    color = "primary",
    size = "md",
    onChange,
    ...rest
  } = props

  const inputId = id || name

  const classes = {
    "iw-switch": true,
    [`iw-switch-${color}`]: color !== "primary",
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
        @change=${(event) => onChange?.(event.target.checked)}
        ${ref((element) => applyElementProps(element, rest))}
      />
      <span class="iw-switch-track" aria-hidden="true">
        <span class="iw-switch-thumb"></span>
      </span>
      ${label ? html`<span class="iw-switch-label">${label}</span>` : null}
    </label>
  `
}
