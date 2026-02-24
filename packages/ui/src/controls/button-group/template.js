/**
 * @typedef {import('../../../types/controls/button-group').ButtonGroupEntity} ButtonGroupEntity
 * @typedef {import('@inglorious/web').Api} Api
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref } from "@inglorious/web"
import { applyElementProps } from "../../shared/applyElementProps.js"

import { buttonPrimitive as button } from "../button/index.js"

/**
 * Button group control for grouped actions.
 *
 * @param {ButtonGroupEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function render(entity, api) {
  const {
    buttons = [],
    value,
    multiple = false,
    direction = "row",
    attached = true,
    size = "md",
    variant = "default",
    color = "primary",
    disabled = false,
    ...rest
  } = entity

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
      ${buttons.map((item, index) => {
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

        const childId = `${entity.id}-btn-${itemId ?? index}`
        const itemValue = explicitValue ?? itemId
        const pressed = multiple
          ? selectedValues.has(itemValue)
          : value != null
            ? value === itemValue
            : false

        const childApi = {
          ...api,
          notify(type, payload) {
            if (type === `#${childId}:click`) {
              api.notify(`#${entity.id}:click`, itemValue)
              if (value != null || multiple) {
                if (multiple) {
                  const next = new Set(selectedValues)
                  if (next.has(itemValue)) next.delete(itemValue)
                  else next.add(itemValue)
                  return api.notify(`#${entity.id}:change`, [...next])
                }
                return api.notify(`#${entity.id}:change`, itemValue)
              }
              return
            }
            return api.notify(type, payload)
          },
        }

        return button.render(
          {
            id: childId,
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
            ariaPressed: pressed ? true : undefined,
            className: pressed ? "iw-button-pressed" : "",
            type: "button",
            ...itemRest,
          },
          childApi,
        )
      })}
    </div>
  `
}
