/**
 * @typedef {import('../../../types/controls/switch').SwitchProps} SwitchProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html, nothing } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { ref } from "@inglorious/web/directives/ref"
import { when } from "@inglorious/web/directives/when"

import { applyElementProps } from "../../shared/apply-element-props.js"

/**
 * Renders a toggle switch backed by a checkbox input, which `role="switch"`
 * has assistive tech announce as on/off rather than checked.
 * Use it for boolean settings with optional labels and disabled state.
 * @param {SwitchProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    id,
    type, // eslint-disable-line no-unused-vars
    name = "",
    label = "",
    description,
    isChecked = false,
    isDisabled = false,
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
    "iw-switch-disabled": isDisabled,
  }

  return html`
    <label class=${classMap(classes)}>
      <input
        id=${inputId || nothing}
        class="iw-switch-input"
        type="checkbox"
        role="switch"
        name=${name}
        .checked=${isChecked}
        ?disabled=${isDisabled}
        @change=${(event) => onChange?.(event.target.checked)}
        ${ref((element) => applyElementProps(element, rest))}
      />
      <span class="iw-switch-track" aria-hidden="true">
        <span class="iw-switch-thumb"></span>
      </span>
      ${when(
        description,
        () =>
          html`<span class="iw-switch-text">
            ${when(label, () => html`<span class="iw-switch-label">${label}</span>`)}
            <span class="iw-switch-description">${description}</span>
          </span>`,
        () =>
          when(
            label,
            () => html`<span class="iw-switch-label">${label}</span>`,
          ),
      )}
    </label>
  `
}
