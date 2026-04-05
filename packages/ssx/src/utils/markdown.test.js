import { describe, expect, it } from "vitest"

import { markdownPlugin, renderMarkdown } from "./markdown.js"

describe("renderMarkdown", () => {
  it("strips frontmatter and renders markdown content", () => {
    const html = renderMarkdown(`---
title: Talk 2
---

# Hello World

This is a markdown page.
`)

    expect(html).toContain("<h1>Hello World</h1>")
    expect(html).toContain("<p>This is a markdown page.</p>")
    expect(html).not.toContain("title: Talk 2")
  })
})

describe("markdownPlugin", () => {
  it("exports a unique named page module for each markdown file", async () => {
    const plugin = markdownPlugin()
    const code = `---
title: Talk 2
---

# Hello World
`

    const result = await plugin.transform(
      code,
      "/Users/iceonfire/Projects/ic/my-app/src/pages/talk2.md",
    )

    expect(result).toContain(`export const metadata = {"title":"Talk 2"}`)
    expect(result).toContain("export const Talk2 = {")
    expect(result).not.toContain("export default")
    expect(result).not.toContain("export const hydrate = false")
    expect(result).toContain("unsafeHTML")
  })

  it("converts kebab-case file names to PascalCase exports", async () => {
    const plugin = markdownPlugin()
    const code = `# Hello`

    const result = await plugin.transform(
      code,
      "/Users/iceonfire/Projects/ic/my-app/src/pages/hello-world.md",
    )

    expect(result).toContain("export const HelloWorld = {")
  })
})
