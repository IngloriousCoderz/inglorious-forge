const DEFAULT_POSITION = 0
const DEFAULT_ANCHOR = [DEFAULT_POSITION, DEFAULT_POSITION]

export function renderImage(entity, ctx, api) {
  const { image, sx = DEFAULT_POSITION, sy = DEFAULT_POSITION } = entity
  const {
    id,
    src,
    imageSize,
    tileSize = imageSize,
    anchor = DEFAULT_ANCHOR,
  } = image

  const [tileWidth, tileHeight] = tileSize
  const [anchorX, anchorY] = anchor

  const imgParams = [
    sx * tileWidth,
    sy * tileHeight,
    tileWidth,
    tileHeight,
    DEFAULT_POSITION,
    DEFAULT_POSITION,
    tileWidth,
    tileHeight,
  ]

  ctx.save()

  ctx.translate(-tileWidth * anchorX, -tileHeight * anchorY)

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
