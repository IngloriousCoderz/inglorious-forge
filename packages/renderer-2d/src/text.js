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
