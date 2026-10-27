import { afterEach, describe, expect, it, vi } from "vitest"

import { setup } from "../test-helpers.js"
import { chatLibrary, chatRules } from "./index.js"

describe("chatLibrary", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.body.replaceChildren()
  })

  const ANSWER = `root = Card([header, intro, sections], [{title: "Visitors 2024", sourceName: "Tourist Office", url: "https://example.com/visitors"}, {title: "Bad", sourceName: "Nowhere", url: "javascript:alert(1)"}])
header = CardHeader("Paris")
intro = TextContent("48.7 million visitors [1], or so says [2].")
sections = SectionBlock([SectionItem("food", "Food", [TextContent("Bistros")]), SectionItem("when", "When to go", [TextContent("Spring")])])
`

  it("answers in one Card, its sources listed below and cited in the text", async () => {
    const { container } = await setup({
      library: chatLibrary,
      response: ANSWER,
    })

    const [citation] = [...container.querySelectorAll("a")].filter(
      (link) => link.textContent === "[1]",
    )
    expect(citation.getAttribute("href")).toBe("https://example.com/visitors")
    expect(citation.getAttribute("title")).toBe("Tourist Office")
    // A source with no web link is listed, but not linked.
    const listed = container.querySelectorAll("footer li")
    expect(listed).toHaveLength(2)
    expect(listed[1].querySelector("a")).toBeNull()
    expect(container.textContent).toContain("or so says [2].")
    expect(container.innerHTML).not.toContain("javascript")
  })

  it("opens only the first section once the answer is whole", async () => {
    const { container } = await setup({
      library: chatLibrary,
      response: ANSWER,
    })

    const [food, when] = container.querySelectorAll("details")
    expect(food.open).toBe(true)
    expect(when.open).toBe(false)
  })

  it("has no Stack, and Card as its root", () => {
    expect(chatLibrary.root).toBe("Card")
    expect(chatLibrary.components.Stack).toBeUndefined()
    expect(chatLibrary.prompt({ additionalRules: chatRules })).toContain(
      "SectionBlock",
    )
  })
})
