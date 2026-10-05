import { entityAnchor } from "@inglorious/engine/physics/anchor.js"

const DEFAULT_POSITION = 0
const WHOLE = 1
const OPAQUE = 1
const NATIVE_SCALE = 1

const NO_FLIP = 1
const FLIP = -1

export function renderImage(entity, ctx, api) {
  const {
    image,
    sx = DEFAULT_POSITION,
    sy = DEFAULT_POSITION,
    flipX = false,
    flipY = false,
    opacity = OPAQUE,
  } = entity
  const {
    id,
    src,
    imageSize,
    tileSize = imageSize,
    scale = NATIVE_SCALE,
  } = image
  // The region to take out of the sheet. A tile is the natural grid, but artwork
  // does not always come in one piece per cell: a sprite can be wider than the
  // grid it is cut from, or sit inside its cell with the background around it.
  // Without a `frameSize` the whole tile is both read and drawn, which is what
  // every sprite sheet that is cut on its grid already relies on.
  const [tileWidth, tileHeight] = tileSize
  const [frameWidth = tileWidth, frameHeight = tileHeight] =
    image.frameSize ?? []
  // The size the frame is drawn at. A cropped tile is drawn at the size of the
  // tile, not of the sheet it came out of, so this follows the tile unless a
  // partial frame gives both the region to read and the size to read it at.
  const [drawWidth, drawHeight] = image.frameSize ?? tileSize
  // The same anchor the hitbox and the gizmos are placed by, so a sprite and the
  // shape that goes with it cannot drift apart.
  const [anchorX, anchorY] = entityAnchor(entity)

  // A negative scale maps a `[from, from + size]` rectangle onto
  // `[-(from + size), -from]` around the translated origin, so drawing from
  // `-size` puts the mirrored tile back in the box the anchor picked.
  const dx = flipX ? -drawWidth : DEFAULT_POSITION
  const dy = flipY ? -drawHeight : DEFAULT_POSITION

  const imgParams = [
    sx * tileWidth,
    sy * tileHeight,
    frameWidth,
    frameHeight,
    dx,
    dy,
    drawWidth,
    drawHeight,
  ]

  ctx.save()

  ctx.globalAlpha = opacity

  // A pair scales each axis on its own, for artwork that is not the same shape as
  // the screen it has to fill. Skipped at native size, which keeps the scale calls a
  // transform list rather than a pair of no-ops.
  const [scaleX, scaleY] = Array.isArray(scale) ? scale : [scale, scale]
  if (scaleX !== NATIVE_SCALE || scaleY !== NATIVE_SCALE) {
    ctx.scale(scaleX, scaleY)
  }

  // Scaling comes first so that the anchor offset is measured in scaled units:
  // otherwise the tile is placed against its unscaled size and then scaled out from
  // under the anchor, which is how a stretched backdrop ends up hanging off the
  // bottom of the screen. The anchor counts from the bottom of the drawn box while
  // the canvas counts down from the top, so the vertical share is what is left over.
  ctx.translate(-drawWidth * anchorX, -drawHeight * (WHOLE - anchorY))

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
