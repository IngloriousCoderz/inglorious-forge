---
title: Testing
description: Unit, integration, and component testing with trigger() and render() utilities
---

# Testing

Testing Inglorious Web apps is incredibly simple because everything is a pure function. No setup required, no mocking, no testing libraries.

## Testing Utilities

Inglorious Web provides two simple utilities for testing:

### `trigger(entity, handler, payload?, api?)`

Execute a handler as a pure function (with Mutative) and get back the new state and any events dispatched.

```javascript
import { trigger } from "@inglorious/web/test"
import { counter } from "./types"

test("increment adds to count", () => {
  const { entity, events } = trigger(
    { type: "counter", id: "counter1", count: 10 },
    counter.increment,
    5, // payload (optional)
  )

  expect(entity.count).toBe(15)
  expect(events).toEqual([])
})
```

### `render(template)`

Render a lit-html template to HTML string for testing.

```javascript
import { render } from "@inglorious/web/test"

test("counter renders value", () => {
  const template = html`<h1>${42}</h1>`
  const output = render(template)

  expect(output).toContain("42")
})
```

## Unit Testing Handlers

### Simple Handler

```javascript
test("increment increments count", () => {
  const { entity } = trigger({ count: 0 }, counter.increment)

  expect(entity.count).toBe(1)
})
```

### With Payload

```javascript
test("add adds to count", () => {
  const { entity } = trigger({ count: 10 }, counter.add, 5)

  expect(entity.count).toBe(15)
})
```

### Async Handlers

```javascript
test("fetchData sets loading state", async () => {
  const { entity } = await trigger(
    { isLoading: false, data: null },
    dataFetcher.fetchData,
  )

  // Check loading state, data, etc.
  expect(entity.data).toBeDefined()
})
```

### Event Dispatching

```javascript
test("delete dispatches notification", () => {
  const { events } = trigger(
    { id: "todo-1", title: "Buy milk" },
    todo.delete,
    null,
    { notify: jest.fn() },
  )

  expect(events).toContainEqual(
    expect.objectContaining({ type: "todoDeleted" }),
  )
})
```

## Unit Testing Renders

### Simple Render

```javascript
import { render } from "@inglorious/web/test"

test("greeting displays name", () => {
  const entity = { name: "Alice" }
  const template = greeting.render(entity, { notify: jest.fn() })
  const html = render(template)

  expect(html).toContain("Hello, Alice")
})
```

### Conditional Rendering

```javascript
test("shows login button when not logged in", () => {
  const entity = { isLoggedIn: false }
  const template = user.render(entity, { notify: jest.fn() })
  const html = render(template)

  expect(html).toContain("Login")
  expect(html).not.toContain("Logout")
})

test("shows logout button when logged in", () => {
  const entity = { isLoggedIn: true, name: "Alice" }
  const template = user.render(entity, { notify: jest.fn() })
  const html = render(template)

  expect(html).toContain("Logout")
  expect(html).not.toContain("Login")
})
```

### Lists

```javascript
test("todo list renders all items", () => {
  const entity = {
    todos: [
      { id: 1, title: "Buy milk" },
      { id: 2, title: "Walk dog" },
    ],
  }

  const template = todoList.render(entity, { notify: jest.fn() })
  const html = render(template)

  expect(html).toContain("Buy milk")
  expect(html).toContain("Walk dog")
})
```

## Integration Testing

### Full Store with Events

```javascript
test("user workflow", () => {
  const store = createStore({
    types: { counter },
    entities: { counter: { type: "counter", count: 0 } },
  })

  // Dispatch event
  store.notify("#counter:increment")
  expect(store.entities.counter.count).toBe(1)

  // Dispatch with payload
  store.notify("#counter:add", 5)
  expect(store.entities.counter.count).toBe(6)
})
```

### Multiple Entities

```javascript
test("cart and notification interaction", () => {
  const store = createStore({
    types: {
      cart: {
        addItem(entity, itemId) {
          entity.items.push(itemId)
          entity.api.notify("itemAdded", { itemId })
        },
      },
      notification: {
        itemAdded(entity, { itemId }) {
          entity.message = `Added ${itemId}`
        },
      },
    },
    entities: {
      cart: { type: "cart", items: [] },
      notification: { type: "notification", message: "" },
    },
  })

  store.notify("#cart:addItem", "item-123")

  expect(store.entities.cart.items).toContain("item-123")
  expect(store.entities.notification.message).toBe("Added item-123")
})
```

## Type Composition Testing

### Testing Behaviors

```javascript
test("logging behavior logs events", () => {
  const logged = []

  const logging = (type) => ({
    increment(entity, payload, api) {
      logged.push("increment")
      type.increment(entity, payload, api)
    },
  })

  const testType = [
    {
      increment(e) {
        e.count++
      },
    },
    logging,
  ]

  const baseType = testType[0]
  const { entity } = trigger({ count: 0 }, baseType.increment)

  expect(entity.count).toBe(1)
  expect(logged).toContain("increment")
})
```

### Testing Guards

```javascript
test("auth guard blocks unauthenticated access", () => {
  const requireAuth = (type) => ({
    navigate(entity, route, api) {
      if (!window.localStorage.getItem("user")) {
        api.notify("navigate", "/login")
        return
      }
      type.navigate(entity, route, api)
    },
  })

  const mockApi = { notify: jest.fn() }
  const baseType = {
    navigate(e, r) {
      e.route = r
    },
  }
  const guardedType = [baseType, requireAuth]

  localStorage.removeItem("user")

  const handler = guardedType.find((t) => t.navigate).navigate
  trigger({ route: "" }, handler, "/admin", mockApi)

  expect(mockApi.notify).toHaveBeenCalledWith("navigate", "/login")
})
```

## Form Testing

```javascript
import { form } from "@inglorious/web/form"

test("form validates email", () => {
  const { entity, events } = trigger(
    {
      type: "form",
      initialValues: { email: "" },
      values: { email: "" },
    },
    form.fieldChange,
    { path: "email", value: "invalid" },
  )

  expect(entity.values.email).toBe("invalid")
})

test("form resets to initial values", () => {
  const { entity } = trigger(
    {
      type: "form",
      initialValues: { email: "test@example.com" },
      values: { email: "changed@example.com" },
    },
    form.reset,
  )

  expect(entity.values.email).toBe("test@example.com")
})
```

## Component Testing

```javascript
import { table } from "@inglorious/web/table"

test("table renders rows", () => {
  const entity = {
    data: [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ],
    columns: [
      { id: "id", label: "ID" },
      { id: "name", label: "Name" },
    ],
  }

  const mockApi = { notify: jest.fn(), render: jest.fn() }
  const template = table.render(entity, mockApi)
  const html = render(template)

  expect(html).toContain("Alice")
  expect(html).toContain("Bob")
})
```

## Comparison: React vs Inglorious Testing

### React (with @testing-library)

```javascript
import { render, screen } from "@testing-library/react"

test("counter increments", () => {
  render(<Counter />)

  const button = screen.getByRole("button")
  fireEvent.click(button)

  expect(screen.getByText("Count: 1")).toBeInTheDocument()
})
```

**Downsides:**

- Requires testing library setup
- Requires `fireEvent` or `userEvent`
- Tests internals of React (rendering, effects)
- Slow (DOM operations)

### Inglorious Web

```javascript
import { trigger, render } from "@inglorious/web/test"

test("counter increments", () => {
  const { entity } = trigger({ count: 0 }, counter.increment)
  expect(entity.count).toBe(1)
})

test("counter renders", () => {
  const html = render(counter.render({ count: 1 }, { notify: jest.fn() }))
  expect(html).toContain("Count: 1")
})
```

**Advantages:**

- No special setup
- Just function calls
- Tests the actual logic, not React internals
- Very fast (no DOM)
- Pure functions

## Best Practices

✅ **Do:**

- Test handlers separately from renders
- Keep tests focused on one thing
- Use descriptive test names
- Test edge cases (empty, null, invalid)
- Mock external dependencies (API calls)

❌ **Don't:**

- Mix handler and render testing
- Test framework internals
- Over-mock (keep tests realistic)
- Create complex test fixtures
- Test lit-html (trust that it works)

## Speed

Inglorious tests are **extremely fast** because:

- No DOM manipulation
- No component mounting/unmounting
- No async framework overhead
- Pure synchronous functions

Typical results:

```
React: 30-60 seconds for 100 tests
Inglorious: 1-3 seconds for 100 tests
```

This enables real TDD where you run tests constantly.

## Next Steps

- **[Type Composition](./type-composition.md)** — Test composed behaviors
- **[Performance](./performance.md)** — Optimize your app

Happy testing! ✅
