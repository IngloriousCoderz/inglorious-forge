---
title: API Reference
description: Runtime API documentation for Inglorious Web
---

# API Reference

This page documents the runtime API for Inglorious Web and the underlying Inglorious Store.

## `createStore(config)`

Creates a store instance to manage entities, event dispatch, and reactive rendering.

### Parameters

- `types?: Record<string, object>` — type definitions for entities.
- `entities?: Record<string, object>` — initial entity state.
- `systems?: object[]` — systems that handle events outside entity-specific handlers.
- `middlewares?: Function[]` — middleware functions to intercept or transform events.
- `autoCreateEntities?: boolean` — automatically create a default entity for each registered type.
- `updateMode?: "auto" | "manual"` — whether events are processed immediately or manually.

### Example

```javascript
const store = createStore({
  types: {
    Counter: {
      create(entity) {
        entity.count = 0
      },
      increment(entity) {
        entity.count += 1
      },
      render(entity) {
        return html`<span>${entity.count}</span>`
      },
    },
  },
  entities: {
    counter: { type: "Counter" },
  },
})
```

## Store methods

The object returned by `createStore()` exposes the core store API.

### `store.subscribe(listener)`

Subscribe to state updates.

```javascript
const unsubscribe = store.subscribe(() => {
  console.log("store updated")
})
```

## Related

### Example

```javascript
import { mount } from "@inglorious/web"

mount(store, (api) => api.render("app"), document.getElementById("root"), {
  onError(error) {
    console.error("render failed", error)
  },
})
```

### What mount does

- Creates an `api` object from the store
- Adds `api.render()` for entity rendering
- Hydrates existing markup if the container already has child nodes
- Subscribes to store updates and re-renders automatically
- Emits the `init` event once mounted

## Rendering helpers

The docs use `lit-html` helpers like `html`, `when`, `repeat`, and `unsafeHTML`.

### `when(condition, content)`

Render content conditionally.

```javascript
html` ${when(entity.isOpen, () => html`<div>Open</div>`)} `
```

### `repeat(items, fn)`

Render a list with keyed diffing.

```javascript
html`
  <ul>
    ${repeat(
      items,
      (item) => item.id,
      (item) => html`<li>${item.label}</li>`,
    )}
  </ul>
`
```

### `unsafeHTML(htmlString)`

Render raw HTML.

```javascript
html`<div>${unsafeHTML(entity.content)}</div>`
```

## Middleware

Middleware can intercept and modify events before they reach handlers.

```javascript
function logger(store, event) {
  console.log("event", event)
  return event
}
```

Middleware receives:

- `store` — the store object
- `event` — the event object with `type` and optional `payload`

If a middleware returns `null`, the event is dropped.

```javascript
const loggingMiddleware = (store, event) => {
  console.log("Event:", event.type, event.payload)
  return event // Always return event
}

const store = createStore({
  types,
  middlewares: [loggingMiddleware],
})
```

## Environment Variables

### `import.meta.env.DEV`

Is development mode.

```javascript
if (import.meta.env.DEV) {
  console.log("Debug info")
}
```

### `import.meta.env.PROD`

Is production mode.

```javascript
if (import.meta.env.PROD) {
  // Enable analytics
}
```

## TypeScript

### Entity Type

```typescript
interface Entity {
  type: string
  [key: string]: any
}
```

### Template Result

```typescript
type TemplateResult = import("lit-html").TemplateResult
```

### Update Function

```typescript
type UpdateFn<T extends Entity = Entity> = (draft: Draft<T>) => void
```

## Related

- **[Guide](../guide/getting-started.md)** — Getting started guide
- **[Featured Types](../featured/overview.md)** — Built-in types documentation
- **[Advanced](../advanced/type-composition.md)** — Advanced patterns

Need help? [Report an issue](https://github.com/IngloriousCoderz/inglorious-forge/issues) or [ask on discussions](https://github.com/IngloriousCoderz/inglorious-forge/discussions).
