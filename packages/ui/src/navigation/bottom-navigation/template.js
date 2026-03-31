/**
 * @typedef {import('../../../types/navigation/bottom-navigation').BottomNavigationProps} BottomNavigationProps
 * @typedef {import('../../../types/navigation/bottom-navigation').BottomNavigationAction} BottomNavigationAction
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

export const BottomNavigation = {
  /**
   * Main entrypoint for bottom navigation. Delegates to the base renderer for overrides.
   * Renders a row of actions with optional labels.
   * @param {BottomNavigationProps} props
   * @returns {TemplateResult}
   */
  render(props) {
    return this.renderBottomNavigation(props)
  },

  /**
   * Renders the navigation container and iterates actions.
   * Each action is delegated to `renderAction`.
   * @param {BottomNavigationProps} props
   * @returns {TemplateResult}
   */
  renderBottomNavigation(props) {
    const {
      type, // eslint-disable-line no-unused-vars
      actions = [],
      value,
      hasLabels = true,
      className = "",
      ...rest
    } = props

    const extraClasses = Object.fromEntries(
      className
        .split(/\s+/)
        .filter(Boolean)
        .map((name) => [name, true]),
    )

    return html`<nav
      class=${classMap({ "iw-bottom-navigation": true, ...extraClasses })}
      ${ref((el) => applyElementProps(el, rest))}
    >
      ${actions.map((action, index) =>
        this.renderAction(action, index, { ...props, hasLabels, value }),
      )}
    </nav>`
  },

  /**
   * Renders a single bottom navigation action.
   * Handles selection state and click callbacks.
   * @param {BottomNavigationAction} action
   * @param {number} index
   * @param {BottomNavigationProps} props
   * @returns {TemplateResult}
   */
  renderAction(action, index, props) {
    const currentValue = action.value ?? index
    const selected = currentValue === props.value

    return html`<button
      type="button"
      class=${classMap({
        "iw-bottom-navigation-action": true,
        "iw-bottom-navigation-action-selected": selected,
      })}
      aria-current=${selected ? "page" : "false"}
      ?disabled=${action.isDisabled}
      @click=${() => {
        action.onClick?.(currentValue)
        props.onChange?.(currentValue)
      }}
    >
      ${action.icon
        ? html`<span class="iw-bottom-navigation-icon">${action.icon}</span>`
        : null}
      ${props.hasLabels
        ? html`<span class="iw-bottom-navigation-label">${action.label}</span>`
        : null}
    </button>`
  },
}
