const DEFAULT_SIZE = 16
const DEFAULT_COLOR = "black"
const DEFAULT_FONT = "sans-serif"
const DEFAULT_TEXT_ALIGN = "left"
const DEFAULT_VALUE = ""
// Where a line sits against its position. The top edge is the default because it is the
// one that keeps the position and the line height in step with what is drawn whatever the
// font's own baseline turns out to be, and it is what every line written from a sprite
// sheet's own coordinates wants.
//
// "middle" is the other one worth having: it puts the middle of the line on the position,
// which is what a line the original centres on a point wants, and saves the caller from
// working out half a line height by hand.
const TOP_BASELINE = "top"
const DEFAULT_POSITION = 0
const DEFAULT_PARAMS = {
  baseline: TOP_BASELINE,
  color: DEFAULT_COLOR,
  font: DEFAULT_FONT,
  size: DEFAULT_SIZE,
  textAlign: DEFAULT_TEXT_ALIGN,
  value: DEFAULT_VALUE,
}

/**
 * Draws `entity.value`, one line per newline, from its position.
 *
 * @param {object} entity - The entity being drawn.
 * @param {CanvasRenderingContext2D} ctx - The context to draw into.
 */
export function renderText(entity, ctx) {
  const {
    size = DEFAULT_SIZE,
    lineHeight = size,
    color = DEFAULT_COLOR,
    font = DEFAULT_FONT,
    textAlign = DEFAULT_TEXT_ALIGN,
    baseline = TOP_BASELINE,
    value = DEFAULT_VALUE,
  } = entity

  ctx.save()

  ctx.font = `${size}px ${font}`
  ctx.fillStyle = color
  ctx.textAlign = textAlign
  // Anchoring the text to its top edge keeps the entity position and
  // `lineHeight` in sync with what is drawn, whatever the font's baseline is.
  ctx.textBaseline = baseline

  const tokens = value.split("\n")
  tokens.forEach((token, index) => {
    ctx.fillText(token, DEFAULT_POSITION, lineHeight * index)
  })

  ctx.restore()
}

/**
 * A line of text that says the same thing every frame.
 *
 * Everything is named, because a text line takes five of them and a positional fifth is
 * one that can be dropped without anything going wrong -- a missing line is an empty
 * screen, not an error.
 *
 * @param {object} [params] - What to draw.
 * @param {string} [params.value] - What the line says.
 * @param {number} [params.size] - The font size.
 * @param {string} [params.color] - The colour to draw it in.
 * @param {string} [params.font] - The font family.
 * @param {string} [params.textAlign] - Which edge the line sits on its position.
 * @param {string} [params.baseline] - Which edge of the line sits on its position.
 * @returns {object} A behaviour rendering that line.
 */
export function text(params = {}) {
  const { baseline, color, font, size, textAlign, value } = {
    ...DEFAULT_PARAMS,
    ...params,
  }

  return {
    render: renderText,

    create(entity) {
      entity.value = value
      entity.size = size
      entity.font = font
      entity.textAlign = textAlign
      entity.baseline = baseline
      entity.color = color

      return entity
    },
  }
}
