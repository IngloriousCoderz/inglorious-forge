import { createStore } from "@inglorious/store"
import { mount } from "@inglorious/web"
import { afterEach, describe, expect, it, vi } from "vitest"
import { z } from "zod"

import { createOpenUI, createParser, defineComponent } from "../index.js"
import { uiExamples, uiLibrary } from "./index.js"

describe("uiLibrary", () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  it("describes its components to the model", () => {
    const prompt = uiLibrary.prompt()

    for (const name of ["Stack", "Card", "TextContent", "Button", "Table"]) {
      expect(prompt).toContain(`${name}(`)
    }
  })

  it("ships examples that parse cleanly", () => {
    const parser = createParser(uiLibrary.toJSONSchema(), uiLibrary.root)

    for (const example of uiExamples) {
      const { root, meta } = parser.parse(example)
      expect(root).not.toBeNull()
      expect(meta.errors).toEqual([])
      expect(meta.orphaned).toEqual([])
    }
  })

  it("turns a column-oriented Table into rows", async () => {
    const container = await renderAnswer(`root = Stack([tbl])
tbl = Table([Col("Name", ["Ada", "Alan"]), Col("Born", [1815, 1912], "number")])
`)

    const rows = [...container.querySelectorAll("tbody tr")].map((row) =>
      [...row.querySelectorAll("td")].map((cell) => cell.textContent.trim()),
    )
    expect(rows).toEqual([
      ["Ada", "1815"],
      ["Alan", "1912"],
    ])
    expect(container.querySelector("th").textContent.trim()).toBe("Name")
  })

  it("renders components inside table cells", async () => {
    const container = await renderAnswer(
      'root = Stack([Table([Col("Status", [Tag("Open", null, "sm", "success")])])])\n',
    )

    expect(container.querySelector("td .iw-chip").textContent.trim()).toBe(
      "Open",
    )
  })

  it("hides a Callout that is not visible", async () => {
    const container = await renderAnswer(`$saved = false
root = Stack([Callout("success", "Saved", "All done", $saved)])
`)

    expect(container.querySelector(".iw-alert")).toBeNull()
  })

  it("lays a Card out with its children", async () => {
    const container = await renderAnswer(
      'root = Stack([Card([CardHeader("Revenue", "This month"), TextContent("€12,400", "large-heavy")])])\n',
    )

    const card = container.querySelector(".iw-card")
    expect(card.textContent).toContain("Revenue")
    expect(card.textContent).toContain("€12,400")
  })

  it("leaves out a component that throws, and renders the rest", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const Broken = defineComponent({
      name: "Broken",
      description: "Always fails",
      props: z.object({}),
      component: () => {
        throw new Error("boom")
      },
    })
    const library = uiLibrary.extend({ components: { add: [Broken] } })

    const container = await renderAnswer(
      'root = Stack([Broken(), TextContent("Still here")])\n',
      library,
    )

    expect(container.textContent).toContain("Still here")
    expect(error).toHaveBeenCalled()
    error.mockRestore()
  })
})

async function renderAnswer(response, library = uiLibrary) {
  const store = createStore({
    types: { OpenUI: createOpenUI({ library }) },
    entities: { answer: { type: "OpenUI", response } },
  })
  const container = document.createElement("div")
  document.body.append(container)
  mount(store, (api) => api.render("answer"), container)
  await new Promise((resolve) => setTimeout(resolve))
  return container
}
