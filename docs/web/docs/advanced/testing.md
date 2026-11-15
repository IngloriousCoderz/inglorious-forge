---
title: Testing
description: Testing handlers with trigger, renders with render, and apps with a store
---

# Testing

A handler is a function of the entity and the event, and a render is a function of the entity. Neither needs a runtime or a mock to be tested.

## Handlers

`trigger` runs a handler on an entity and returns the new entity and the events it notified, leaving the given entity as it was:

```javascript
import { trigger } from "@inglorious/web/test"

const { entity, events } = trigger({ count: 10 }, Counter.add, 5)

expect(entity.count).toBe(15)
expect(events).toEqual([])
```

A handler that reads other entities gets a mock api:

```javascript
import { createMockApi, trigger } from "@inglorious/web/test"

const api = createMockApi({ session: { type: "Session", user: null } })
const { events } = trigger(
  { id: "admin" },
  AdminPage.routeChange,
  { route: "admin" },
  api,
)

expect(events).toContainEqual({
  type: "#router:navigate",
  payload: { to: "/login", replace: true },
})
```

An `async` handler is tested up to its first `await`; what comes after is an event of its own. With `handleRequest`, test `success` and `error` as handlers, with the result or the error as payload.

## Renders

`render` from `@inglorious/web/test` is lit-html's: it puts a template into an element, under jsdom, where it can be read back. A click in the template notifies through the mock api, which records it:

```javascript
/**
 * @vitest-environment jsdom
 */
import { createMockApi, render } from "@inglorious/web/test"

const api = createMockApi({})
const container = document.createElement("div")

render(
  User.render({ id: "user", isSignedIn: true, name: "Alice" }, api),
  container,
)

expect(container.textContent).toContain("Sign out")
container.querySelector("button").click()
expect(api.getEvents()).toEqual([{ type: "#user:signOut", payload: undefined }])
```

## Apps

For how handlers work together, create a store with the types and notify it. Events are applied at once, so the state is ready to assert:

```javascript
import { createStore } from "@inglorious/store"

const store = createStore({
  types: { Cart, CartBadge },
  entities: {
    cart: { type: "Cart", items: [] },
    cartBadge: { type: "CartBadge", count: 0 },
  },
})

store.notify("#cart:itemAdd", "item-123")

expect(store.getEntity("cart").items).toContain("item-123")
expect(store.getEntity("cartBadge").count).toBe(1)
```

A type that talks to the outside world takes its adapter or plugin as a parameter, so a test gives it a fake: `createAuth({ adapter: fakeAdapter })`.
