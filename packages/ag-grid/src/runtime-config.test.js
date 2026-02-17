import { describe, expect, it } from "vitest"

import { configureAgGrid, getAgGridRuntimeConfig } from "./runtime-config.js"

describe("runtime-config", () => {
  it("validates required createGrid function", () => {
    expect(() => configureAgGrid()).toThrow(/requires a createGrid function/)
    expect(() => configureAgGrid({})).toThrow(/requires a createGrid function/)
  })

  it("validates optional registerModules function", () => {
    expect(() =>
      configureAgGrid({
        createGrid: () => ({}),
        registerModules: "nope",
      }),
    ).toThrow(/registerModules must be a function/)
  })

  it("stores runtime configuration", () => {
    const createGrid = () => ({})
    const registerModules = () => {}

    configureAgGrid({
      createGrid,
      registerModules,
    })

    expect(getAgGridRuntimeConfig()).toEqual({
      createGrid,
      registerModules,
    })
  })
})
