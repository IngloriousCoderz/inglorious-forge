/**
 * @typedef {import('../../../types/controls/rating').RatingProps} RatingProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"

const DEFAULT_VALUE = 0
const DEFAULT_MAX = 5
const INDEX_TO_RATING = 1

/**
 * Renders a star (or custom symbol) rating control.
 * Supports max value, read-only/disabled states, and emits selection changes.
 * @param {RatingProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    value = DEFAULT_VALUE,
    max = DEFAULT_MAX,
    isDisabled = false,
    isReadOnly = false,
    symbol = "★",
    emptySymbol = "☆",
    size = "md",
    onChange,
  } = props

  const classes = {
    "iw-rating": true,
    [`iw-rating-${size}`]: size !== "md",
    "iw-rating-disabled": isDisabled,
    "iw-rating-readonly": isReadOnly,
  }

  return html`
    <div class=${classMap(classes)} role="radiogroup" aria-label="rating">
      ${Array.from({ length: max }, (_, index) => {
        const ratingValue = index + INDEX_TO_RATING
        const isActive = ratingValue <= value
        return html`
          <button
            type="button"
            class="iw-rating-item"
            aria-label=${`rate-${ratingValue}`}
            ?disabled=${isDisabled || isReadOnly}
            @click=${() => onChange?.(ratingValue)}
          >
            ${isActive ? symbol : emptySymbol}
          </button>
        `
      })}
    </div>
  `
}
