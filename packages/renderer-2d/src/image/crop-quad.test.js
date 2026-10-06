import { expect, test } from "vitest"

import { cropQuad } from "./crop-quad.js"

const TILE = [32, 16]
const TILES_ACROSS = 6

const brick = (quad, extra) => ({ size: [32, 16, 0], ...extra })

test("it should point an entity at the first tile", () => {
  const entity = brick(0)

  cropQuad(entity, "breakout", 0, { tileSize: TILE, tilesAcross: TILES_ACROSS })

  expect(entity.sx).toBe(0)
  expect(entity.sy).toBe(0)
})

test("it should count along the row before turning down", () => {
  const entity = brick(5)

  cropQuad(entity, "breakout", 5, { tileSize: TILE, tilesAcross: TILES_ACROSS })

  expect(entity.sx).toBe(5)
  expect(entity.sy).toBe(0)
})

test("it should turn down once the row is used up", () => {
  // Six across means the seventh tile is the first of the second row, not anything
  // further along the first.
  const entity = brick(6)

  cropQuad(entity, "breakout", 6, { tileSize: TILE, tilesAcross: TILES_ACROSS })

  expect(entity.sx).toBe(0)
  expect(entity.sy).toBe(1)
})

test("it should count down the sheet for a tile further along", () => {
  const entity = brick(19)

  cropQuad(entity, "breakout", 19, {
    tileSize: TILE,
    tilesAcross: TILES_ACROSS,
  })

  expect(entity.sx).toBe(1)
  expect(entity.sy).toBe(3)
})

test("it should keep the grid and the region to read", () => {
  const entity = brick(3)

  cropQuad(entity, "breakout", 3, { tileSize: TILE, tilesAcross: TILES_ACROSS })

  expect(entity.image).toStrictEqual({
    id: "breakout",
    imageSize: [32, 16],
    tileSize: TILE,
    frameSize: [32, 16],
  })
})

test("it should keep whatever the image already carried", () => {
  const entity = brick(3, { image: { id: "breakout", scale: 2 } })

  cropQuad(entity, "breakout", 3, { tileSize: TILE, tilesAcross: TILES_ACROSS })

  expect(entity.image.scale).toBe(2)
})

test("it should read a sheet of whole tiles without being told how wide it is", () => {
  // 192 pixels of sheet in 32 pixel tiles is six across, which is the row width.
  const entity = brick(7, { image: { id: "breakout", imageSize: [192, 256] } })

  cropQuad(entity, "breakout", 7, { tileSize: TILE })

  expect(entity.sx).toBe(1)
  expect(entity.sy).toBe(1)
})

test("it should take its tile from the entity when told none", () => {
  // Hearts are 10x9 on a grid of their own, so a tile is the entity's own size.
  const entity = { size: [10, 9, 0] }

  cropQuad(entity, "hearts", 2, { tilesAcross: TILES_ACROSS })

  expect(entity.image.tileSize).toStrictEqual([10, 9])
  expect(entity.sx).toBe(2)
  expect(entity.sy).toBe(0)
})
