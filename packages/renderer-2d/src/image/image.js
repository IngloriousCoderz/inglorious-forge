const DEFAULT_POSITION = 0
const DEFAULT_ANCHOR = [DEFAULT_POSITION, DEFAULT_POSITION]

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
  const {
    id,
    src,
    imageSize,
    tileSize = imageSize,
    anchor = DEFAULT_ANCHOR,
  } = image

  const [tileWidth, tileHeight] = tileSize
  const [anchorX, anchorY] = anchor

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

  ctx.translate(-tileWidth * anchorX, -tileHeight * anchorY)

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
