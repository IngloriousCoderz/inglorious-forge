/**
 * @typedef {import('../../../types/controls/chip-picker').ChipPickerProps} ChipPickerProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"
import { when } from "@inglorious/web/directives/when"

import { Chip } from "../../data-display/chip/index.js"
import { formatOption } from "../combobox/helpers.js"

export const ChipPicker = {
  /**
   * Renders a group of toggle chips for picking several options, as a fieldset
   * whose legend is `label`.
   * @param {ChipPickerProps} props
   * @returns {TemplateResult}
   */
  render(props) {
    const {
      label,
      hint,
      options = [],
      value = [],
      isDisabled = false,
      className = "",
      onToggle,
    } = props

    return html`<fieldset
      class=${["iw-chip-picker", className].filter(Boolean).join(" ")}
    >
      ${when(
        label,
        () => html`<legend class="iw-chip-picker-legend">${label}</legend>`,
      )}
      <div class="iw-chip-picker-chips">
        ${options.map((option) => {
          const {
            value: optionValue,
            label: optionLabel,
            ...rest
          } = formatOption(option)
          return Chip.render({
            children: optionLabel,
            isSelected: value.includes(optionValue),
            isDisabled: isDisabled || Boolean(rest.isDisabled),
            onClick: () => onToggle?.(optionValue),
          })
        })}
      </div>
      ${when(hint, () => html`<p class="iw-chip-picker-hint">${hint}</p>`)}
    </fieldset>`
  },
}
