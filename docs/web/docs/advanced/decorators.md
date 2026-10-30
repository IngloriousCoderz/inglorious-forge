---
title: Decorators
description: Reusable behavior helpers for type composition in Inglorious Web
---

# Decorators

Decorators are reusable behavior helpers that wrap a type's handlers without requiring you to hand-roll the same interception logic every time. They fit naturally into Inglorious Web's array-based composition model and are a good fit for concerns such as debouncing, cleanup, validation, or other cross-cutting behavior.

## withDebounce

The built-in `withDebounce` decorator wraps selected handlers with per-entity debouncing. It is especially useful for handlers that should not fire repeatedly while a user is typing or interacting quickly.

```javascript
import { withDebounce } from "@inglorious/web/decorators/with-debounce"

const types = {
  AutosaveForm: [Form, withDebounce(500, ["saveData"])],
  SearchBox: [Combobox, withDebounce({ optionsLoad: 300, saveQuery: 800 })],
}
```

### How it works

- A delay can be provided for all wrapped handlers or per handler.
- Debouncing is scoped per entity so each entity keeps its own pending timer state.
- Pending work is cancelled when the entity is destroyed, avoiding stale callbacks.

### When to use it

Use `withDebounce` for handlers such as:

- save operations
- search requests
- autosuggest lookups
- any other event that should coalesce rapid input

## withThrottle

The built-in `withThrottle` decorator wraps selected handlers with per-entity throttling. Unlike debouncing (which delays and deduplicates), throttling ensures a handler runs at most once every `delay` milliseconds during rapid-fire events. By default, the first call in a burst runs immediately (leading edge). Optionally, you can enable `hasTrailing` to also invoke the handler once more after the delay with the final call's arguments, ensuring no state is lost.

```javascript
import { withThrottle } from "@inglorious/web/decorators/with-throttle"

const types = {
  // Leading-edge only (default)
  ScrollTracker: [Base, withThrottle(200, ["scroll"])],
  // Leading + trailing
  ResizablePanel: [
    Base,
    withThrottle({ resize: 100 }, undefined, { hasTrailing: true }),
  ],
}
```

### How it works

- A delay can be provided for all wrapped handlers or per handler.
- By default, the handler fires on the leading edge (first call immediately), and subsequent calls are throttled for the delay period.
- With `hasTrailing: true`, the handler also fires once more after the delay with the most recent suppressed call's arguments.
- Throttling is scoped per entity so each entity keeps its own throttle window.
- Pending work is cancelled when the entity is destroyed, avoiding stale callbacks.

### When to use it

Use `withThrottle` for handlers such as:

- scroll or resize events (frequent, need responsive leading edge)
- mouse move tracking
- any high-frequency event that needs rate limiting while staying responsive

Use `hasTrailing: true` when you need to ensure the final state of a burst is never dropped (e.g., ending a resize or scroll and needing to capture the final position).

## withLiveReload

The built-in `withLiveReload` decorator keeps an entity in step with a backend. Whenever one of the tables it reads changes, the entity reloads, by notifying its own `load` event.

```javascript
import { realtimeSource } from "@inglorious/supabase"
import { withLiveReload } from "@inglorious/web/decorators/with-live-reload"

const live = realtimeSource(supabase)

const types = {
  ApplicationList: [
    ApplicationList,
    withLiveReload({ source: live, tables: ["applications", "events"] }),
  ],
  ApplicationDetail: [
    ApplicationDetail,
    withLiveReload({
      source: live,
      tables: ["applications", "events"],
      payload: (entity) => entity.applicationId,
      isLive: (entity, api) => api.getEntity("router").route === entity.id,
    }),
  ],
}
```

### How it works

- It never decides which rows changed. A change to a table the entity reads is enough to reload it. That costs a reload now and then, and it leaves out the per-type rules about which changes count, which is where live data tends to go wrong.
- `payload(entity, api)` is what the reload event carries, such as the id of the record the entity shows. `event` names a different event than `load`.
- `isLive(entity, api)` skips changes while the entity is off screen, since it loads when it opens anyway. It defaults to always.
- A burst of changes becomes one reload, after `delay` (300 ms by default).
- When the page comes back into view, every live entity reloads. A phone that put the app in the background may have dropped the connection, and the changes with it.
- The subscriptions end when the entity is destroyed.

### The source

`source.subscribe(table, onChange)` calls `onChange` on every change to `table` and returns a function that unsubscribes. `@inglorious/supabase` provides one for Supabase Realtime. Any backend that can say "this table changed" can have its own.

### When to use it

Use `withLiveReload` for screens that show data other people change: feeds, inboxes, lists of applications, a record someone else can edit.

## withErrorBoundary

The built-in `withErrorBoundary` decorator wraps a type's `render` in an error boundary. If the wrapped render throws, the caught error is handed to a `fallback` function and its template is rendered instead — so a single failing entity degrades to a fallback UI rather than taking down the whole app.

Because every entity is rendered through the same `render`, composing a boundary onto a type is the idiomatic way to isolate that subtree.

```javascript
import { html } from "@inglorious/web"
import { withErrorBoundary } from "@inglorious/web/decorators/with-error-boundary"

const types = {
  Chart: [
    ChartBase,
    withErrorBoundary((err) => html`<p>Chart failed: ${err.message}</p>`),
  ],
}
```

The `fallback` receives the caught `error`, the `entity`, and the render `api`, so it can render anything a normal template can — including a retry action:

```javascript
withErrorBoundary(
  (error, entity, api) => html`
    <div class="chart-error">
      <p>${entity.title ?? "This widget"} could not be displayed.</p>
      <button @click=${() => api.notify(`#${entity.id}:reload`)}>Retry</button>
    </div>
  `,
)
```

If you omit the fallback, the decorator logs the error and renders nothing, which is still enough to keep the rest of the app alive.

### How it works

- Composes **after** the base type so it wraps the base `render`; every other handler on the type is left untouched.
- Catches errors thrown **synchronously during render** and returns the fallback instead of letting them propagate.
- The wrap is deterministic, so the same error produces the same fallback during SSR and client hydration — it never introduces a hydration mismatch, and works out of the box with [SSX](./ssx.md).

### When to use it

Use `withErrorBoundary` for any type whose render depends on data that might be malformed or incomplete:

- charts and data-visualization widgets
- third-party or user-provided content
- dashboard tiles where one broken widget shouldn't blank the page

### Limitations

Like React and Svelte error boundaries, this only catches errors thrown **during render**. It does **not** catch:

- errors thrown in **event handlers** (they fire outside render)
- errors from **async work / thunks** (they run in the store phase, before render)
- errors thrown by **lit-html directives** committed after `render` returns

Those belong to the store phase — handle them as `entity.error` state inside your handlers (see [Error Handling](./error-handling.md)). For a last-resort net around the _root_ render, see the [root-level guard](./error-handling.md#error-boundaries).

## Adding more decorators

As the collection grows, additional decorators can be added in the same style. Keep each decorator focused on a single concern, return a behavior object that mirrors the wrapped type's handlers, and let the composed type decide how to use it.
