import { entityAnchor } from "@inglorious/engine/physics/anchor.js"

const DEFAULT_POSITION = 0
const WHOLE = 1

const NO_FLIP = 1
const FLIP = -1

export function renderImage(entity, ctx, api) {
  const {
    image,
    sx = DEFAULT_POSITION,
    sy = DEFAULT_POSITION,
    flipX = false,
    flipY = false,
  } = entity
  const { id, src, imageSize, tileSize = imageSize } = image

  const [tileWidth, tileHeight] = tileSize
  // The same anchor the hitbox and the gizmos are placed by, so a sprite and the
  // shape that goes with it cannot drift apart.
  const [anchorX, anchorY] = entityAnchor(entity)

  // A negative scale maps a `[from, from + size]` rectangle onto
  // `[-(from + size), -from]` around the translated origin, so drawing from
  // `-size` puts the mirrored tile back in the box the anchor picked.
  const dx = flipX ? -tileWidth : DEFAULT_POSITION
  const dy = flipY ? -tileHeight : DEFAULT_POSITION

  const imgParams = [
    sx * tileWidth,
    sy * tileHeight,
    tileWidth,
    tileHeight,
    dx,
    dy,
    tileWidth,
    tileHeight,
  ]

  ctx.save()

  // The anchor counts from the bottom of the tile while the canvas counts down
  // from the top, so the vertical share is what is left over.
  ctx.translate(-tileWidth * anchorX, -tileHeight * (WHOLE - anchorY))

  if (flipX) {
    ctx.scale(FLIP, NO_FLIP)
  }

  if (flipY) {
    ctx.scale(NO_FLIP, FLIP)
  }

  const images = api.getType("Images")
  const img = images.get(id) || document.getElementById(id)
  if (img) {
    ctx.drawImage(img, ...imgParams)
  } else if (src) {
    images.load(id, src)
  } else {
    console.warn(`Image '${id}' not found and no src provided for lazy loading`)
  }

  ctx.restore()
}
