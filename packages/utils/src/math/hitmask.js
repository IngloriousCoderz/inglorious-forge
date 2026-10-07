// @see https://jonathanwhiting.com/tutorial/collision/

import { isBetween } from "./number.js"
import { intersectsRectangle } from "./rectangle.js"

const FIRST = 0
const HALF = 2
const LAST = 1

export function findCollisions(hitmask, target) {
  const [tilemapX, tilemapY, tilemapZ] = hitmask.position
  const [tileWidth, tileDepth] = hitmask.tileSize
  const halfTileWidth = tileWidth / HALF
  const halfTileDepth = tileDepth / HALF

  const dRows = Math.ceil(hitmask.heights.length / hitmask.columns)
  const tilemapWidth = hitmask.columns * tileWidth
  const tilemapDepth = dRows * tileDepth

  const tilemapLeft = tilemapX - tilemapWidth / HALF
  const tilemapBack = tilemapZ - tilemapDepth / HALF

  const [targetX, , targetZ] = target.position
  const [targetWidth, , targetDepth] = target.size
  const targetHalfWidth = targetWidth / HALF
  const targetHalfDepth = targetDepth / HALF

  const targetLeft = targetX - targetHalfWidth
  const targetRight = targetX + targetHalfWidth
  const targetBack = targetZ - targetHalfDepth
  const targetFront = targetZ + targetHalfDepth

  const minTileX = Math.floor((targetLeft - tilemapLeft) / tileWidth)
  const maxTileX = Math.floor((targetRight - tilemapLeft) / tileWidth)
  const minTileZ = Math.floor((targetBack - tilemapBack) / tileDepth)
  const maxTileZ = Math.floor((targetFront - tilemapBack) / tileDepth)

  for (let i = minTileX; i <= maxTileX; i++) {
    for (let j = minTileZ; j <= maxTileZ; j++) {
      if (
        !isBetween(i, FIRST, hitmask.columns - LAST) ||
        !isBetween(j, FIRST, dRows - LAST)
      ) {
        continue
      }

      const invertedRow = dRows - LAST - j
      const tileIndex = invertedRow * hitmask.columns + i
      const tileHeightValue = hitmask.heights[tileIndex]

      if (tileHeightValue) {
        const tileRectangle = {
          position: [
            tilemapLeft + i * tileWidth + halfTileWidth,
            tilemapY,
            tilemapBack + j * tileDepth + halfTileDepth,
          ],
          size: [tileWidth, tileHeightValue, tileDepth],
        }

        if (intersectsRectangle(target, tileRectangle)) {
          return true
        }
      }
    }
  }

  return false
}
