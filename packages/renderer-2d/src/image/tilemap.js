import { FLIPPED_HORIZONTALLY_FLAG, FLIPPED_VERTICALLY_FLAG } from "./flags.js"
import { renderImage } from "./image.js"

const HALF = 2
const DEFAULT_SCALE = 1

const FLIP = -1
const NO_FLIP = 1

export function renderTilemap(entity, ctx, api) {
  const { image, columns, scale = DEFAULT_SCALE, layers } = entity.tilemap
  const { imageSize, tileSize } = image

  const [imageWidth] = imageSize
  const [tileWidth, tileHeight] = tileSize
  const sCols = imageWidth / tileWidth

  const [firstLayer] = layers
  const dRows = Math.ceil(firstLayer.tiles.length / columns)
  const tilemapWidth = columns * tileWidth
  const tilemapHeight = dRows * tileHeight

  const offsetX = -tilemapWidth / HALF
  const offsetY = tilemapHeight / HALF

  ctx.save()

  ctx.scale(scale, scale)
  ctx.translate(offsetX, offsetY)

  layers.forEach(({ tiles }) => {
    tiles.forEach((flaggedTile, index) => {
      const dx = (index % columns) * tileWidth + tileWidth / HALF
      const dy =
        Math.floor(index / columns) * tileHeight -
        tilemapHeight +
        tileHeight / HALF

      const isFlippedHorizontally = !!(flaggedTile & FLIPPED_HORIZONTALLY_FLAG)
      const isFlippedVertically = !!(flaggedTile & FLIPPED_VERTICALLY_FLAG)

      let tile = flaggedTile
      tile &= ~FLIPPED_HORIZONTALLY_FLAG
      tile &= ~FLIPPED_VERTICALLY_FLAG

      const sx = tile % sCols
      const sy = Math.floor(tile / sCols)

      ctx.save()

      ctx.translate(dx, dy)

      ctx.scale(
        isFlippedHorizontally ? FLIP : NO_FLIP,
        isFlippedVertically ? FLIP : NO_FLIP,
      )

      renderImage({ image, sx, sy }, ctx, api)

      ctx.restore()
    })
  })

  ctx.restore()
}
