# Data from tools

An answer can show live data instead of figures the model typed in. It names a tool and its arguments, and the app runs the tool:

```text
$status = "paid"
orders = Query("list_orders", {status: $status}, {rows: []}, 30)
root = Stack([filter, count, tbl])
filter = Input("status", "Status", "text", null, $status)
count = TextContent("Orders: " + @Count(orders.rows))
tbl = Table([Col("Customer", orders.rows.customer), Col("Total", orders.rows.total, "number")])
```

`Query` takes the tool, its arguments, the data to show until the real data arrives, and optionally a refresh interval in seconds. Writing `orders.rows.customer` picks that field from every row, and built-ins such as `@Count`, `@Sum`, `@Filter` and `@Sort` work on the results.

## Giving the app's tools

The app decides which tools exist. Pass them to `createOpenUI` as async functions by name:

```javascript
const OpenUI = createOpenUI({
  library: uiLibrary,
  toolProvider: {
    list_orders: ({ status }) =>
      fetch(`/api/orders?status=${status}`).then((response) => response.json()),
    refund_order: ({ customer }) =>
      fetch("/api/refunds", {
        method: "POST",
        body: JSON.stringify({ customer }),
      }).then((response) => response.json()),
  },
})
```

or pass an [MCP](https://modelcontextprotocol.io) client, whose `callTool` results are unwrapped from MCP's content blocks.

Then describe them to the model, so it knows what to ask for:

```javascript
const systemPrompt = uiLibrary.prompt({
  examples: uiExamples,
  tools: [
    {
      name: "list_orders",
      description: "Orders, filtered by status",
      inputSchema: {
        type: "object",
        properties: { status: { type: "string" } },
      },
      outputSchema: {
        type: "object",
        properties: {
          rows: {
            type: "array",
            items: {
              type: "object",
              properties: {
                customer: { type: "string" },
                total: { type: "number" },
              },
            },
          },
        },
      },
    },
  ],
})
```

With tools in it, the prompt also teaches `Query`, `Mutation` and the built-ins. The output schema matters: it is how the model knows that `orders.rows.customer` exists.

## How queries run

A query runs once the answer is whole, not while it streams. It runs again when its arguments change, such as when the user types into a field bound to `$status`, and on every refresh interval. Until the first result arrives it shows its defaults; after that, the last result stays on screen while a new one loads. A reply to arguments the query has since moved on from is dropped.

Each query is kept in the entity, in `queries`, by statement name:

```javascript
answer.queries.orders // { key, tool, args, status: "success", data: { rows: [...] }, error: null }
```

`status` is `"loading"`, `"success"` or `"error"`. A failed query keeps showing what it showed before, and its `error` says why. Components see `isLoading` while any query fetches.

Without a `toolProvider`, queries never run and show their defaults.

## Mutations

A mutation changes something, so it never runs by itself: a button runs it with `@Run`.

```text
refund = Mutation("refund_order", {customer: "Ada"})
root = Stack([Button("Refund Ada", Action([@Run(refund), @Run(orders), @ToAssistant("Refunded Ada")])), done])
done = TextContent(refund.status == "success" ? "Refunded" : "")
```

The steps after it wait for it, and stop if it fails: here the orders are fetched again and the assistant told only once the refund went through. `@Run` on a query fetches it again.

The answer reads a mutation as `refund.status` (`"idle"`, `"loading"`, `"success"` or `"error"`), `refund.data` and `refund.error`, and the entity keeps it in `mutations`.

Next: [Components](components.md)
