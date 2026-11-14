---
title: Device
description: What the phone or browser can sense or do, as entity types and helpers, with Capacitor plugins in a native app
---

# Device

`@inglorious/web/device/*` holds what the phone or browser can sense or do. Each works in a browser through its web API. In a native app, the ones that have a Capacitor plugin use it, once you hand it over as `plugin`.

Entity types keep their state serializable: listeners, observers and watches stay outside the entity.

## Sensors

- [Compass](./compass.md): heading from the device's orientation
- [Geolocation](./geolocation.md): the device's position, through `@capacitor/geolocation` in a native app
- [ElementSize](./element-size.md): an element's size, through `ResizeObserver`
- [MediaQuery](./media-query.md): whether a media query matches
- [NetworkStatus](./network-status.md): online or offline
- [PageVisibility](./page-visibility.md): whether the page is visible

Most sensors have `isSupported`, and the ones that follow changes have `isWatching` with watch and unwatch events, scoped to the entity.

## Actions and features

- [Share](./share.md): the system's share sheet, a download or a copied link
- [Haptics](./haptics.md): taps the user can feel
- [Local Notifications](./local-notifications.md): reminders at a given time
- [Biometrics](./biometrics.md): unlocking with Face ID or a fingerprint
- [Keyboard](./keyboard.md): keeping fixed elements above the on-screen keyboard
- [Storage](./storage.md): Preferences and the Keychain, for `withStorage` and Supabase

## Example

```javascript
import { createStore } from "@inglorious/store"
import { MediaQuery } from "@inglorious/web/device/media-query"

const store = createStore({
  types: { MediaQuery },
  autoCreateEntities: true,
})

if (store.getEntity("mediaQuery").matches) {
  // render the desktop layout
}
```
