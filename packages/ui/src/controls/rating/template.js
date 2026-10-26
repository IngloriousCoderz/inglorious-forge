/**
 * @typedef {import('../../../types/controls/rating').RatingProps} RatingProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html, nothing } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"

const DEFAULT_VALUE = 0
const DEFAULT_MAX = 5
const INDEX_TO_RATING = 1

/**
 * Renders a star (or custom symbol) rating control.
 * Each star is a native radio, so the arrow keys move between them, the group
 * is announced as one choice, and the value submits with a form under `name`.
 * Supports max value, read-only/disabled states, and emits selection changes.
 * @param {RatingProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    id,
    name,
    value = DEFAULT_VALUE,
    max = DEFAULT_MAX,
    isDisabled = false,
    isReadOnly = false,
    symbol = "★",
    emptySymbol = "☆",
    size = "md",
    ariaLabel = "Rating",
    onChange,
  } = props

  // Radios are a group by sharing a name: without one, the arrow keys do not
  // move between the stars.
  const groupName = name || id

  const classes = {
    "iw-rating": true,
    [`iw-rating-${size}`]: size !== "md",
    "iw-rating-disabled": isDisabled,
    "iw-rating-readonly": isReadOnly,
  }

  return html`
    <fieldset
      id=${id || nothing}
      class=${classMap(classes)}
      aria-label=${ariaLabel}
      ?disabled=${isDisabled || isReadOnly}
    >
      ${Array.from({ length: max }, (_, index) => {
        const ratingValue = index + INDEX_TO_RATING
        const isActive = ratingValue <= value
        return html`
          <label class="iw-rating-item">
            <input
              class="iw-rating-input"
              type="radio"
              name=${groupName || nothing}
              value=${ratingValue}
              aria-label=${`${ratingValue} of ${max}`}
              .checked=${ratingValue === value}
              @change=${() => onChange?.(ratingValue)}
            />
            <span aria-hidden="true">${isActive ? symbol : emptySymbol}</span>
          </label>
        `
      })}
    </fieldset>
  `
}
