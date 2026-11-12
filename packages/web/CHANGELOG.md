# @inglorious/react-store

## 6.26.0

### Minor Changes

- `createAnalytics` and `createPushPrompt` no longer touch storage: the consent and the new `isDeclined` live on the entity alone, and an app keeps them between visits with `withStorage` from `@inglorious/store/storage`. The `consentKey` and `declineKey` options are gone.
- Add `@inglorious/web/share`: `createShare({ plugin })` shares a link, a text or a file through the system's sheet in a native app (`@capacitor/share`), downloads files in a browser, else uses the browser's share sheet, else copies the link. The entity keeps the outcome, `"cancelled"` included.

### Patch Changes

- Updated dependencies
  - @inglorious/store@12.5.0

## 6.25.0

### Minor Changes

- `createAuth` notifies `#id:signedIn` with `{ user, isNew }` after every sign-in, signs in with an email's link through `linkSubmit({ tokenHash, purpose })` and the adapter's `verifyLink`, and calls the adapter's optional `prepare(action)` as soon as the email check knows the next step.

## 6.24.1

### Patch Changes

- `withDebounce` and `withThrottle` run the handlers they let through in an update of their own, through the `<handler>Debounced` and `<handler>Throttled` events. A debounced or trailing call that changed its entity used to change the state in place, so the screen didn't update until the next event.

## 6.24.0

### Minor Changes

- Add `@inglorious/web/auth`: `createAuth({ adapter, methods })` is the type behind a sign-in screen, with a password, a code sent by email or both, password reset, sign-out and account erasure, and `watchAuth` keeps its `user` in step with the session.

### Patch Changes

- `haptics.use(Haptics)` typechecks with `Haptics` from `@capacitor/haptics`, whose options take its own enums.
- Updated dependencies
  - @inglorious/store@12.4.0

## 6.23.1

### Patch Changes

- `watchKeyboard` sets `iw-keyboard-open` where the page shrinks for the keyboard too, as in an Android app, so bottom navigation steps aside there as well. `--iw-keyboard-height` stays `0px` in that case.

## 6.23.0

### Minor Changes

- Add `@inglorious/web/keyboard`: `watchKeyboard()` sets `--iw-keyboard-height` and the `iw-keyboard-open` class while the on-screen keyboard covers the page, from the visual viewport, in browsers and native apps. Add `@inglorious/web/haptics`: `haptics.selection()`, `impact()` and `notification()`, through `@capacitor/haptics` once handed over with `haptics.use(Haptics)`, otherwise vibrating where the browser can. Each call returns whether it played.

## 6.22.0

### Minor Changes

- `watchSystemBars` (`@inglorious/web/system-bars`) keeps the status and navigation bars of a Capacitor app readable: it sets their style from the app's own `color-scheme` and follows theme changes, so a light app on an Android phone in dark mode no longer gets white icons on a white page.

## 6.21.0

### Minor Changes

- Add `@inglorious/web/back-button`: `watchBackButton(App, { rootPaths })` makes Android's back button and back gesture close the app on a root path or with no history left, and go back in history everywhere else.

## 6.20.0

### Minor Changes

- b7d4136: Add `@inglorious/web/live-update`: `watchLiveUpdate` keeps a Capacitor app on its latest published web code with `@capawesome/capacitor-live-update`, downloading a newer bundle made for the installed build and applying it on the next trip to the background, and `createLiveUpdate` offers it meanwhile.

## 6.19.0

### Minor Changes

- `@inglorious/web/app-links` opens Universal Links and App Links in the router: `watchAppLinks(App, store)` sends the router to the link that started a native app, and to links that arrive while it runs.

  `create-app --mobile` generates `public/.well-known/apple-app-site-association` and, with routing, calls `watchAppLinks`. The README lists the steps left to the developer: the Team ID, the Associated Domains capability, and serving the file as JSON.

## 6.18.0

### Minor Changes

- Add `@inglorious/web/native-update`: `createNativeUpdate({ adapter })` blocks a native build older than the platform's minimum, and `watchNativeUpdate(App, store)` checks the installed build at launch and on every resume.

## 6.17.0

### Minor Changes

- - Typed events: `Api`, `Store` and `createStore` take the app's events as a third type argument, read from the types' own declarations with `EventsOf<CounterType | LabelType>`. `notify` then checks the event's name, after any target (`` `#${entity.id}:add` ``), and its payload. The store's own events are always allowed, and a typed api is still an `Api`. Without the argument nothing changes.
  - `defineType<Entity, AppApi>()({ ... })` checks a behavior member by member, so a template's sub-renderers can take props: `render(props, api)` takes the entity as its props, a sub-renderer `renderX(props, ownProps, api)` keeps the types it declares, and every other member is a handler, whose entity and api are inferred.
  - `@inglorious/web` re-exports the store's `Api` interface instead of aliasing it, so an app can tell its api the events of types whose handlers take that same api, and `mount` gives a typed store's events to the root render.

### Patch Changes

- Updated dependencies
  - @inglorious/store@12.3.0

## 6.16.0

### Minor Changes

- Lazy routes register every export of the module that an entity is of, such as a page's grid and form, and route to the default export, or else to the first export that renders. The router entity has `loadingPath` while loading. Navigating again to a path that is loading no longer loads and opens it twice, and navigating elsewhere while a route loads no longer gets pulled back once it arrives.

### Patch Changes

- The Form type cancels only the clicks of buttons that would submit or reset a form without saying so. It used to cancel every non-submit button's click in the document, which stopped a `commandfor` button such as Menu's trigger from opening its popover.
- Updated dependencies
- Updated dependencies
  - @inglorious/store@12.2.0

## 6.15.0

### Minor Changes

- `withLiveReload` also reloads every live entity when the browser comes back online.

## 6.14.1

### Patch Changes

- `NavigatePayload` declares `force`

## 6.14.0

### Minor Changes

- Add `pageRouteChange({ select, open, close })` to `@inglorious/web/router`, a `routeChange` handler that opens a page entity when the route resolves to it and closes it otherwise, and `safePath(value)`, which keeps a return path only if it stays on the site.

## 6.13.1

### Patch Changes

- Type declarations that now match what the code does. In UI: `Flex` takes `className` and any other property it sets on the element, and `element` is any HTML tag; `children` everywhere they are rendered as is is a new `Renderable` (arrays, `nothing` and `when()`'s results included); `icon` and `iconAfter` on `Input`, `IconButton`, `ButtonGroup` and `Chip` take a template; `IconButton` takes everything `Button` does; `onClick` receives the event; Combobox declares `filterOptions`, `formatOption`, `getOptionLabel`, `getOptionValue` and `isOptionSelected`. In Web: Form's payloads lose `entityId`, which was never read, `reset` takes only the entity, and `withLiveReload` now fits a type array in a typed store.
- Renders nothing with lit's `nothing` rather than an empty string. `api.render` of a missing entity, `withErrorBoundary`'s default fallback, a `withMotion` or `withErrorBoundary` type with no `render`, and the charts' tooltip and hover targets return `nothing`. Attributes with no value are now left off instead of set empty: `src` and `accept`, a chart path's `d`, a virtual list's `class`, an icon's and an image cropper's `style`, and an OpenUI card's `aria-label`. `alt` stays empty on purpose: to a screen reader, that means a decorative image.

## 6.13.0

### Minor Changes

- New `createAnalytics({ adapter })` (`@inglorious/web/analytics`): the type that measures how an app is used, and only once the user agreed. Its entity's `consent` (`"granted"`, `"denied"` or `null`) is remembered on the device, and while `isAsking` the app renders its own consent prompt, answered with `analyticsConsent`. `analyticsAsk` brings the prompt back. Once granted, every `routeChange` from the router is a page view, and `analyticsTrack` logs the app's own events. Nothing reaches the adapter before consent, and a failing adapter never reaches the app.

## 6.12.0

### Minor Changes

- New `createPushPrompt({ adapter })` (`@inglorious/web/push`): the type that asks a device for push notifications and keeps it registered. It asks in the app's own words first, since a refusal in the system's dialog may be for good: its entity's `isOpen` is a prompt for the app to render, `pushAsk` brings up the system's dialog, and `pushDecline` is remembered on the device. `pushStart` (at sign-in) registers a device already allowed, and `pushStop` (at sign-out) closes the prompt. The adapter supplies `isSupported`, `permission`, `request` and `register`, plus an optional `onTap` whose URLs open with `#router:navigate`.

## 6.11.0

### Minor Changes

- New `withLiveReload` decorator (`@inglorious/web/decorators/with-live-reload`): an entity reloads, by notifying its own `load` event, whenever a table it reads changes. The changes come from a `source` with `subscribe(table, onChange)`, such as `realtimeSource` from `@inglorious/supabase`. `payload` is what the event carries, `isLive` skips changes while the entity is off screen, and a burst of changes becomes one reload after `delay` (300 ms). Every live entity also reloads when the page comes back into view, since a backgrounded phone may have dropped the connection.

## 6.10.2

### Patch Changes

- Publish internal dependencies and peer dependencies as caret ranges instead of exact versions, and stop also listing peer dependencies as regular dependencies, so upgrading one package no longer causes version mismatches or duplicate installs
- Updated dependencies
  - @inglorious/store@12.1.1

## 6.10.1

### Patch Changes

- Announce a navigation to a page with the same name as the previous one, which screen readers skipped because the live region did not change.

## 6.10.0

### Minor Changes

- In an app with the `Router` type, `mount` announces each navigation to screen readers and moves focus back to the top of the new page, as a full page load would. `getPageName` chooses what is announced and `hasAccessibleNavigation: false` turns it off. Links with `data-is-focus-kept` navigate with `state: { isFocusKept: true }`, which keeps focus where it is.

### Patch Changes

- Updated dependencies
  - @inglorious/store@12.1.0

## 6.9.1

### Patch Changes

- The README's quick start registers its `Counter` type under the name its entities use, so the example works as written.

## 6.9.0

### Minor Changes

- `@inglorious/web/pwa` keeps an installed PWA on its latest version. `watchPwaUpdate(registration)` checks for a new version hourly and on every return to the foreground, and applies a downloaded one at launch and on each trip to or from the background, when nobody is mid-task. Given the store, it announces a version that lands mid-session to the `PwaUpdate` type, whose `isUpdateReady` flag and `pwaUpdateApply` event power an "Update now" button.

## 6.8.1

### Patch Changes

- Updated dependencies
- Updated dependencies
  - @inglorious/store@12.0.0
  - @inglorious/utils@5.1.0

## 6.8.0

### Minor Changes

- Export `nothing` from `@inglorious/web`. Bind it to leave an attribute off: `id=${id || nothing}` renders no `id` at all, rather than an invalid `id=""`.

## 6.7.2

### Patch Changes

- Documented imports point to paths that exist: `createReactStore`'s JSDoc types come from `@inglorious/store`, and the Web README imports `optimistic` from `@inglorious/store/optimistic` rather than a `withOptimistic` that it does not export.
- Updated dependencies
  - @inglorious/store@11.3.0

## 6.7.1

### Patch Changes

- Updated dependencies
  - @inglorious/store@11.2.0

## 6.7.0

### Minor Changes

- Types follow the store's: an entity drawn by a library type extends its entity interface, such as `interface AppRouterEntity extends RouterEntity { type: "Router" }`, and the type registers under any name with no cast.

  - `@inglorious/web`'s `Api` is the store's, which loading web's types gives a `render`. `RouterEntity`, `FormEntity` and the sensor entities take `id?: string` and any `type`. `@inglorious/web/test` has types, and the `lit-html` directives (`classMap`, `repeat`, …) are typed rather than `any`.
  - `I18nEntity`, `DataGridProps` and `VirtualListEntity` take `id?: string`; `ButtonProps`' `type` is optional. Component types (`RouterType`, `I18nType`, `LogoType`, …) are type aliases, which fit a store's `types`.
  - `withRealtime` accepts the type the store composes.
  - `@inglorious/react-store`'s `useEntity("form")` gives that entity's own type, and `useSelector` reads the app's state.

### Patch Changes

- Updated dependencies
  - @inglorious/store@11.1.0

## 6.6.2

### Patch Changes

- Updated dependencies
  - @inglorious/store@11.0.5
  - @inglorious/utils@5.0.0

## 6.6.1

### Patch Changes

- `api.render` accepts `undefined` in TypeScript, as it already did at runtime, so `api.render(router.route)` type-checks when no route matches.
- Updated dependencies
- Updated dependencies
  - @inglorious/store@11.0.4

## 6.6.0

### Minor Changes

- `mount` marks `<html>` with the `iw-native` class inside a Capacitor app, so CSS can tell the native app from a browser tab.

## 6.5.2

### Patch Changes

- Updated dependencies
  - @inglorious/utils@5.0.0
  - @inglorious/store@11.0.3

## 6.5.1

### Patch Changes

- Add "back" router event

## 6.5.0

### Minor Changes

- Enable view transitions

## 6.4.2

### Patch Changes

- Provide shortcut paths to common utils functions
- Updated dependencies
  - @inglorious/utils@4.0.0
  - @inglorious/store@11.0.2

## 6.4.1

### Patch Changes

- Add HMR Vite plugin
- Updated dependencies
  - @inglorious/store@11.0.1

## 6.4.0

### Minor Changes

- Add PWA and hybrid mobile support

## 6.3.0

### Minor Changes

- Add ElementSize type

## 6.2.0

### Minor Changes

- Add withDebounce decorator to web

## 6.1.2

### Patch Changes

- Fix accessing compass props asynchronously

## 6.1.1

### Patch Changes

- Simplify compass property naming

## 6.1.0

### Minor Changes

- Add compass type to web

## 6.0.0

### Major Changes

- Separate exports

### Patch Changes

- Updated dependencies
  - @inglorious/store@11.0.0

## 5.0.2

### Patch Changes

- Fix Markdown pages being exported as default

## 5.0.1

### Patch Changes

- Fix Markdown hydration in SSX apps

## 5.0.0

### Major Changes

- Use PascalCase for type names

### Patch Changes

- Updated dependencies
  - @inglorious/store@10.0.0
  - @inglorious/utils@3.8.0

## 4.5.1

### Patch Changes

- Cleanup web package

## 4.5.0

### Minor Changes

- Create a design system and make web package leaner

## 4.4.0

### Minor Changes

- Support web component hydration in SSX

## 4.3.0

### Minor Changes

- Add i18n to SSX

## 4.2.5

### Patch Changes

- Updated dependencies
  - @inglorious/store@9.6.0

## 4.2.4

### Patch Changes

- Updated dependencies
  - @inglorious/store@9.5.3

## 4.2.3

### Patch Changes

- Updated dependencies
  - @inglorious/store@9.5.2

## 4.2.2

### Patch Changes

- Updated dependencies
  - @inglorious/store@9.5.1

## 4.2.1

### Patch Changes

- Remove remaining occurrences of allowType

## 4.2.0

### Minor Changes

- Remove allowTypes flag in favor of entity auto-creation

### Patch Changes

- Updated dependencies
  - @inglorious/store@9.5.0

## 4.1.6

### Patch Changes

- Updated dependencies
  - @inglorious/store@9.4.0

## 4.1.5

### Patch Changes

- Further decrease bundle size by dynamically importing SSR

## 4.1.4

### Patch Changes

- Updated dependencies
  - @inglorious/store@9.3.1
  - @inglorious/utils@3.7.3

## 4.1.3

### Patch Changes

- Document Vue plugin on Web

## 4.1.2

### Patch Changes

- Updated dependencies
  - @inglorious/store@9.3.0

## 4.1.1

### Patch Changes

- Add `autoCreateEntities` config option to store
- Updated dependencies
  - @inglorious/store@9.2.0

## 4.1.0

### Minor Changes

- Add and document the compute() function for derived state

### Patch Changes

- Updated dependencies
  - @inglorious/store@9.1.0

## 4.0.11

### Patch Changes

- Better document table and list

## 4.0.10

### Patch Changes

- Document component libraries

## 4.0.9

### Patch Changes

- Clarify some points in Web's documentation

## 4.0.8

### Patch Changes

- Document testing in Inglorious Web

## 4.0.7

### Patch Changes

- Use standard render signature for sub-renders

## 4.0.6

### Patch Changes

- Update docs with web components info

## 4.0.5

### Patch Changes

- Add TSX web todomvc example
- Updated dependencies
  - @inglorious/store@9.0.1
  - @inglorious/utils@3.7.2

## 4.0.4

### Patch Changes

- Add Inglorious Web TS example

## 4.0.3

### Patch Changes

- Add JSX support

## 4.0.2

### Patch Changes

- Add SSX templates to create-app

## 4.0.1

### Patch Changes

- Make lazy route loading more robust

## 4.0.0

### Major Changes

- Consolidate route config and type changing

### Patch Changes

- Updated dependencies
  - @inglorious/store@9.0.0

## 3.0.1

### Patch Changes

- Exclude tests from NPM package
- Updated dependencies
  - @inglorious/store@8.0.1
  - @inglorious/utils@3.7.1

## 3.0.0

### Major Changes

- Enable tree-shaking

## 2.6.1

### Patch Changes

- Notify lifecycle events as targeted
- Updated dependencies
  - @inglorious/store@8.0.0

## 2.6.0

### Minor Changes

- Add select type

## 2.5.0

### Minor Changes

- Add route guards

## 2.4.0

### Minor Changes

- Add lazy loaded routes feature

### Patch Changes

- Updated dependencies
  - @inglorious/store@7.1.4

## 2.3.0

### Minor Changes

- Add a client-server Inglorious Web demo

### Patch Changes

- Updated dependencies
  - @inglorious/store@7.1.3

## 2.2.3

### Patch Changes

- Improve web framework docs
- Updated dependencies
  - @inglorious/store@7.1.2

## 2.2.2

### Patch Changes

- Fix ESLint not included and remove reactive selectors

## 2.2.1

### Patch Changes

- e93d313: Return function from reactive selector to force re-renders

## 2.2.0

### Minor Changes

- Add reactive selectors

## 2.1.1

### Patch Changes

- Updated dependencies
- Updated dependencies
  - @inglorious/store@7.1.1
  - @inglorious/utils@3.7.0

## 2.1.0

### Minor Changes

- Add default, customizable renderer for web table

## 2.0.1

### Patch Changes

- Updated dependencies
  - @inglorious/store@7.1.0

## 2.0.0

### Major Changes

- Rename @inglorious/lit into @inglorious/web

## 1.3.0

### Minor Changes

- Add list virtualization in @inglorious/web

## 1.2.1

### Patch Changes

- @inglorious/store@7.0.0

## 1.2.0

### Minor Changes

- Add basic router to @inglorious/web

## 1.1.0

### Minor Changes

- Add router type to @inglorious/web

## 1.0.1

### Patch Changes

- Updated dependencies
  - @inglorious/store@6.2.1

## 7.0.0

### Patch Changes

- Updated dependencies
  - @inglorious/store@6.2.0

## 6.0.3

### Patch Changes

- Updated dependencies
  - @inglorious/store@6.1.3

## 6.0.2

### Patch Changes

- Updated dependencies
  - @inglorious/store@6.1.2

## 6.0.1

### Patch Changes

- Add type safety
- Updated dependencies
  - @inglorious/store@6.1.1

## 6.0.0

### Patch Changes

- Updated dependencies
- Updated dependencies
  - @inglorious/store@6.1.0

## 5.0.1

### Patch Changes

- Updated dependencies
  - @inglorious/store@6.0.1

## 5.0.0

### Major Changes

- Move all eager logic to store and devtools

### Patch Changes

- Updated dependencies
  - @inglorious/store@6.0.0

## 4.0.0

### Patch Changes

- Updated dependencies
  - @inglorious/store@5.5.0

## 3.0.2

### Patch Changes

- Lower default fps for apps

## 3.0.1

### Patch Changes

- Updated dependencies
  - @inglorious/store@5.4.1

## 3.0.0

### Minor Changes

- Add eager mode by default on store

### Patch Changes

- Updated dependencies
  - @inglorious/store@5.4.0

## 2.0.0

### Minor Changes

- Enable eager mode by default on store

### Patch Changes

- Updated dependencies
  - @inglorious/store@5.3.0

## 1.0.2

### Patch Changes

- Fix notify function defined multiple times in react-store

## 1.0.1

### Patch Changes

- Fix peer dependencies in react store

## 1.0.0

### Major Changes

- Create react-store package

### Patch Changes

- Updated dependencies
  - @inglorious/store@5.2.0
