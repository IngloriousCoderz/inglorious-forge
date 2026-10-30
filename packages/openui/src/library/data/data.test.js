import { afterEach, describe, expect, it, vi } from "vitest"

import { buttonNamed, choose, flush, setup, type } from "../test-helpers.js"

describe("Tables and lists", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.body.replaceChildren()
  })

  it("lists label and value pairs, with a header and footer only at default size", async () => {
    const rows = `[{left: "Coffee", right: "3.50", rightVariant: "number"}]`
    const ends = `{left: "Item", right: "Price"}, {left: "Total", right: "3.50"}`
    const { container } = await setup({
      response: `root = Stack([EntityList(${rows}, "default", ${ends}), EntityList(${rows}, "small")])
`,
    })

    const text = container.textContent
    expect(text.match(/Coffee/g)).toHaveLength(2)
    expect(text.match(/Total/g)).toHaveLength(1)
  })

  it("lists ListItems, with a button for the ones that act", async () => {
    const onAction = vi.fn()
    const { container } = await setup({
      onAction,
      response: `root = ListBlock([ListItem("Rome", "Italy", null, "Visit", @ToAssistant("Plan Rome")), ListItem("Paris")])
`,
    })

    expect(container.querySelector("ol")).not.toBeNull()
    const buttons = container.querySelectorAll(".iw-button")
    expect(buttons).toHaveLength(1)
    buttons[0].click()
    await flush()

    expect(onAction).toHaveBeenCalledWith(
      expect.objectContaining({ humanFriendlyMessage: "Plan Rome" }),
    )
  })
})

describe("EditableTable", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.body.replaceChildren()
  })

  const PRICES = `root = EditableTable("prices", [{type: "text", key: "item", header: "Item"}, {type: "number", key: "price", header: "Price"}, {type: "select", key: "size", header: "Size", options: [{value: "s", label: "Small"}, {value: "l", label: "Large"}]}], [{id: "1", values: ["Coffee", 3.5, "s"]}, {id: "2", values: ["Tea", 2, "l"]}])
`

  it("puts a field in every cell, named by its column", async () => {
    const { container } = await setup({ response: PRICES })

    expect(container.querySelectorAll('input[aria-label="Item"]')).toHaveLength(
      2,
    )
    expect(container.querySelector('input[aria-label="Price"]').type).toBe(
      "number",
    )
    expect(
      container.querySelectorAll('select[aria-label="Size"]'),
    ).toHaveLength(2)
    expect(container.textContent).not.toContain("Save Changes")
  })

  it("counts edits, and resets them", async () => {
    const { store, container } = await setup({ response: PRICES })

    type(container.querySelectorAll('input[aria-label="Price"]')[1], "2.5")
    await flush()
    choose(container.querySelector("select"), "l")
    await flush()

    expect(container.textContent).toContain("2 changes")
    expect(store.getState().answer.values).toEqual({})

    buttonNamed(container, "Reset").click()
    await flush()

    expect(container.textContent).not.toContain("changes")
    expect(
      container.querySelectorAll('input[aria-label="Price"]')[1].value,
    ).toBe("2")
  })

  it("keeps a column named id apart from the rows' own ids", async () => {
    const { store, container } = await setup({
      response: `root = EditableTable("codes", [{type: "text", key: "id", header: "Code"}], [{id: "r1", values: ["A-1"]}])
`,
    })

    type(container.querySelector('input[aria-label="Code"]'), "B-2")
    await flush()
    buttonNamed(container, "Save Changes").click()
    await flush()

    expect(store.getState().answer.values).toEqual({
      codes: { codes: [{ id: "r1", values: ["B-2"] }] },
    })
  })

  it("saves the rows under the table's name and sends them", async () => {
    const onAction = vi.fn()
    const { store, container } = await setup({ response: PRICES, onAction })

    type(container.querySelector('input[aria-label="Item"]'), "Espresso")
    await flush()
    buttonNamed(container, "Save Changes").click()
    await flush()

    const rows = [
      { id: "1", values: ["Espresso", 3.5, "s"] },
      { id: "2", values: ["Tea", 2, "l"] },
    ]
    expect(store.getState().answer.values).toEqual({
      prices: { prices: rows },
    })
    expect(onAction).toHaveBeenCalledWith(
      expect.objectContaining({
        humanFriendlyMessage: "Save Changes",
        formName: "prices",
        formState: { prices: { prices: rows } },
      }),
    )
    expect(container.textContent).not.toContain("Save Changes")
  })
})
