/**
 * @typedef {import('../../../types/controls/select').SelectProps} SelectProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref, repeat } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"
import { formatOption, getOptionValue, isOptionSelected } from "./helpers.js"

/**
 * Renders a styled native select control with optional single or multi-select modes.
 * Options can be primitives or objects and are rendered with consistent theming.
 * @example
 * // Stateless usage
 * select.render({ options: ['true', 'false'], value: 'true' })
 *
 * @param {SelectProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    id,
    type, // eslint-disable-line no-unused-vars
    name = "",
    value = "",
    options = [],
    size = "md",
    isDisabled = false,
    isFullWidth = false,
    isMulti = false,
    onChange,
    onBlur,
    onFocus,
    ...rest
  } = props

  const inputId = id || name

  const selectClasses = {
    "iw-select": true,
    "iw-select-full-width": !!isFullWidth,
    [`iw-select-${size}`]: size !== "md",
  }

  const selectedOption = options.find(
    (option) => getOptionValue(option) === value,
  )

  return html`
    <select
      id=${inputId}
      name=${name}
      ?multiple=${isMulti}
      ?disabled=${isDisabled}
      class=${classMap(selectClasses)}
      @change=${(event) => onChange?.(event.target.value)}
      @blur=${onBlur}
      @focus=${onFocus}
      ${ref((element) => applyElementProps(element, rest))}
    >
      ${repeat(
        options,
        (option) => getOptionValue(option),
        (option) => {
          const {
            value,
            label,
            isDisabled: isOptionDisabled,
          } = formatOption(option)
          const isSelected = isOptionSelected(
            option,
            selectedOption?.value,
            isMulti,
          )

          const optionClasses = {
            "iw-select-option": true,
            "iw-select-option-selected": isSelected,
          }

          return html`<option
            value=${value}
            .selected=${value === selectedOption?.value}
            ?disabled=${isOptionDisabled}
            class=${classMap(optionClasses)}
          >
            ${label}
          </option>`
        },
      )}
    </select>
  `
}
