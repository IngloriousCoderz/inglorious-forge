import { createStore } from "@inglorious/store"
import { mount } from "@inglorious/web"
import { afterEach, describe, expect, it, vi } from "vitest"

import { createOpenUI, uiLibrary } from "./index.js"

const COUNTER = `$count = 0
root = Stack([title, add, reset])
title = TextContent("Count: " + $count)
add = Button("Add", @Set($count, $count + 1))
reset = Button("Reset", @Reset($count), "secondary")
`

describe("createOpenUI", () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  it("renders a whole answer with Inglorious UI", async () => {
    const { container } = setup({ response: COUNTER })
    await flush()

    expect(container.textContent).toContain("Count: 0")
    expect(container.querySelectorAll(".iw-button")).toHaveLength(2)
  })

  it("renders an answer as it streams in, and settles at the end", async () => {
    const { store, container } = setup()

    store.notify("#answer:streamStart")
    store.notify("#answer:chunk", "root = Stack([title])\n")
    store.notify("#answer:chunk", 'title = TextContent("Hel')
    await flush()
    expect(store.getState().answer.isStreaming).toBe(true)
    expect(container.textContent).toContain("Hel")

    store.notify("#answer:chunk", 'lo")\n')
    store.notify("#answer:streamEnd")
    await flush()

    const answer = store.getState().answer
    expect(answer.isStreaming).toBe(false)
    expect(answer.errors).toEqual([])
    expect(container.textContent).toContain("Hello")
  })

  it("keeps the buttons disabled while streaming", async () => {
    const { store, container } = setup()

    store.notify("#answer:streamStart")
    store.notify("#answer:chunk", 'root = Stack([Button("Go")])\n')
    await flush()

    expect(container.querySelector("button").disabled).toBe(true)
  })

  it("runs @Set and @Reset as events on the entity", async () => {
    const { store, container } = setup({ response: COUNTER })
    await flush()

    const [add, reset] = container.querySelectorAll("button")
    add.click()
    add.click()
    await flush()
    expect(store.getState().answer.values).toEqual({ $count: 2 })
    expect(container.textContent).toContain("Count: 2")

    reset.click()
    await flush()
    expect(store.getState().answer.values).toEqual({})
    expect(container.textContent).toContain("Count: 0")
  })

  it("binds a field to a $variable both ways", async () => {
    const { store, container } = setup({
      response: `$query = "tea"
root = Stack([field, echo])
field = Input("search", "Search", "text", $query)
echo = TextContent("Searching " + $query)
`,
    })
    await flush()

    const input = container.querySelector("input")
    expect(input.value).toBe("tea")

    input.value = "coffee"
    input.dispatchEvent(new Event("input", { bubbles: true }))
    await flush()

    expect(store.getState().answer.values.$query).toBe("coffee")
    expect(container.textContent).toContain("Searching coffee")
  })

  it("announces what is for the app as openuiAction", async () => {
    const onAction = vi.fn()
    const { container } = setup({
      response: `$plan = "pro"
root = Stack([Button("Upgrade", Action([@Set($plan, "team"), @ToAssistant("Upgrade me")]))])
`,
      onAction,
    })
    await flush()

    container.querySelector("button").click()

    expect(onAction).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "answer",
        type: "continue_conversation",
        humanFriendlyMessage: "Upgrade me",
        // The @Set before it is already in the state it sends.
        formState: { $plan: "team" },
      }),
    )
  })

  it("sends a button without an action back as a message", async () => {
    const onAction = vi.fn()
    const { container } = setup({
      response: 'root = Stack([Button("Tell me more")])\n',
      onAction,
    })
    await flush()

    container.querySelector("button").click()

    expect(onAction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "continue_conversation",
        humanFriendlyMessage: "Tell me more",
      }),
    )
  })

  it("records validation errors once the answer is whole", () => {
    const { store } = setup({ response: "root = Stack([Nope()])\n" })

    expect(store.getState().answer.errors).toEqual([
      expect.objectContaining({ code: "unknown-component" }),
    ])
  })

  it("starts over on a new stream", async () => {
    const { store, container } = setup({ response: COUNTER })
    await flush()
    container.querySelector("button").click()

    store.notify("#answer:streamStart")
    await flush()

    const answer = store.getState().answer
    expect(answer.response).toBe("")
    expect(answer.values).toEqual({})
    expect(container.textContent.trim()).toBe("")
  })
})

function setup({ response, onAction } = {}) {
  const OpenUI = createOpenUI({ library: uiLibrary })
  const types = { OpenUI }
  if (onAction) types.Chat = { openuiAction: (_, event) => onAction(event) }

  const store = createStore({
    types,
    entities: {
      answer: { type: "OpenUI", response },
      ...(onAction && { chat: { type: "Chat" } }),
    },
  })

  const container = document.createElement("div")
  document.body.append(container)
  mount(store, (api) => api.render("answer"), container)
  return { store, container }
}

/** Lets the store apply queued events and the view re-render. */
function flush() {
  return new Promise((resolve) => setTimeout(resolve))
}
