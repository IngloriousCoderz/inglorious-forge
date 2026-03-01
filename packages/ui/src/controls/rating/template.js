/**
 * @typedef {import('../../../types/controls/rating').RatingProps} RatingProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html } from "@inglorious/web"

const DEFAULT_VALUE = 0
const DEFAULT_MAX = 5
const INDEX_TO_RATING = 1

/**
 * Rating control rendered as clickable symbols.
 *
 * @param {RatingProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    value = DEFAULT_VALUE,
    max = DEFAULT_MAX,
    disabled = false,
    readonly = false,
    symbol = "★",
    emptySymbol = "☆",
    size = "md",
    onChange,
  } = props

  const classes = {
    "iw-rating": true,
    [`iw-rating-${size}`]: size !== "md",
    "iw-rating-disabled": disabled,
    "iw-rating-readonly": readonly,
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
            ?disabled=${disabled || readonly}
            @click=${() => onChange?.(ratingValue)}
          >
            ${isActive ? symbol : emptySymbol}
          </button>
        `
      })}
    </div>
  `
}
