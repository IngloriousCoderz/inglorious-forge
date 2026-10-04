import { v } from "@inglorious/utils/v.js"
import { expect, test } from "vitest"

import { infiniteScroll } from "./infinite-scroll.js"

function scroll(entity, dt, game = {}) {
  infiniteScroll().update(entity, dt, {
    getEntity: () => game,
  })
}

const entity = () => ({
  position: v(0, 0, 0),
  velocity: v(-30, 0, 0),
  image: { loop: v(413, 0, 0) },
})

test("it should scroll and wrap around the loop", () => {
  const scrolling = entity()

  scroll(scrolling, 10)

  expect(scrolling.position).toStrictEqual(v(113, 0, 0))
})

test("it should keep scrolling on the other axes without a loop", () => {
  const scrolling = entity()

  scroll(scrolling, 2)

  expect(scrolling.position).toStrictEqual(v(353, 0, 0))
})

test("it should not scroll while the game is paused", () => {
  const scrolling = entity()
  const initial = [...scrolling.position]

  scroll(scrolling, 10, { paused: true })

  expect(scrolling.position).toStrictEqual(v(...initial))
})

test("it should scroll again once the game is resumed", () => {
  const scrolling = entity()

  scroll(scrolling, 10, { paused: true })
  scroll(scrolling, 10)

  expect(scrolling.position).toStrictEqual(v(113, 0, 0))
})
