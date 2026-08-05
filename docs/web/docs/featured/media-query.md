---
title: MediaQuery
description: Track media query state with the MediaQuery sensor type
---

# MediaQuery

`MediaQuery` keeps `window.matchMedia()` query results in the store.

## What it tracks

The `mediaQuery` entity keeps:

- `isSupported` — whether `window.matchMedia` is available
- `matches` — whether the media query currently matches
- `media` — the media query string being observed
- `isWatching` — whether the media query listener is active

## Usage

```javascript
import { createStore } from "@inglorious/store"
import { MediaQuery } from "@inglorious/web/sensors/media-query"

const store = createStore({
  types: { MediaQuery },
  autoCreateEntities: true,
})

const mediaQuery = store.getEntity("mediaQuery")
```

## Example

```javascript
if (mediaQuery.matches) {
  // use desktop layout
}
```

## Learn more

- [Sensors overview](./sensors.md)
- [Inglorious Web overview](./overview.md)
