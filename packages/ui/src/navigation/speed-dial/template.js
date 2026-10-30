/**
 * @typedef {import('../../../types/navigation/speed-dial').SpeedDialProps} SpeedDialProps
 * @typedef {import('../../../types/navigation/speed-dial').SpeedDialAction} SpeedDialAction
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html, nothing } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { ref } from "@inglorious/web/directives/ref"

import { syncPopover } from "../../shared/top-layer.js"

export const SpeedDial = {
  /**
   * Main entrypoint for the speed dial. Delegates to the base renderer for overrides.
   * Shows a trigger button and an expandable list of actions.
   * @param {SpeedDialProps} props
   * @returns {TemplateResult}
   */
  render(props) {
    return this.renderSpeedDial(props)
  },

  /**
   * Renders the speed dial container, trigger, and actions list.
   * Actions are delegated to `renderAction`.
   * The actions are a native popover anchored to the trigger, which toggles
   * it as its invoker: Esc, a press outside or an action closes it.
   * @param {SpeedDialProps} props
   * @returns {TemplateResult}
   */
  renderSpeedDial(props) {
    const {
      isOpen = false,
      direction = "up",
      icon = "+",
      ariaLabel = "Speed dial",
      actions = [],
      onToggle,
    } = props

    return html`<div
      class=${classMap({
        "iw-speed-dial": true,
        [`iw-speed-dial-${direction}`]: true,
        "iw-speed-dial-open": isOpen,
      })}
      ${ref((element) => {
        if (!element) return
        const trigger = element.querySelector(".iw-speed-dial-trigger")
        const popover = element.querySelector(".iw-speed-dial-actions")
        trigger.commandForElement = popover
        if (onToggle) {
          syncPopover(popover, {
            isOpen,
            onOpen: () => onToggle(true),
            onClose: () => onToggle(false),
          })
        }
      })}
    >
      <button
        type="button"
        class="iw-speed-dial-trigger"
        aria-label=${ariaLabel}
        aria-expanded=${onToggle ? String(isOpen) : nothing}
        command="toggle-popover"
      >
        ${icon}
      </button>
      <div class="iw-speed-dial-actions" popover="auto">
        ${actions.map((action, index) =>
          this.renderAction(action, index, props),
        )}
      </div>
    </div>`
  },

  /**
   * Renders a single speed dial action button.
   * Handles click callbacks and disabled state.
   * @param {SpeedDialAction} action
   * @param {number} index
   * @param {SpeedDialProps} props
   * @returns {TemplateResult}
   */
  renderAction(action, index, props) {
    return html`<button
      type="button"
      class="iw-speed-dial-action"
      command="hide-popover"
      ${ref((element) => {
        if (element) {
          queueMicrotask(() => {
            element.commandForElement = element.parentElement
          })
        }
      })}
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
