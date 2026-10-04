const DEFAULT_SIZE = 16
const DEFAULT_COLOR = "black"
const DEFAULT_FONT = "sans-serif"
const DEFAULT_TEXT_ALIGN = "left"
const DEFAULT_VALUE = ""
const TOP_BASELINE = "top"
const DEFAULT_POSITION = 0

export function renderText(entity, ctx) {
  const {
    size = DEFAULT_SIZE,
    lineHeight = size,
    color = DEFAULT_COLOR,
    font = DEFAULT_FONT,
    textAlign = DEFAULT_TEXT_ALIGN,
    value = DEFAULT_VALUE,
  } = entity

  ctx.save()

  ctx.font = `${size}px ${font}`
  ctx.fillStyle = color
  ctx.textAlign = textAlign
  // Anchoring the text to its top edge keeps the entity position and
  // `lineHeight` in sync with what is drawn, whatever the font's baseline is.
  ctx.textBaseline = TOP_BASELINE

  const tokens = value.split("\n")
  tokens.forEach((token, index) => {
    ctx.fillText(token, DEFAULT_POSITION, lineHeight * index)
  })

  ctx.restore()
}
