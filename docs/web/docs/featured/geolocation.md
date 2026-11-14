---
title: Geolocation
description: Browser geolocation support with current position and watch state in the store
---

# Geolocation

`createGeolocation` returns the type that keeps the device's position in your store. In a native app it uses [`@capacitor/geolocation`](https://capacitorjs.com/docs/apis/geolocation) when given as `plugin`, so iOS asks for the location once, for the app; elsewhere it uses `navigator.geolocation`.

## Usage

```javascript
import { createStore } from "@inglorious/store"
import { Geolocation as GeolocationPlugin } from "@capacitor/geolocation"
import { createGeolocation } from "@inglorious/web/device/geolocation"

const store = createStore({
  types: { Geolocation: createGeolocation({ plugin: GeolocationPlugin }) },
  autoCreateEntities: true,
})

const geolocation = store.getEntity("geolocation")
```

With `autoCreateEntities`, the store automatically creates a `geolocation` entity.

## Entity State

The `geolocation` entity tracks:

- `isSupported` — whether the position can be read here
- `isLoading` — whether a current position request or the first watch result is pending
- `isWatching` — whether a geolocation watch is active
- `position` — the latest normalized `{ coords, timestamp }` value
- `error` — the latest normalized `{ code, message }` error

## Events

Use `api.notify()` to drive the geolocation flow.

```javascript
api.notify("#geolocation:geolocationRequest", {
  enableHighAccuracy: true,
  timeout: 5000,
})

api.notify("#geolocation:geolocationWatch")
api.notify("#geolocation:geolocationUnwatch")
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
        ${
          position
            ? html`${position.coords.latitude.toFixed(4)},
              ${position.coords.longitude.toFixed(4)}`
            : "unknown"
        }
      </p>
      <p>Error: ${geolocation.error ? geolocation.error.message : "none"}</p>
      <button
        @click=${() =>
          api.notify("#geolocation:geolocationRequest", {
            enableHighAccuracy: true,
            timeout: 5000,
          })}
      >
        Request Current Position
      </button>
      <button @click=${() => api.notify("#geolocation:geolocationWatch")}>
        Start Watch
      </button>
      <button @click=${() => api.notify("#geolocation:geolocationUnwatch")}>
        Stop Watch
      </button>
    </section>
  `
}

mount(store, renderApp, document.getElementById("root"))
```

## Notes

The `Geolocation` type normalizes browser errors and keeps the state in your entity store so your UI can react predictably to permission, loading, and watch changes.
