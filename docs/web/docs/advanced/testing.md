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
import { Counter } from "./types"

test("increment adds to count", () => {
  const { entity, events } = trigger(
    { count: 10 }, // base state
    Counter.increment, // event handler
    5, // payload (optional)
  )

  expect(entity.count).toBe(15) // new state
  expect(events).toEqual([]) // queued events
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
  const { entity } = trigger({ count: 0 }, Counter.increment)

  expect(entity.count).toBe(1)
})
```

### With Payload

```javascript
test("add adds to count", () => {
  const { entity } = trigger({ count: 10 }, Counter.add, 5)

  expect(entity.count).toBe(15)
})
```

### Async Handlers

```javascript
test("fetchData sets loading state", async () => {
  const { entity } = await trigger(
    { isLoading: false, data: null },
    DataFetcher.fetchData,
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
    Todo.delete,
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
  const template = Greeting.render(entity, { notify: jest.fn() })
  const html = render(template)

  expect(html).toContain("Hello, Alice")
})
```

### Conditional Rendering

```javascript
test("shows login button when not logged in", () => {
  const entity = { isLoggedIn: false }
  const template = User.render(entity, { notify: jest.fn() })
  const html = render(template)

  expect(html).toContain("Login")
  expect(html).not.toContain("Logout")
})

test("shows logout button when logged in", () => {
  const entity = { isLoggedIn: true, name: "Alice" }
  const template = User.render(entity, { notify: jest.fn() })
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

  const template = TodoList.render(entity, { notify: jest.fn() })
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
    types: { Counter },
    entities: { counter: { type: "Counter", count: 0 } },
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
      Cart: {
        addItem(entity, itemId) {
          entity.items.push(itemId)
          entity.api.notify("itemAdded", { itemId })
        },
      },
      Notification: {
        itemAdded(entity, { itemId }) {
          entity.message = `Added ${itemId}`
        },
      },
    },
    entities: {
      cart: { type: "Cart", items: [] },
      notification: { type: "Notification", message: "" },
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
  const loggedEvents = []

  const withLogging = (type) => ({
    increment(entity, payload, api) {
      loggedEvents.push("increment")
      type.increment(entity, payload, api)
    },
  })

  const TestType = [
    {
      increment(e) {
        e.count++
      },
    },
    withLogging,
  ]

  const { entity } = trigger(
    { count: 0 },
    TestType.find((t) => t.increment).increment,
  )

  expect(entity.count).toBe(1)
  expect(loggedEvents).toContain("increment")
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
  const BaseType = {
    navigate(e, r) {
      e.route = r
    },
  }
  const GuardedType = [BaseType, requireAuth]

  localStorage.removeItem("user")

  trigger(
    { route: "" },
    GuardedType.find((t) => t.navigate).navigate,
    "/admin",
    mockApi,
  )

  expect(mockApi.notify).toHaveBeenCalledWith("navigate", "/login")
})
```

## Form Testing

```javascript
import { Form } from "@inglorious/web/form"

test("form validates email", () => {
  const { entity, events } = trigger(
    {
      type: "Form",
      initialValues: { email: "" },
      values: { email: "" },
    },
    Form.fieldChange,
    { path: "email", value: "invalid" },
  )

  expect(entity.values.email).toBe("invalid")
})

test("form resets to initial values", () => {
  const { entity } = trigger(
    {
      type: "Form",
      initialValues: { email: "test@example.com" },
      values: { email: "changed@example.com" },
    },
    Form.reset,
  )

  expect(entity.values.email).toBe("test@example.com")
})
```

## Component Testing

```javascript
test("custom list renders rows", () => {
  const List = {
    render(entity) {
      return html`
        <ul>
          ${entity.items.map((item) => html`<li>${item.name}</li>`)}
        </ul>
      `
    },
  }

  const entity = {
    items: [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ],
  }

  const template = List.render(entity)
  const output = render(template)

  expect(output).toContain("Alice")
  expect(output).toContain("Bob")
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
  const { entity } = trigger({ count: 0 }, Counter.increment)
  expect(entity.count).toBe(1)
})

test("counter renders", () => {
  const html = render(Counter.render({ count: 1 }, { notify: jest.fn() }))
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
