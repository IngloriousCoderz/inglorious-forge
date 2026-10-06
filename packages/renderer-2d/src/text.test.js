import { expect, test } from "vitest"

import { renderText } from "./text.js"

function createContext() {
  const state = {}
  const calls = []

  return {
    calls,
    state,
    ctx: {
      save: () => calls.push(["save"]),
      restore: () => calls.push(["restore"]),
      fillText: (...args) => calls.push(["fillText", ...args]),
      set font(value) {
        state.font = value
      },
      set fillStyle(value) {
        state.fillStyle = value
      },
      set textAlign(value) {
        state.textAlign = value
      },
      set textBaseline(value) {
        state.textBaseline = value
      },
    },
  }
}

test("it should draw an empty string by default", () => {
  const { calls, ctx } = createContext()

  renderText({}, ctx)

  expect(calls).toStrictEqual([["save"], ["fillText", "", 0, 0], ["restore"]])
})

test("it should anchor the text to its top edge", () => {
  const { state, ctx } = createContext()

  renderText({ value: "Score" }, ctx)

  expect(state.textBaseline).toBe("top")
})

test("it should anchor the text wherever the entity asks", () => {
  const { state, ctx } = createContext()

  renderText({ value: "GAME OVER", baseline: "middle" }, ctx)

  expect(state.textBaseline).toBe("middle")
})

test("it should say the baselines it can take", () => {
  // These are the names the canvas gives, so passing one through costs nothing and
  // naming them here is what keeps the default from being the only one that works.
  const { state, ctx } = createContext()

  for (const baseline of ["top", "hanging", "middle", "alphabetic", "bottom"]) {
    renderText({ value: "Score", baseline }, ctx)

    expect(state.textBaseline).toBe(baseline)
  }
})

test("it should lay out the lines by their line height", () => {
  const { calls, ctx } = createContext()

  renderText({ value: "Oof! You lost!\nPress Enter", lineHeight: 30 }, ctx)

  expect(calls).toStrictEqual([
    ["save"],
    ["fillText", "Oof! You lost!", 0, 0],
    ["fillText", "Press Enter", 0, 30],
    ["restore"],
  ])
})

test("it should default the line height to the font size", () => {
  const { calls, ctx } = createContext()

  renderText({ value: "a\nb", size: 12 }, ctx)

  expect(calls.filter(([name]) => name === "fillText")).toStrictEqual([
    ["fillText", "a", 0, 0],
    ["fillText", "b", 0, 12],
  ])
})

test("it should apply the font, the color and the alignment", () => {
  const { state, ctx } = createContext()

  renderText(
    {
      value: "Fifty Bird",
      size: 28,
      font: "'Flappy'",
      color: "white",
      textAlign: "center",
    },
    ctx,
  )

  expect(state).toStrictEqual({
    font: "28px 'Flappy'",
    fillStyle: "white",
    textAlign: "center",
    textBaseline: "top",
  })
})
