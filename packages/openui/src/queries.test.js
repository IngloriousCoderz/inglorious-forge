import { createStore } from "@inglorious/store"
import { mount } from "@inglorious/web"
import { afterEach, describe, expect, it, vi } from "vitest"

import { createOpenUI, uiLibrary } from "./index.js"

const ORDERS = `$status = "paid"
orders = Query("list_orders", {status: $status}, {rows: []})
root = Stack([status, count, tbl])
status = Input("status", "Status", "text", null, $status)
count = TextContent("Orders: " + @Count(orders.rows))
tbl = Table([Col("Customer", orders.rows.customer), Col("Total", orders.rows.total, "number")])
`

const ROWS = {
  paid: [
    { customer: "Ada", total: 1200 },
    { customer: "Grace", total: 2310 },
  ],
  due: [{ customer: "Alan", total: 860 }],
}

describe("queries and mutations", () => {
  afterEach(() => {
    vi.useRealTimers()
    document.body.replaceChildren()
  })

  it("shows a query's defaults, then its data", async () => {
    const listOrders = deferred()
    const { store, container } = setup({
      response: ORDERS,
      toolProvider: { list_orders: () => listOrders.promise },
    })
    await flush()

    expect(container.textContent).toContain("Orders: 0")
    expect(store.getState().answer.queries.orders.status).toBe("loading")

    listOrders.resolve({ rows: ROWS.paid })
    await flush()

    expect(container.textContent).toContain("Orders: 2")
    expect(container.querySelectorAll("tbody tr")).toHaveLength(2)
    expect(store.getState().answer.queries.orders).toMatchObject({
      status: "success",
      data: { rows: ROWS.paid },
    })
  })

  it("does not run queries while the answer streams", async () => {
    const listOrders = vi.fn(async () => ({ rows: [] }))
    const { store } = setup({ toolProvider: { list_orders: listOrders } })

    store.notify("#answer:streamStart")
    store.notify("#answer:chunk", ORDERS)
    await flush()
    expect(listOrders).not.toHaveBeenCalled()

    store.notify("#answer:streamEnd")
    await flush()
    expect(listOrders).toHaveBeenCalledWith({ status: "paid" })
  })

  it("fetches again when an argument changes, and drops a stale reply", async () => {
    const replies = []
    const { store, container } = setup({
      response: ORDERS,
      toolProvider: {
        list_orders: ({ status }) => {
          const reply = deferred()
          replies.push({ status, ...reply })
          return reply.promise
        },
      },
    })
    await flush()

    const input = container.querySelector("input")
    input.value = "due"
    input.dispatchEvent(new Event("input", { bubbles: true }))
    await flush()
    expect(replies.map((reply) => reply.status)).toEqual(["paid", "due"])

    replies[1].resolve({ rows: ROWS.due })
    replies[0].resolve({ rows: ROWS.paid })
    await flush()

    expect(store.getState().answer.queries.orders.data).toEqual({
      rows: ROWS.due,
    })
    expect(container.textContent).toContain("Orders: 1")
  })

  it("keeps the defaults when a query fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    const { store, container } = setup({
      response: ORDERS,
      toolProvider: {
        list_orders: async () => {
          throw new Error("offline")
        },
      },
    })
    await flush()

    expect(store.getState().answer.queries.orders).toMatchObject({
      status: "error",
      error: "offline",
    })
    expect(container.textContent).toContain("Orders: 0")
  })

  it("reports a tool the provider does not have", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    const { store } = setup({ response: ORDERS, toolProvider: {} })
    await flush()

    expect(store.getState().answer.queries.orders.error).toContain(
      'No handler for tool "list_orders"',
    )
  })

  it("calls an MCP client and unwraps its result", async () => {
    const client = {
      callTool: vi.fn(async () => ({
        content: [{ type: "text", text: JSON.stringify({ rows: ROWS.due }) }],
      })),
    }
    const { store } = setup({ response: ORDERS, toolProvider: client })
    await flush()

    expect(client.callTool).toHaveBeenCalledWith({
      name: "list_orders",
      arguments: { status: "paid" },
    })
    expect(store.getState().answer.queries.orders.data).toEqual({
      rows: ROWS.due,
    })
  })

  it("fetches a query again on @Run", async () => {
    const listOrders = vi.fn(async () => ({ rows: ROWS.paid }))
    const { container } = setup({
      response: `orders = Query("list_orders", {}, {rows: []})
root = Stack([Button("Refresh", @Run(orders))])
`,
      toolProvider: { list_orders: listOrders },
    })
    await flush()
    expect(listOrders).toHaveBeenCalledTimes(1)

    container.querySelector("button").click()
    await flush()

    expect(listOrders).toHaveBeenCalledTimes(2)
  })

  it("refreshes a query on its interval", async () => {
    vi.useFakeTimers()
    const listOrders = vi.fn(async () => ({ rows: [] }))
    setup({
      response: `orders = Query("list_orders", {}, {rows: []}, 30)
root = Stack([TextContent("" + @Count(orders.rows))])
`,
      toolProvider: { list_orders: listOrders },
    })
    await vi.advanceTimersByTimeAsync(0)
    expect(listOrders).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(30_000)

    expect(listOrders).toHaveBeenCalledTimes(2)
  })

  it("runs a mutation, then the steps after it", async () => {
    const onAction = vi.fn()
    const refund = vi.fn(async () => ({ refunded: 1200 }))
    const { store, container } = setup({
      response: `refund = Mutation("refund_order", {customer: "Ada"})
root = Stack([Button("Refund Ada", Action([@Run(refund), @ToAssistant("Refunded")])), done])
done = TextContent(refund.status == "success" ? "Refunded " + refund.data.refunded : "Not yet")
`,
      toolProvider: { refund_order: refund },
      onAction,
    })
    await flush()
    expect(container.textContent).toContain("Not yet")

    container.querySelector("button").click()
    await flush()

    expect(refund).toHaveBeenCalledWith({ customer: "Ada" })
    expect(store.getState().answer.mutations.refund).toMatchObject({
      status: "success",
      data: { refunded: 1200 },
    })
    expect(container.textContent).toContain("Refunded 1200")
    expect(onAction).toHaveBeenCalledWith(
      expect.objectContaining({ humanFriendlyMessage: "Refunded" }),
    )
  })

  it("stops an action when its mutation fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    const onAction = vi.fn()
    const { store, container } = setup({
      response: `refund = Mutation("refund_order", {})
root = Stack([Button("Refund", Action([@Run(refund), @ToAssistant("Refunded")]))])
`,
      toolProvider: {
        refund_order: async () => {
          throw new Error("declined")
        },
      },
      onAction,
    })
    await flush()

    container.querySelector("button").click()
    await flush()

    expect(store.getState().answer.mutations.refund).toMatchObject({
      status: "error",
      error: "declined",
    })
    expect(onAction).not.toHaveBeenCalled()
  })

  it("shows the defaults when no toolProvider is given", async () => {
    const { store, container } = setup({ response: ORDERS })
    await flush()

    expect(store.getState().answer.queries).toEqual({})
    expect(container.textContent).toContain("Orders: 0")
  })
})

function setup({ response, toolProvider, onAction } = {}) {
  const types = { OpenUI: createOpenUI({ library: uiLibrary, toolProvider }) }
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

function deferred() {
  let resolve
  const promise = new Promise((done) => (resolve = done))
  return { promise, resolve }
}

/** Lets tool calls settle, the store apply their events and the view re-render. */
async function flush() {
  for (let i = 0; i < 3; i++) {
    await new Promise((resolve) => setTimeout(resolve))
  }
}
