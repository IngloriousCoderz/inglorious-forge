import { max } from "@inglorious/utils/data-structures/array.js"

import { renderRectangle } from "../shapes/rectangle.js"

const HALF = 2
const NO_Y = 0
const MAX_HUE = 255

export function renderHitmask(entity, ctx, api) {
  const { tileSize, columns, heights } = entity

  const [tileWidth, tileHeight] = tileSize
  const halfTileWidth = tileWidth / HALF
  const halfTileHeight = tileHeight / HALF

  const dRows = Math.ceil(heights.length / columns)
  const tilemapWidth = columns * tileWidth
  const tilemapHeight = dRows * tileHeight

  const offsetX = -tilemapWidth / HALF
  const offsetY = tilemapHeight / HALF

  const minH = 0
  const maxH = max(heights)

  ctx.save()

  ctx.translate(offsetX, offsetY)

  heights.forEach((h, index) => {
    const dx = (index % columns) * tileWidth
    const dy = Math.floor(index / columns) * tileHeight - tilemapHeight

    const normalizedH = (h - minH) / (maxH - minH)
    const hue = MAX_HUE - normalizedH * MAX_HUE

    ctx.save()

    const entity = {
      offset: [dx + halfTileWidth, NO_Y, -dy - halfTileHeight],
      size: [tileWidth, NO_Y, tileHeight],
      color: "transparent",
      backgroundColor: `hsla(${hue}, 100%, 50%, 0.2)`,
    }

    renderRectangle(entity, ctx, api)

    ctx.restore()
  })

  ctx.restore()
}
