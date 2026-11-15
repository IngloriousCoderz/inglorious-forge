---
title: Type Composition
description: Types as a pipe of behaviors, and the patterns it gives
---

# Type Composition

A type can be a list of behaviors. The store builds the type by applying them in order, like a pipe: each behavior is added to the type built so far, and a later handler of the same name replaces the earlier one. A behavior is an object of handlers, or a decorator: a function of the type built so far, returning the handlers it adds or replaces.

```javascript
const withLogging = (type) => ({
  increment(entity, payload, api) {
    console.log(`incrementing ${entity.id}`)
    type.increment?.(entity, payload, api)
  },
})

const types = {
  Counter: [Counter, withLogging],
}
```

`withLogging` receives `Counter` as `type`; its `increment` replaces `Counter.increment` while calling it, with every argument. Handlers it does not name, such as `render`, stay as they were.

## Order

Each behavior wraps what came before it, so **the last behavior is the outermost**: it runs first, and decides whether the earlier ones run.

```javascript
const types = {
  AdminPanel: [Page, requireAuth, requireAdmin],
}
```

On `routeChange`, `requireAdmin` runs first; if it calls `type.routeChange`, `requireAuth` runs; if that calls on, `Page` runs. Put the behavior that should have the last word last: a guard after the page, `fsm` after the behaviors it falls back to, `withStorage` after the handlers whose changes it saves, `withDebounce` after the handler it delays.

## Guards

```javascript
const requireAuth = (type) => ({
  routeChange(entity, payload, api) {
    if (payload.route !== entity.id) return
    if (!api.getEntity("session").user) {
      api.notify("#router:navigate", { to: "/login", replace: true })
      return
    }
    type.routeChange?.(entity, payload, api)
  },
})
```

A guard reads the session with `api.getEntity`: a sign-in earlier in the same chain of events is already there, since each event reads what the previous one changed.

## Wrapping a render

```javascript
const withTitle = (type) => ({
  render(entity, api) {
    return html`<h2>${entity.title}</h2>
      ${type.render?.(entity, api)}`
  },
})
```

[`withErrorBoundary`](./decorators.md#witherrorboundary) is one: it catches what the wrapped render throws. The other built-in decorators are `withDebounce`, `withThrottle` and `withLiveReload` here, and `fsm`, `scenes`, `withStorage` and `optimistic` in the store.

## When to use it

A behavior wraps one type: guards, logging, validation, persistence, state machines. Logic that needs every entity at once is a [system](https://inglorious.dev/store/advanced/systems); what sits around the store, such as the DevTools, is a [middleware](https://inglorious.dev/store/api/reference#middlewares-optional).

## Testing

A decorator is a function: apply it to a type and trigger the result.

```javascript
import { createMockApi, trigger } from "@inglorious/web/test"

const Guarded = requireAuth({ routeChange() {} })
const api = createMockApi({ session: { type: "Session", user: null } })

const { events } = trigger(
  { id: "admin" },
  Guarded.routeChange,
  { route: "admin" },
  api,
)

expect(events).toContainEqual({
  type: "#router:navigate",
  payload: { to: "/login", replace: true },
})
```
