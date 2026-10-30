import { describe, expect, it } from "vitest"

import css from "./style.css?raw"

describe("view-transitions stylesheet", () => {
  it("reads the stylesheet it is guarding", () => {
    expect(css.length).toBeGreaterThan(0)
  })

  it("glues the transition pseudo-elements onto the type selector", () => {
    const descendant = css.match(/:\S*\)\s+::view-transition/g) ?? []
    expect(descendant).toEqual([])
  })

  it("covers every type the wrapper can tag a transition with", () => {
    for (const type of ["forward", "back", "replace"]) {
      expect(css).toContain(
        `:root:active-view-transition-type(${type})::view-transition-old(root)`,
      )
      expect(css).toContain(
        `:root:active-view-transition-type(${type})::view-transition-new(root)`,
      )
    }
  })

  it("keeps the animations behind the reduced motion opt-in", () => {
    expect(css).toContain("@media (prefers-reduced-motion: no-preference)")
  })
})
