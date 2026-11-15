---
title: API Reference
description: The runtime API of Inglorious Web
---

# API Reference

Inglorious Web's runtime is `mount`, lit-html's `html`, `svg` and `nothing`, and the subpaths listed below. The store's own API, `createStore`, the `api` handlers receive, `handleRequest`, `fsm` and the rest, is in the [store reference](https://inglorious.dev/store/api/reference).

## `mount(store, renderFn, element, options?)`

Renders `renderFn(api)` into `element`, subscribes to the store so every update renders again, and resolves to a function that unsubscribes.

```javascript
import { html, mount } from "@inglorious/web"

const unmount = await mount(
  store,
  (api) => api.render("app"),
  document.getElementById("root"),
  {
    onError: (error, api) => console.error(error),
    fallback: (error, api) => html`<p>Something went wrong</p>`,
  },
)
```

- Markup already in the element, as a server-rendered page has, is hydrated rather than replaced; `hydrate: false` turns that off.
- `onError` is called when the root render throws, `console.error` by default, and `fallback` is rendered in its place. See [Error Handling](../advanced/error-handling.md).
- With the `Router` type, each navigation is announced to screen readers and moves focus to the top of the new page; `hasAccessibleNavigation: false` turns it off, and `getPageName` chooses what is announced. See [Router](../featured/router.md#accessible-navigation).
- Once mounted, it notifies `init`.

## `api.render(id, typeName?, type?)`

Added to the store's api: renders the entity `id` through its type's `render`, or `nothing` when there is no such entity. Given a type name and a type, it registers the type first if it is missing, which is how the Vue plugin renders components lazily.

## Entry points

The root entry is small on purpose: everything else has its own subpath, so it can be tree-shaken.

| Subpath                                      | What it holds                                                                                       |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `@inglorious/web`                            | `mount`, `html`, `svg`, `nothing`                                                                   |
| `@inglorious/web/directives/*`               | lit-html directives: `class-map`, `ref`, `repeat`, `style-map`, `unsafe-html`, `when`, ...          |
| `@inglorious/web/static`                     | `staticHtml`, `unsafeStatic`                                                                        |
| `@inglorious/web/hydrate`                    | Hydration support for server-rendered pages                                                         |
| `@inglorious/web/test`                       | `render`, `trigger`, `createMockApi`                                                                |
| `@inglorious/web/form`                       | [`Form`](/featured/form)                                                                            |
| `@inglorious/web/router`                     | [`Router`, `setRoutes`, `pageRouteChange`, `safePath`](/featured/router)                            |
| `@inglorious/web/decorators/*`               | [`with-debounce`, `with-throttle`, `with-error-boundary`, `with-live-reload`](/advanced/decorators) |
| `@inglorious/web/auth`                       | [`createAuth`](/featured/sign-in)                                                                   |
| `@inglorious/web/analytics`                  | [`createAnalytics`](/featured/analytics)                                                            |
| `@inglorious/web/push`                       | [`createPushPrompt`](/featured/push)                                                                |
| `@inglorious/web/pwa`                        | [`createPwaUpdate`, `applyPwaUpdate`](/featured/pwa-updates)                                        |
| `@inglorious/web/device/biometrics`          | [`createBiometrics`](/featured/biometrics)                                                          |
| `@inglorious/web/device/compass`             | [`Compass`](/featured/compass)                                                                      |
| `@inglorious/web/device/element-size`        | [`ElementSize`](/featured/element-size)                                                             |
| `@inglorious/web/device/geolocation`         | [`createGeolocation`](/featured/geolocation)                                                        |
| `@inglorious/web/device/haptics`             | [`haptics`](/featured/haptics)                                                                      |
| `@inglorious/web/device/keyboard`            | [`Keyboard`](/featured/keyboard)                                                                    |
| `@inglorious/web/device/local-notifications` | [`createLocalNotifications`](/featured/local-notifications)                                         |
| `@inglorious/web/device/media-query`         | [`MediaQuery`](/featured/media-query)                                                               |
| `@inglorious/web/device/network-status`      | [`NetworkStatus`](/featured/network-status)                                                         |
| `@inglorious/web/device/page-visibility`     | [`PageVisibility`](/featured/page-visibility)                                                       |
| `@inglorious/web/device/share`               | [`createShare`](/featured/share)                                                                    |
| `@inglorious/web/device/storage`             | [`createNativeStorage`, `createSecureStorage`](/featured/storage)                                   |
| `@inglorious/web/native`                     | `isNative`                                                                                          |
| `@inglorious/web/native/app-links`           | [`createAppLinks`](/featured/app-links)                                                             |
| `@inglorious/web/native/back-button`         | [`createBackButton`](/featured/back-button)                                                         |
| `@inglorious/web/native/live-update`         | [`createLiveUpdate`, `isLiveUpdateWanted`](/featured/live-updates)                                  |
| `@inglorious/web/native/system-bars`         | [`createSystemBars`, `styleFor`](/featured/system-bars)                                             |
| `@inglorious/web/native/update`              | [`createNativeUpdate`](/featured/native-updates)                                                    |

A type that needs nothing from outside is a plain object (`Keyboard`, `Compass`); one that needs a Capacitor plugin or an adapter is made by a `createX({ plugin, adapter })` factory. Each starts what it needs in `create` and stops it in `destroy`.

## TypeScript

Every subpath ships its declarations: an `XEntity` interface to extend and an `XType` for the events. See [TypeScript](../guide/typescript.md).
