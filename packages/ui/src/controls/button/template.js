/**
 * @typedef {import('../../../types/controls/button').ButtonProps} ButtonProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html, nothing } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { ref } from "@inglorious/web/directives/ref"

import { applyElementProps } from "../../shared/apply-element-props.js"

/**
 * Renders a themed button for actions and form submission.
 * Supports variants, sizes, shapes, pressed state, and full-width layout.
 * With `onFileSelect`, the button also opens a file picker on click.
 * @example
 * // Stateless usage
 * button.render({ children: 'Click me', variant: 'primary' })
 *
 * // File picker
 * button.render({ children: 'Upload', accept: 'image/*', onFileSelect })
 *
 * @param {ButtonProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    type, // eslint-disable-line no-unused-vars
    children,
    variant = "default",
    color = "default",
    size = "md",
    shape = "rectangle",
    isDisabled = false,
    isPressed = false,
    isFullWidth = false,
    buttonType = "button",
    ariaLabel,
    isAriaPressed,
    className = "",
    accept,
    isMultiple = false,
    onClick,
    onFileSelect,
    ...rest
  } = props

  const extraClasses = Object.fromEntries(
    className
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => [name, true]),
  )

  const classes = {
    "iw-button": true,
    [`iw-button-${variant}`]: variant !== "default",
    [`iw-button-${color}`]: true,
    [`iw-button-${size}`]: true,
    [`iw-button-pressed`]: isPressed,
    [`iw-button-shape-${shape}`]: shape !== "rectangle",
    "iw-button-full-width": isFullWidth,
    "iw-button-disabled": isDisabled,
    ...extraClasses,
  }

  const handleClick = onFileSelect
    ? (event) => {
        onClick?.(event)
        event.currentTarget.nextElementSibling.click()
      }
    : onClick

  return html`
    <button
      type=${buttonType}
      aria-label=${ariaLabel || nothing}
      aria-pressed=${isAriaPressed ?? nothing}
      class=${classMap(classes)}
      ?disabled=${isDisabled}
      @click=${handleClick}
      ${ref((element) => applyElementProps(element, rest))}
    >
      ${children}
    </button>
    ${
      onFileSelect
        ? html`<input
            type="file"
            accept=${accept ?? ""}
            ?multiple=${isMultiple}
            ?disabled=${isDisabled}
            hidden
            @change=${(event) => handleFileChange(event, onFileSelect)}
          />`
        : nothing
    }
  `
}

function handleFileChange(event, onFileSelect) {
  const { files } = event.target
  if (files?.length) onFileSelect(files)
  // Clear the input so picking the same file again still fires `change`
  event.target.value = ""
}
