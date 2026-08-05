---
title: Sensors
description: Browser sensor support and entity-based sensor types for Inglorious Web
---

# Sensors

Inglorious Web exposes browser sensor state as entity types, so live browser data stays in the store instead of being scattered across event listeners in your app.

Sensor entities are designed to keep the entity state serializable by storing runtime listeners and observers outside the entity itself.

## Built-in sensors

- `Compass` — device orientation and heading state
- `Geolocation` — browser position and watch state
- `ElementSize` — DOM element resize tracking via `ResizeObserver`
- `NetworkStatus` — online/offline connectivity state
- `PageVisibility` — page visibility state from `document.visibilityState`
- `MediaQuery` — media query matching with `window.matchMedia`

## Why use sensor entities

- **Serializable state** — runtime listeners and observers are kept outside the entity object
- **Centralized behavior** — sensor lifecycle and normalization logic live in one place
- **Reactive UI** — sensor state updates flow through the store naturally
- **Testable** — sensors can be exercised through store events and state assertions

## Common sensor patterns

Most sensors support:

- `isSupported` — feature detection for the current environment
- `isWatching` — whether the sensor is actively listening
- normalized sensor state exposed on the entity
- explicit watch/unwatch lifecycle management

## Example

```javascript
import { createStore } from "@inglorious/store"
import { MediaQuery } from "@inglorious/web/sensors/media-query"

const store = createStore({
  types: { MediaQuery },
  autoCreateEntities: true,
})

const mediaQuery = store.getEntity("mediaQuery")

if (mediaQuery.matches) {
  // render desktop layout
}
```

## Sensor docs

- [Compass](./compass.md)
- [Geolocation](./geolocation.md)
- [ElementSize](./element-size.md)
- [MediaQuery](./media-query.md)
- [NetworkStatus](./network-status.md)
- [PageVisibility](./page-visibility.md)
