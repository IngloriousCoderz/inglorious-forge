/**
 * @typedef {import('../../../types/controls/button-group').ButtonGroupEntity} ButtonGroupEntity
 * @typedef {import('@inglorious/web').Api} Api
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html } from "@inglorious/web"

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
    <div class=${classMap(groupClasses)} role="group">
      ${buttons.map((item, index) => {
        const childId = `${entity.id}-btn-${item.id ?? index}`
        const itemValue = item.value ?? item.id
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
              ${item.icon
                ? html`<span class="iw-button-icon">${item.icon}</span>`
                : null}
              ${item.children ?? item.label}
              ${item.iconAfter
                ? html`<span class="iw-button-icon">${item.iconAfter}</span>`
                : null}
            `,
            variant: item.variant ?? variant,
            color: item.color ?? color,
            size: item.size ?? size,
            disabled: disabled || !!item.disabled,
            ariaPressed: pressed ? true : undefined,
            className: pressed ? "iw-button-pressed" : "",
            type: "button",
          },
          childApi,
        )
      })}
    </div>
  `
}
