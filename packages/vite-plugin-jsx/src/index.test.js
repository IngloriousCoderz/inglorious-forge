import { describe, expect, it } from "vitest"

import { jsx } from "."

describe("index", () => {
  it("creates the Vite plugin entry point", () => {
    const plugin = jsx()

    expect(plugin.name).toBe("@inglorious/vite-plugin-jsx")
    expect(plugin.enforce).toBe("pre")
  })

  it("skips non-JSX files", async () => {
    const plugin = jsx()

    await expect(plugin.transform("const value = 1", "test.js")).resolves.toBe(
      null,
    )
  })

  it("transforms JSX files", async () => {
    const plugin = jsx()
    const result = await plugin.transform(
      "export const App = () => <div>Hello</div>",
      "test.tsx",
    )

    expect(result.code).toContain("html`<div>Hello</div>`")
  })
})
