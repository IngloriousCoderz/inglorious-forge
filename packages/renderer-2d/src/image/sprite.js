import { renderImage } from "./image.js"

const DEFAULT_SCALE = 1

const FLIP = -1
const NO_FLIP = 1

const FLIPPED_HORIZONTALLY_FLAG = 0x80000000
const FLIPPED_VERTICALLY_FLAG = 0x40000000
// const FLIPPED_DIAGONALLY_FLAG = 0x20000000
// const ROTATED_HEXAGONAL_120_FLAG = 0x10000000

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

  const sx = tile % cols
  const sy = Math.floor(tile / cols)

  ctx.save()

  ctx.scale(scale, scale)

  // Flipping happens about the middle of the tile, and the image is what puts the
  // tile's middle on the origin, so there is nothing left to translate back here.
  // Doing it in both places is what used to draw a sprite a whole tile up and to the
  // left, which also meant rotating an entity swung it around the wrong centre.
  ctx.scale(
    isFlippedHorizontally ? FLIP : NO_FLIP,
    isFlippedVertically ? FLIP : NO_FLIP,
  )

  renderImage({ image, sx, sy }, ctx, api)

  ctx.restore()
}
