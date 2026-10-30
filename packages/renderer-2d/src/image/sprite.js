import { FLIPPED_HORIZONTALLY_FLAG, FLIPPED_VERTICALLY_FLAG } from "./flags.js"
import { renderImage } from "./image.js"

const DEFAULT_SCALE = 1

const FLIP = -1
const NO_FLIP = 1

export function renderSprite(entity, ctx, api) {
  const { image, frames, state, value, scale = DEFAULT_SCALE } = entity.sprite
  const { imageSize, tileSize } = image

  const [imageWidth] = imageSize
  const [tileWidth] = tileSize
  const cols = imageWidth / tileWidth

  const flaggedTile = frames[state][value]

  const isFlippedHorizontally = !!(flaggedTile & FLIPPED_HORIZONTALLY_FLAG)
  const isFlippedVertically = !!(flaggedTile & FLIPPED_VERTICALLY_FLAG)

  let tile = flaggedTile
  tile &= ~FLIPPED_HORIZONTALLY_FLAG
  tile &= ~FLIPPED_VERTICALLY_FLAG

  const [, tileHeight] = tileSize
  const x = (tile % cols) * tileWidth
  const y = Math.floor(tile / cols) * tileHeight

  ctx.save()

  ctx.scale(scale, scale)

  ctx.scale(
    isFlippedHorizontally ? FLIP : NO_FLIP,
    isFlippedVertically ? FLIP : NO_FLIP,
  )

  renderImage({ image: { ...image, x, y } }, ctx, api)

  ctx.restore()
}
