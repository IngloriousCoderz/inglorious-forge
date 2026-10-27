import { afterEach, describe, expect, it, vi } from "vitest"

import { flush, setup } from "../test-helpers.js"

describe("Layout components", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.body.replaceChildren()
  })

  it("switches Tabs without telling the model", async () => {
    const { store, container } = await setup({
      response: `root = Stack([Tabs([TabItem("a", "First", [TextContent("Alpha")]), TabItem("b", "Second", [TextContent("Beta")])])])
`,
    })
    expect(container.querySelector(".iw-tab-panel").textContent).toContain(
      "Alpha",
    )

    container.querySelectorAll(".iw-tab")[1].click()
    await flush()

    expect(container.querySelector(".iw-tab-panel").textContent).toContain(
      "Beta",
    )
    expect(store.getState().answer.values).toEqual({})
  })

  it("opens Accordion sections", async () => {
    const { container } = await setup({
      response: `root = Stack([Accordion([AccordionItem("q1", "Why?", [TextContent("Because")])])])
`,
    })
    const details = container.querySelector("details")
    expect(details.open).toBe(false)

    details.dispatchEvent(
      Object.assign(new Event("toggle"), { newState: "open" }),
    )
    await flush()

    expect(container.querySelector("details").open).toBe(true)
  })

  it("lists Steps", async () => {
    const { container } = await setup({
      response: `root = Stack([Steps([StepsItem("Sign up", "With your email"), StepsItem("Confirm")])])
`,
    })

    expect(container.textContent).toContain("Sign up")
    expect(container.textContent).toContain("With your email")
    expect(container.textContent).toContain("Confirm")
  })

  it("opens a Modal from its $variable, and closes it back", async () => {
    const { store, container } = await setup({
      response: `$editing = false
root = Stack([Button("Edit", @Set($editing, true)), Modal("Edit name", $editing, [TextContent("Inside")])])
`,
    })
    expect(container.querySelector("dialog").open).toBe(false)

    container.querySelector(".iw-button").click()
    await flush()
    expect(store.getState().answer.values.$editing).toBe(true)
    expect(container.querySelector("dialog").open).toBe(true)

    container.querySelector(".iw-dialog-close").click()
    await flush()
    expect(store.getState().answer.values.$editing).toBe(false)
  })

  it("takes OpenUI's Separator, Modal and Select options", async () => {
    const { container } = await setup({
      response: `root = Stack([Separator("horizontal", true), Modal("Big", true, [TextContent("x")], "lg"), Select("s", [SelectItem("a", "A")], "Pick", null, null, "small")])
`,
    })

    expect(container.querySelector("hr").getAttribute("role")).toBe("none")
    expect(container.querySelector("dialog.iw-dialog-lg")).not.toBeNull()
    expect(container.querySelector(".iw-select-sm")).not.toBeNull()
  })

  it("lays slides out in a Carousel, each on a card", async () => {
    const { container } = await setup({
      response: `root = Carousel([[TextContent("One")], [TextContent("Two")]], "sunk")
`,
    })

    expect(container.querySelectorAll(".iw-carousel-item")).toHaveLength(2)
    expect(container.querySelectorAll(".iw-card-sunk")).toHaveLength(2)
  })
})
