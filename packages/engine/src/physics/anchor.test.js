import { expect, test } from "vitest"

const X = 0
const Y = 1

import {
  anchorMargins,
  anchorOffset,
  entityAnchor,
  shapeAnchor,
} from "./anchor.js"

test("it should centre a box by default", () => {
  expect(anchorOffset(undefined, [70, 24, 10])).toStrictEqual([0, 0, 0])
  expect(anchorOffset([0.5, 0.5], [70, 24, 10])).toStrictEqual([0, 0, 0])
})

test("it should shift a box off the point it hangs from", () => {
  // A `[0, 0]` anchor leaves the box to the right of and above the position, so
  // it stands on that point rather than straddling it.
  expect(anchorOffset([0, 0], [70, 24, 0])).toStrictEqual([35, 12, 0])
  expect(anchorOffset([1, 0], [70, 24, 0])).toStrictEqual([-35, 12, 0])
  // The far corner, which leaves the box below and to the left.
  expect(anchorOffset([0, 1], [70, 24, 0])).toStrictEqual([35, -12, 0])
  expect(anchorOffset([1, 1], [70, 24, 0])).toStrictEqual([-35, -12, 0])
})

test("every axis should shift the same way", () => {
  // The point of counting anchors from the low end of each axis: there is no
  // vertical special case to remember.
  const [x, y, z] = anchorOffset([0, 0, 0], [70, 24, 10])

  expect([x, y, z]).toStrictEqual([35, 12, 5])
})

test("it should shift the depth axis when given a third coordinate", () => {
  expect(anchorOffset([0.5, 0, 1], [70, 24, 10])).toStrictEqual([0, 12, -5])
  expect(anchorOffset([0.5, 0, 0], [70, 24, 10])).toStrictEqual([0, 12, 5])
})

test("it should read a missing depth coordinate as centred", () => {
  expect(anchorOffset([0, 1], [70, 24, 10])).toStrictEqual(
    anchorOffset([0, 1, 0.5], [70, 24, 10]),
  )
})

test("it should cope with no size at all", () => {
  expect(anchorOffset([0, 1], undefined)).toHaveLength(3)
  expect(anchorOffset([0, 1], undefined).every(Number.isFinite)).toBe(true)
})

test("it should report the room a box needs on either side", () => {
  expect(anchorMargins([0.5, 0.5], [10, 10, 0])).toStrictEqual({
    before: [5, 5, 0],
    after: [5, 5, 0],
  })
  // Nothing below a box anchored at its bottom, all of it above.
  expect(anchorMargins([0, 0], [10, 10, 0])).toStrictEqual({
    before: [0, 0, 0],
    after: [10, 10, 0],
  })
  // And the other way round for one anchored at its top.
  expect(anchorMargins([0, 1], [10, 10, 0])).toStrictEqual({
    before: [0, 10, 0],
    after: [10, 0, 0],
  })
})

test("an anchored box takes the same room on both sides combined", () => {
  const { before, after } = anchorMargins([0.25, 0.75], [10, 10, 0])

  expect(before[X] + after[X]).toBe(10)
  expect(before[Y] + after[Y]).toBe(10)
})

test("it should fall back to the sprite anchor, then to the centre", () => {
  expect(entityAnchor({ anchor: [0, 1] })).toStrictEqual([0, 1])
  expect(entityAnchor({ image: { anchor: [1, 0] } })).toStrictEqual([1, 0])
  expect(
    entityAnchor({ anchor: [0, 1], image: { anchor: [1, 0] } }),
  ).toStrictEqual([0, 1])
  expect(entityAnchor({})).toStrictEqual([0.5, 0.5, 0.5])
})

test("a collision shape should win over the entity it belongs to", () => {
  const entity = { anchor: [0, 1], image: { anchor: [0, 0.5] } }

  expect(shapeAnchor(entity, {})).toStrictEqual([0, 1])
  expect(shapeAnchor(entity, { anchor: [0.5, 0] })).toStrictEqual([0.5, 0])
})

test("a collision shape should inherit the sprite anchor", () => {
  const entity = { image: { anchor: [0, 1] } }

  expect(shapeAnchor(entity, {})).toStrictEqual([0, 1])
})
