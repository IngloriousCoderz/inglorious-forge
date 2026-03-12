/**
 * @typedef {import('../../../types/navigation/speed-dial').SpeedDialProps} SpeedDialProps
 * @typedef {import('../../../types/navigation/speed-dial').SpeedDialAction} SpeedDialAction
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html } from "@inglorious/web"

export const speedDial = {
  /**
   * @param {SpeedDialProps} props
   * @returns {TemplateResult}
   */
  render(props) {
    const {
      isOpen = false,
      direction = "up",
      icon = "+",
      ariaLabel = "Speed dial",
      actions = [],
    } = props

    return html`<div
      class=${classMap({
        "iw-speed-dial": true,
        [`iw-speed-dial-${direction}`]: true,
        "iw-speed-dial-open": isOpen,
      })}
    >
      ${isOpen
        ? html`<div class="iw-speed-dial-actions">
            ${actions.map((action, index) =>
              this.renderAction(action, index, props),
            )}
          </div>`
        : null}
      <button
        type="button"
        class="iw-speed-dial-trigger"
        aria-label=${ariaLabel}
        @click=${() => props.onToggle?.(!isOpen)}
      >
        ${icon}
      </button>
    </div>`
  },

  /**
   * @param {SpeedDialAction} action
   * @param {number} index
   * @param {SpeedDialProps} props
   * @returns {TemplateResult}
   */
  renderAction(action, index, props) {
    return html`<button
      type="button"
      class="iw-speed-dial-action"
      aria-label=${action.label ?? `Speed dial action ${index + 1}`}
      ?disabled=${action.isDisabled}
      @click=${() => {
        action.onClick?.(action.value ?? index)
        props.onAction?.(action.value ?? index, action)
      }}
    >
      ${action.icon ?? action.label}
    </button>`
  },
}
