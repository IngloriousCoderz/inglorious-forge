/**
 * @typedef {import('../../../types/controls/rating').RatingEntity} RatingEntity
 * @typedef {import('@inglorious/web').Api} Api
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html } from "@inglorious/web"

const DEFAULT_VALUE = 0
const DEFAULT_MAX = 5
const INDEX_TO_RATING = 1

/**
 * Rating control rendered as clickable symbols.
 *
 * @param {RatingEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function render(entity, api) {
  const {
    value = DEFAULT_VALUE,
    max = DEFAULT_MAX,
    disabled = false,
    readonly = false,
    symbol = "★",
    emptySymbol = "☆",
    size = "md",
  } = entity

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
        const active = ratingValue <= value
        return html`
          <button
            type="button"
            class="iw-rating-item"
            aria-label=${`rate-${ratingValue}`}
            ?disabled=${disabled || readonly}
            @click=${() => api.notify(`#${entity.id}:change`, ratingValue)}
          >
            ${active ? symbol : emptySymbol}
          </button>
        `
      })}
    </div>
  `
}
