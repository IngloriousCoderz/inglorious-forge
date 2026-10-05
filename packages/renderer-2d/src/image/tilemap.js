import { renderImage } from "./image.js"

const HALF = 2
const DEFAULT_SCALE = 1

const FLIP = -1
const NO_FLIP = 1

const FLIPPED_HORIZONTALLY_FLAG = 0x80000000
const FLIPPED_VERTICALLY_FLAG = 0x40000000
// const FLIPPED_DIAGONALLY_FLAG = 0x20000000
// const ROTATED_HEXAGONAL_120_FLAG = 0x10000000

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
      // The middle of this tile's cell, which is where the sprite is drawn around.
      // Centring the cell rather than its corner is what makes this agree with the
      // collision shape, which is measured from the same anchor.
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

      // Flipping happens about the middle of the tile, which is now the origin, so
      // there is nothing left to translate back. Centring is left to the image, which
      // is the one place that does it.
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
