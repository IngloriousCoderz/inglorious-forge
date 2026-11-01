import { describe, expect, it } from "vitest"

import tokens from "../../styles/tokens.css?raw"
import css from "./style.css?raw"

describe("accordion stylesheet", () => {
  it("keeps the opening and closing animation behind the reduced motion opt-in", () => {
    const [beforeOptIn] = css.split(
      "@media (prefers-reduced-motion: no-preference)",
    )
    expect(css).toContain("@media (prefers-reduced-motion: no-preference)")
    expect(beforeOptIn).not.toContain("::details-content")
  })

  it("animates with transition tokens that exist", () => {
    const used = new Set(css.match(/--iw-transition-[a-z]+/g))
    expect(used.size).toBeGreaterThan(0)
    for (const token of used) {
      expect(tokens).toContain(`${token}:`)
    }
  })
})
