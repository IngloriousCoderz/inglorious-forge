/**
 * @typedef {import('../../../types/controls/checkbox').CheckboxProps} CheckboxProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html, nothing } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { ref } from "@inglorious/web/directives/ref"
import { when } from "@inglorious/web/directives/when"

import { applyElementProps } from "../../shared/apply-element-props.js"

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
    description,
    media,
    variant = "default",
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
    "iw-checkbox-card": variant === "card",
    [`iw-checkbox-${color}`]: color !== "primary",
    [`iw-checkbox-${size}`]: size !== "md",
  }

  return html`
    <label class=${classMap(classes)}>
      <input
        id=${inputId || nothing}
        class="iw-checkbox-input"
        type="checkbox"
        name=${name}
        .checked=${isChecked}
        ?disabled=${isDisabled}
        ?required=${isRequired}
        @change=${(event) => onChange?.(event.target.checked)}
        ${ref((element) => applyElementProps(element, rest))}
      />
      ${when(
        description || media,
        () =>
          html`<span class="iw-checkbox-text">
            ${when(
              media,
              () => html`<span class="iw-checkbox-media">${media}</span>`,
            )}
            <span class="iw-checkbox-label">${label}</span>
            ${when(
              description,
              () =>
                html`<span class="iw-checkbox-description"
                  >${description}</span
                >`,
            )}
          </span>`,
        () => html`<span class="iw-checkbox-label">${label}</span>`,
      )}
    </label>
  `
}
