/**
 * @typedef {import('../../../types/controls/button-group').ButtonGroupProps} ButtonGroupProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"
import { button } from "../button/index.js"

/**
 * Renders a grouped set of buttons with optional single or multi selection.
 * Handles attached layout, selection state, and per-item overrides.
 * @param {ButtonGroupProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    type, // eslint-disable-line no-unused-vars
    buttons = [],
    value,
    isMultiple = false,
    direction = "row",
    isAttached = true,
    size = "md",
    variant = "default",
    color = "default",
    isDisabled = false,
    onChange,
    ...rest
  } = props

  const groupClasses = {
    "iw-button-group": true,
    "iw-button-group-selection": value != null || isMultiple,
    [`iw-button-group-${direction}`]: true,
    "iw-button-group-attached": isAttached,
  }

  const selectedValues = isMultiple
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
          isDisabled: itemDisabled,
          variant: itemVariant,
          color: itemColor,
          size: itemSize,
          icon,
          iconAfter,
          ...itemRest
        } = item

        const itemValue = explicitValue ?? itemId
        const isPressed = isMultiple
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
          isDisabled: isDisabled || !!itemDisabled,
          isPressed,
          isAriaPressed: isPressed ? true : undefined,
          onClick: () => {
            if (!onChange) return

            if (isMultiple) {
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
