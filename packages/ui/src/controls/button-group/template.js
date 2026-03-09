/**
 * @typedef {import('../../../types/controls/button-group').ButtonGroupProps} ButtonGroupProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"
import { button } from "../button/index.js"

/**
 * Button group control for grouped actions.
 *
 * @param {ButtonGroupProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    type, // eslint-disable-line no-unused-vars
    buttons = [],
    value,
    multiple = false,
    direction = "row",
    attached = true,
    size = "md",
    variant = "default",
    color = "default",
    disabled = false,
    onChange,
    ...rest
  } = props

  const groupClasses = {
    "iw-button-group": true,
    "iw-button-group-selection": value != null || multiple,
    [`iw-button-group-${direction}`]: true,
    "iw-button-group-attached": attached,
  }

  const selectedValues = multiple
    ? new Set(Array.isArray(value) ? value : [])
    : null

  return html`
    <div
      class=${classMap(groupClasses)}
      role="group"
      ${ref((element) => applyElementProps(element, rest))}
    >
      ${buttons.map((item) => {
        const {
          id: itemId,
          value: explicitValue,
          label,
          children,
          disabled: itemDisabled,
          variant: itemVariant,
          color: itemColor,
          size: itemSize,
          icon,
          iconAfter,
          ...itemRest
        } = item

        const itemValue = explicitValue ?? itemId
        const isPressed = multiple
          ? selectedValues.has(itemValue)
          : value != null
            ? value === itemValue
            : false

        return button.render({
          children: html`
            ${icon ? html`<span class="iw-button-icon">${icon}</span>` : null}
            ${children ?? label}
            ${iconAfter
              ? html`<span class="iw-button-icon">${iconAfter}</span>`
              : null}
          `,
          variant: itemVariant ?? variant,
          color: itemColor ?? color,
          size: itemSize ?? size,
          disabled: disabled || !!itemDisabled,
          pressed: isPressed,
          ariaPressed: isPressed ? true : undefined,
          onClick: () => {
            if (!onChange) return

            if (multiple) {
              const next = new Set(selectedValues)
              if (next.has(itemValue)) {
                next.delete(itemValue)
              } else {
                next.add(itemValue)
              }

              return onChange([...next])
            }

            return onChange(itemValue)
          },
          ...itemRest,
        })
      })}
    </div>
  `
}
