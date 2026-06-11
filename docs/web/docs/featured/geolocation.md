---
title: Geolocation Component
description: Browser geolocation support with current position and watch state in the store
---

# Geolocation Component

Keep browser geolocation state inside your store with the `Geolocation` type.

## Setup

```javascript
import { createStore } from "@inglorious/store"
import { Geolocation } from "@inglorious/web/geolocation"

const store = createStore({
  types: { Geolocation },
  autoCreateEntities: true,
})
```

With `autoCreateEntities`, the store automatically creates a `geolocation` entity.

## Entity State

The `geolocation` entity tracks:

- `isSupported` — whether `navigator.geolocation` is available
- `isLoading` — whether a current position request or the first watch result is pending
- `isWatching` — whether a geolocation watch is active
- `position` — the latest normalized `{ coords, timestamp }` value
- `error` — the latest normalized `{ code, message }` error
- `watchId` — the browser watch ID, or `null`

## Events

Use `api.notify()` to drive the geolocation flow.

```javascript
api.notify("geolocationRequest", {
  enableHighAccuracy: true,
  timeout: 5000,
})

api.notify("geolocationWatch")
api.notify("geolocationUnwatch")
```

### What each event does

- `geolocationRequest` — request the current device position once
- `geolocationWatch` — start watching position updates
- `geolocationUnwatch` — stop the active watch

## Example

```javascript
import { mount, html } from "@inglorious/web"
import { store } from "./store.js"

const renderApp = (api) => {
  const geolocation = api.getEntity("geolocation")
  const position = geolocation.position

  return html`
    <section>
      <h2>Geolocation</h2>
      <p>Supported: ${geolocation.isSupported ? "yes" : "no"}</p>
      <p>Loading: ${geolocation.isLoading ? "yes" : "no"}</p>
      <p>
        Position:
        ${position
          ? html`${position.coords.latitude.toFixed(4)},
            ${position.coords.longitude.toFixed(4)}`
          : "unknown"}
      </p>
      <p>Error: ${geolocation.error ? geolocation.error.message : "none"}</p>
      <button
        @click=${() =>
          api.notify("geolocationRequest", {
            enableHighAccuracy: true,
            timeout: 5000,
          })}
      >
        Request Current Position
      </button>
      <button @click=${() => api.notify("geolocationWatch")}>
        Start Watch
      </button>
      <button @click=${() => api.notify("geolocationUnwatch")}>
        Stop Watch
      </button>
    </section>
  `
}

mount(store, renderApp, document.getElementById("root"))
```

## Notes

The `Geolocation` type normalizes browser errors and keeps the state in your entity store so your UI can react predictably to permission, loading, and watch changes.
