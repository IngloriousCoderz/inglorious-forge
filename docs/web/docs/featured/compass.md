---
title: Compass Component
description: Device orientation and heading support with the Compass type
---

# Compass Component

The `Compass` type keeps device orientation and heading state in the store.

## Setup

```javascript
import { createStore } from "@inglorious/store"
import { Compass } from "@inglorious/web/compass"

const store = createStore({
  types: { Compass },
  autoCreateEntities: true,
})
```

This creates a `compass` entity automatically when `autoCreateEntities` is enabled.

## Entity State

The `compass` entity tracks:

- `isSupported` — whether device orientation sensors are available
- `isLoading` — whether permission or heading data is pending
- `isCompassPermissionGranted` — whether compass permission was granted
- `isCompassActive` — whether a valid heading is currently active
- `heading` — the latest heading in degrees, or `null`
- `error` — the latest normalized `{ code, message }` error
- `manualOffset` — an optional heading offset in degrees

## Events

Drive compass behavior with these events:

```javascript
api.notify("compassPermissionsRequest")
api.notify("compassWatch")
api.notify("compassUnwatch")
```

### What each event does

- `compassPermissionsRequest` — request compass permission when needed
- `compassWatch` — start listening for device orientation events
- `compassUnwatch` — stop listening for device orientation events

## Example

```javascript
import { mount, html } from "@inglorious/web"
import { store } from "./store.js"

const renderApp = (api) => {
  const compass = api.getEntity("compass")

  return html`
    <section>
      <h2>Compass</h2>
      <p>Supported: ${compass.isSupported ? "yes" : "no"}</p>
      <p>Permission: ${compass.isPermissionGranted ? "granted" : "unknown"}</p>
      <p>Active: ${compass.isActive ? "yes" : "no"}</p>
      <p>
        Heading:
        ${compass.heading !== null
          ? `${compass.heading.toFixed(1)}°`
          : "unknown"}
      </p>
      <p>Error: ${compass.error ? compass.error.message : "none"}</p>
      <button @click=${() => api.notify("compassPermissionsRequest")}>
        Request Permission
      </button>
      <button @click=${() => api.notify("compassWatch")}>Start Compass</button>
      <button @click=${() => api.notify("compassUnwatch")}>Stop Compass</button>
    </section>
  `
}

mount(store, renderApp, document.getElementById("root"))
```

## Notes

The `Compass` type manages permission, watch lifecycle, and heading updates so your UI can remain declarative and store-driven.
