import { createCoordinateConverter } from "@inglorious/renderer-2d/coordinates.js"
import { expect, test } from "vitest"

const GAME_WIDTH = 432
const GAME_HEIGHT = 243

// The middle of the game, which is where the canvas is centred whatever size it is.
const MIDDLE_X = GAME_WIDTH / 2
const MIDDLE_Y = GAME_HEIGHT / 2

const CORNERS = [
  [0, 0],
  [GAME_WIDTH, 0],
  [0, GAME_HEIGHT],
  [GAME_WIDTH, GAME_HEIGHT],
  [MIDDLE_X, MIDDLE_Y],
]

// The game drawn at its own size, twice as big, letterboxed either way round, and tall
// enough that there is room above and below it.
const CANVASES = [
  [GAME_WIDTH, GAME_HEIGHT],
  [GAME_WIDTH * 2, GAME_HEIGHT * 2],
  [1000, 1000],
  [300, 500],
  [GAME_WIDTH, 1000],
]

test("it should read a click back as the world position it was made on", () => {
  // Scaled, letterboxed, and both: the game is drawn into a canvas of some size and centred
  // in it, so where the game lands on the page changes and the world it describes does not.
  for (const [width, height] of CANVASES) {
    const { convert, clickAt } = onACanvas(width, height, DOWN_THE_PAGE)

    for (const [x, z] of CORNERS) {
      const [readX, , readZ] = convert(...clickAt(x, z))

      expect(
        [readX, readZ],
        `${x},${z} on a ${width}x${height} canvas`,
      ).toEqual([expect.closeTo(x, 6), expect.closeTo(z, 6)])
    }
  }
})

test("it should read a click outside the letterboxing as outside the game", () => {
  const [width, height] = CANVASES.at(-1)
  const { convert } = onACanvas(width, height)

  expect(convert(width / 2, 0)[2]).toBeGreaterThan(GAME_HEIGHT)
  expect(convert(width / 2, height)[2]).toBeLessThan(0)
})

test("it should count y up from the floor, as the world does", () => {
  const { convert, clickAt } = onACanvas(GAME_WIDTH, GAME_HEIGHT)

  expect(convert(...clickAt(0, 0))[2]).toBeCloseTo(0, 6)
  expect(convert(...clickAt(0, GAME_HEIGHT))[2]).toBeCloseTo(GAME_HEIGHT, 6)
})

test("it should take the page position into account", () => {
  // The same canvas, the same click, moved down the page: the world does not move with it.
  const here = onACanvas(GAME_WIDTH, GAME_HEIGHT)
  const there = onACanvas(GAME_WIDTH, GAME_HEIGHT, DOWN_THE_PAGE)

  expect(there.convert(...there.clickAt(MIDDLE_X, MIDDLE_Y))).toEqual(
    here.convert(...here.clickAt(MIDDLE_X, MIDDLE_Y)),
  )
})

test("it should read the middle of the game as the middle of the game", () => {
  const { convert } = onACanvas(GAME_WIDTH * 2, GAME_HEIGHT * 2)

  expect(convert(GAME_WIDTH, GAME_HEIGHT)).toEqual([
    expect.closeTo(MIDDLE_X, 6),
    0,
    expect.closeTo(MIDDLE_Y, 6),
  ])
})

const DOWN_THE_PAGE = 800

/**
 * A converter for a canvas of a given size, and the place the game lands on it.
 *
 * The canvas is described the way a browser describes one: `bottom` is how far down the
 * page its lower edge is, and the game is drawn into it, scaled to fit and centred.
 */
function onACanvas(width, height, left = 0) {
  const scale = Math.min(width / GAME_WIDTH, height / GAME_HEIGHT)
  const offsetX = (width - GAME_WIDTH * scale) / 2
  const offsetY = (height - GAME_HEIGHT * scale) / 2

  return {
    convert: createCoordinateConverter(
      {
        getBoundingClientRect: () => ({ left, bottom: height, width, height }),
      },
      { getEntity: () => ({ size: [GAME_WIDTH, GAME_HEIGHT] }) },
    ),
    /** Where a click has to be made for it to land on a world position. */
    clickAt: (x, z) => [
      left + x * scale + offsetX,
      height - (z * scale + offsetY),
    ],
  }
}
