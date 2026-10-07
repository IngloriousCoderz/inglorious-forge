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

  // A frame is a place on the sheet, so it is said in the sheet's own units: the column
  // and the row of tiles, turned back into where that cell starts.
  const [, tileHeight] = tileSize
  const x = (tile % cols) * tileWidth
  const y = Math.floor(tile / cols) * tileHeight

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

  renderImage({ image: { ...image, x, y } }, ctx, api)

  ctx.restore()
}
