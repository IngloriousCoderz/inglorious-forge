import { expect, test } from "vitest"

import { crop } from "./crop.js"

test("it should point an entity at a frame of a sheet", () => {
  const entity = { image: { id: "the game" } }

  crop(entity, "the game", {
    x: 96,
    y: 48,
    width: 8,
    height: 8,
    tileSize: [32, 16],
  })

  expect(entity.image).toStrictEqual({
    id: "the game",
    imageSize: [8, 8],
    tileSize: [32, 16],
    frameSize: [8, 8],
  })
  // Pixels are divided down to the sheet's grid, because the renderer multiplies them
  // back up by it when it draws.
  expect([entity.sx, entity.sy]).toStrictEqual([3, 3])
})

test("it should read a frame wider than one tile", () => {
  const entity = {}

  // This one is 64 wide on a 32 wide grid, so it covers the cell after it too.
  crop(entity, "the game", {
    x: 32,
    y: 64,
    width: 64,
    height: 16,
    tileSize: [32, 16],
  })

  expect(entity.image.frameSize).toStrictEqual([64, 16])
  expect(entity.sx).toBe(1)
})

test("it should fall back to the entity's own size", () => {
  const entity = { size: [16, 16] }

  crop(entity, "pipe", { x: 0, y: 32, tileSize: [16, 16] })

  expect(entity.image.imageSize).toStrictEqual([16, 16])
  expect(entity.image.frameSize).toStrictEqual([16, 16])
  expect(entity.sy).toBe(2)
})

test("it should keep whatever the image already carried", () => {
  const entity = { image: { id: "the game", scale: 2 } }

  crop(entity, undefined, { x: 0, y: 0, width: 8, height: 8 })

  expect(entity.image.id).toBe("the game")
  expect(entity.image.scale).toBe(2)
})

test("it should read the right pixels off a sheet with no grid given", () => {
  const entity = {}

  // Without a grid the frame is its own tile, so the offsets come out as indices the
  // renderer multiplies back up. What matters is the pixel it lands on, not the index.
  crop(entity, "the game", { x: 96, y: 48, width: 8, height: 8 })

  const [tileWidth, tileHeight] = entity.image.tileSize

  expect([entity.sx * tileWidth, entity.sy * tileHeight]).toStrictEqual([
    96, 48,
  ])
})

test("it should return the entity so it can be used inline", () => {
  const entity = {}

  expect(crop(entity, "the game", { width: 8, height: 8 })).toBe(entity)
})
