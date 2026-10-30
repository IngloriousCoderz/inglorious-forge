import { afterEach, describe, expect, it, vi } from "vitest"

import { flush, setup } from "../test-helpers.js"

describe("Content components", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.body.replaceChildren()
  })

  it("draws Card's surfaces, and lays its children out", async () => {
    const { container } = await setup({
      response: `root = Stack([Card([TextContent("A")], "sunk", "row"), Card([TextContent("B")], "clear")])
`,
    })

    expect(
      container.querySelector(".iw-card-sunk .iw-flex-direction-row"),
    ).not.toBeNull()
    expect(container.querySelector(".iw-card-clear")).not.toBeNull()
  })

  it("shows a neutral Callout while its $variable is true", async () => {
    const { container } = await setup({
      response: `$shown = true
root = Stack([Callout("neutral", "Note", "Just so you know", $shown), Button("Hide", @Set($shown, false))])
`,
    })
    expect(container.querySelector(".iw-alert-neutral")).not.toBeNull()

    container.querySelector(".iw-button").click()
    await flush()

    expect(container.querySelector(".iw-alert")).toBeNull()
  })

  it("clears a Callout's $variable after three seconds, as OpenUI does", async () => {
    const { store, container } = await setup({
      response: `$saved = false
root = Stack([Callout("success", "Saved", "All done", $saved), Button("Save", @Set($saved, true))])
`,
    })
    vi.useFakeTimers()
    try {
      container.querySelector(".iw-button").click()
      await vi.advanceTimersByTimeAsync(0)
      expect(container.querySelector(".iw-alert-success")).not.toBeNull()

      await vi.advanceTimersByTimeAsync(2999)
      expect(store.getState().answer.values.$saved).toBe(true)

      await vi.advanceTimersByTimeAsync(1)
      expect(store.getState().answer.values.$saved).toBe(false)
      expect(container.querySelector(".iw-alert")).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })

  it("leaves a Callout with no $variable on screen", async () => {
    const { container } = await setup({
      response: `root = Stack([Callout("info", "Note", "Stays")])
`,
    })
    vi.useFakeTimers()
    try {
      await vi.advanceTimersByTimeAsync(5000)
      expect(container.querySelector(".iw-alert-info")).not.toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })

  it("draws a Tag's Icon from the app's icons", async () => {
    const check = { body: '<path d="M0 0h1"/>', width: 24, height: 24 }
    const { container } = await setup({
      icons: { "circle-check": check },
      response: `root = Stack([Tag("Paid", Icon("circle-check"), "sm", "success"), Icon("unknown")])
`,
    })

    expect(container.querySelectorAll(".iw-chip-icon svg")).toHaveLength(1)
    expect(container.querySelectorAll("svg")).toHaveLength(1)
  })

  it("finds icons in an Iconify collection, aliases included", async () => {
    const lucide = {
      prefix: "lucide",
      width: 24,
      height: 24,
      icons: { rocket: { body: '<path d="M1 1h1"/>' } },
      aliases: { launch: { parent: "rocket" } },
    }
    const { container } = await setup({
      icons: lucide,
      response: 'root = Stack([Icon("rocket"), Icon("launch")])\n',
    })

    expect(container.querySelectorAll("svg")).toHaveLength(2)
  })

  it("draws text blocks: TextCallout, InlineHeader, CodeBlock, TagBlock, Label", async () => {
    const { container } = await setup({
      response: `root = Stack([note, head, code, tags, label])
note = TextCallout("danger", "Careful", "This cannot be undone")
head = InlineHeader("Totals", "This month")
code = CodeBlock("js", "const a = 1 < 2")
tags = TagBlock(["Vegan", "Spicy"], "md")
label = Label("Diet")
`,
    })

    expect(container.querySelector(".iw-alert-error").textContent).toContain(
      "Careful",
    )
    expect(container.textContent).toContain("This month")
    expect(container.querySelector("pre code.language-js").textContent).toBe(
      "const a = 1 < 2",
    )
    expect(container.querySelectorAll(".iw-chip")).toHaveLength(2)
    expect(container.textContent).toContain("Diet")
  })

  it("opens a gallery image in a dialog, with its details", async () => {
    const { store, container } = await setup({
      response: `root = Stack([ImageBlock("cover.jpg", "Cover"), gallery])
gallery = ImageGallery([{src: "a.jpg", alt: "Lake", details: "At dawn"}, {src: "b.jpg", alt: "Hill"}])
`,
    })
    expect(container.querySelector('img[alt="Cover"]')).not.toBeNull()

    container.querySelector('button[aria-label="Open Lake"]').click()
    await flush()

    expect(store.getState().answer.view["gallery:preview"]).toBe(0)
    const dialog = container.querySelector("dialog")
    expect(dialog.open).toBe(true)
    expect(dialog.textContent).toContain("At dawn")
  })
})

describe("Markdown", () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  it("renders inline markdown in TextContent and Callout descriptions", async () => {
    const { container } = await setup({
      response: `root = Stack([TextContent("Spent **€900** on *rent*"), Callout("info", "Tip", "Run \`npm test\` first")])
`,
    })

    expect(container.querySelector("strong").textContent).toBe("€900")
    expect(container.querySelector("em").textContent).toBe("rent")
    expect(container.querySelector(".iw-alert code").textContent).toBe(
      "npm test",
    )
    expect(container.querySelector("p p")).toBeNull()
  })

  it("renders block markdown in MarkDownRenderer, on a surface when asked", async () => {
    const { container } = await setup({
      response: `root = MarkDownRenderer("## Plan\n\n- Book flights\n- Pack", "sunk")
`,
    })

    expect(container.querySelector(".iw-card-sunk h2").textContent).toBe("Plan")
    expect(container.querySelectorAll("li")).toHaveLength(2)
  })

  it("escapes HTML and refuses script links", async () => {
    const { container } = await setup({
      response: `root = MarkDownRenderer("<img src=x onerror=alert(1)> [click](javascript:alert(1)) [ok](https://example.com)")
`,
    })

    expect(container.querySelector("img")).toBeNull()
    expect(container.textContent).toContain("<img src=x")
    const links = [...container.querySelectorAll("a")]
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "https://example.com",
    ])
    expect(links[0].getAttribute("target")).toBe("_blank")
    expect(links[0].getAttribute("rel")).toBe("noopener noreferrer")
  })
})
