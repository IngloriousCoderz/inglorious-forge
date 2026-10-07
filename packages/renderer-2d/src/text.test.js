import { expect, test } from "vitest"

import { renderText, text } from "./text.js"

test("it should say what it was given", () => {
  const entity = {}

  text({ value: "BREAKOUT" }).create(entity)

  expect(entity.value).toBe("BREAKOUT")
})

test("it should default the parts a caller leaves out", () => {
  const entity = {}

  text({ value: "Score:" }).create(entity)

  expect(entity.size).toBe(16)
  expect(entity.color).toBe("black")
  expect(entity.font).toBe("sans-serif")
  expect(entity.textAlign).toBe("left")
  expect(entity.baseline).toBe("top")
})

test("it should take every part it is given", () => {
  const entity = {}

  text({
    baseline: "middle",
    color: "white",
    font: "'Breakout'",
    size: 32,
    textAlign: "center",
    value: "Level 3",
  }).create(entity)

  expect(entity).toEqual({
    baseline: "middle",
    color: "white",
    font: "'Breakout'",
    size: 32,
    textAlign: "center",
    value: "Level 3",
  })
})

test("it should render one line per newline", () => {
  const drawn = []
  const ctx = {
    font: "",
    fillStyle: "",
    textAlign: "",
    textBaseline: "",
    fillText: (...args) => drawn.push(args),
    save() {},
    restore() {},
  }

  renderText({ value: "one\ntwo", size: 10 }, ctx)

  expect(drawn).toEqual([
    ["one", 0, 0],
    ["two", 0, 10],
  ])
})
