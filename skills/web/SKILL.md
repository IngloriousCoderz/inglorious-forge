---
name: web
description: "@inglorious/web: lit-html rendering over @inglorious/store - mount, api, directives, router, forms, device (sensors, geolocation, share, haptics, local notifications, biometrics, keyboard, storage), native app (app links, back button, system bars, store and live updates), PWA updates, sign-in, analytics, push, testing."
---

# @inglorious/web

Conventions: [web-best-practices](../web-best-practices/SKILL.md). Store, events and handlers: [store](../store/SKILL.md).

The whole tree re-renders; lit-html patches the DOM. All state lives in entities; change it only in handlers via `api.notify`. Prefer `#id:event` with a bare event name.

```javascript
import { createStore } from "@inglorious/store";
import { html, mount } from "@inglorious/web";

const types = {
  Counter: {
    increment(entity) {
      entity.value++;
    },
    render(entity, api) {
      return html`<button @click=${() => api.notify(`#${entity.id}:increment`)}>${entity.value}</button>`;
    },
  },
};

const store = createStore({ types, entities: { counter1: { type: "Counter", value: 0 } } });
mount(store, (api) => html`${api.render("counter1")}`, document.getElementById("root"));
```

- `mount(store, renderFn, element, { onError, fallback, hydrate, hasAccessibleNavigation, getPageName })` hydrates existing markup, notifies `init` once mounted and resolves to an unsubscribe.
- `autoCreateEntities: true` creates one entity per type (init in `create`); list several instances in `entities`.
- `api`: `render(id)`, `getEntity(id)`, `getEntities()`, `select(fn)`, `notify(event, payload)`, `dispatch`, `getTypes`, `getType`.
- `withDebounce(delay, ["saveData"])` from `@inglorious/web/decorators/with-debounce`: the handler runs after the delay in an update of its own (`saveDataDebounced` event), so it may write to the entity. Same for `withThrottle` (`<handler>Throttled`). Debounce a request by wrapping the event that starts it: `[Type, withDebounce(300, ["search"])]` with `handleRequest("search", ...)`.

```javascript
import { html, nothing, svg } from "@inglorious/web"; // id=${id || nothing} omits the attribute
import { choose } from "@inglorious/web/directives/choose";
import { classMap } from "@inglorious/web/directives/class-map";
import { ref } from "@inglorious/web/directives/ref";
import { repeat } from "@inglorious/web/directives/repeat";
import { styleMap } from "@inglorious/web/directives/style-map";
import { unsafeHTML } from "@inglorious/web/directives/unsafe-html";
import { when } from "@inglorious/web/directives/when";
```

## Router

```javascript
import { Router, setRoutes, pageRouteChange, safePath } from "@inglorious/web/router";

const entities = { router: { type: "Router" } };
setRoutes({ "/": "homePage", "/users/:id": "userPage", "/clients": () => import("./pages/clients.js"), "*": "notFoundPage" });

const renderApp = (api) => {
  const { route } = api.getEntity("router");
  return html`<main>${route ? api.render(route) : ""}</main>`;
};

api.notify("#router:navigate", "/users/456"); // or { to, replace: true }
```

- Lazy routes register every named export with an entity and route to the default (or first rendering) export; `isLoading`, `loadingPath`. Lazy pages missed earlier broadcasts: read what they need in `create`.
- `mount` announces navigation and moves focus; `data-is-focus-kept` or `state: { isFocusKept: true }` keeps it; `getPageName`, `hasAccessibleNavigation: false` options.
- In `routeChange` read the route from the payload; the router entity still names the old one.
- Page loads: `routeChange: pageRouteChange({ select: (p) => p.params.jobId, open: (entity, id, api) => ..., close: (entity) => ... })`.
- Guards: a decorator whose `routeChange` checks `payload.route !== entity.id`, reads the session with `api.getEntity("session")` (events in a chain see each other's changes), redirects with `replace: true`, else calls `type.routeChange?.(...)`. Redirect back with `safePath(router.query.from) ?? "/"`.

## Form

```javascript
import { Form, getFieldValue, getFieldError, isFieldTouched } from "@inglorious/web/form";
const entities = { loginForm: { type: "Form", initialValues: { username: "", password: "" } } };
```

Events: `fieldChange` `{ path, value, validate? }`, `fieldBlur` `{ path, validate? }`, `fieldArrayAppend|Remove|Insert|Move`, `reset`, `validate`/`validateAsync` `{ validate }`, your own `submit`.

## Device

`@inglorious/web/device/*`: what the phone or browser can sense or do. Each is an entity type: a plain object when it needs nothing (`Keyboard`, `Compass`), a `createX({ plugin, ... })` factory when it needs a Capacitor plugin or an adapter. It starts in `create`, stops in `destroy`, scopes its events (`#id:event`) and keeps handles (listeners, observers, timers) in the factory's closure, never in the entity, so the entity stays serializable.

### Sensors

Entity types; most watch on `create`, with `isSupported`, `isWatching` and `<name>Watch`/`<name>Unwatch` events.

- `Compass` (`device/compass`): `heading`, `isActive`, `isPermissionGranted`, `isLoading`, `error`, `manualOffset`; events `compassPermissionsRequest` (iOS asks), `compassWatch`, `compassUnwatch`.
- `createGeolocation({ plugin })` (`device/geolocation`; `Geolocation` from `@capacitor/geolocation`): `position` `{ coords, timestamp }`, `isLoading`, `error`; events `geolocationRequest(options)`, `geolocationWatch(options)`, `geolocationUnwatch`.
- `ElementSize` (`device/element-size`): `width`, `height` of the element matching `selector`.
- `MediaQuery` (`device/media-query`): `matches` for the entity's `media`.
- `NetworkStatus` (`device/network-status`): `isOnline`.
- `PageVisibility` (`device/page-visibility`): `isVisible`.

### Share

```javascript
import { Share } from "@capacitor/share";
import { createShare } from "@inglorious/web/device/share";

const types = { Share: createShare({ plugin: Share }) };
api.notify("#share:share", { title, text, url }); // fileName too: a file
```

Native app with the plugin: system sheet. Browser: a `url` with `fileName` downloads; else Web Share; else the link is copied. Entity: `result` `shared|downloaded|copied|cancelled` (closing the sheet isn't an error), `status`/`error` (`unsupported|failed`) from `handleRequest`, `canShare` (a link can be shared at all).

### Haptics

```javascript
import { Haptics } from "@capacitor/haptics";
import { haptics } from "@inglorious/web/device/haptics";

haptics.use(Haptics); // native app: system haptics
haptics.selection(); // toggle flipped, threshold crossed
haptics.impact("heavy"); // light | medium (default) | heavy
haptics.notification("error"); // success (default) | warning | error
```

Each call returns whether it played. Without the plugin: `navigator.vibrate` (Chrome on Android, after the user's first tap); iOS browsers stay silent. Plugin failures are swallowed. `PullToRefresh` ticks via `haptics.selection()` when it arms.

### Local notifications

```javascript
import { LocalNotifications } from "@capacitor/local-notifications";
import { createLocalNotifications } from "@inglorious/web/device/local-notifications";
const types = { Reminders: createLocalNotifications({ plugin: LocalNotifications }) };
api.notify("#reminders:localNotificationSchedule", { id: 1, title, body, at: new Date(...), url: "/jobs/1" });
api.notify("#reminders:localNotificationCancel", 1);
```

Native: shown even with the app closed; browser: Notification API while the page is open. `id` is a whole number the app picks. Entity `permission` (`granted|denied|prompt|unsupported`, `null` until known); `localNotificationsAsk` from a tap. Taps on one with `url` go through `onTap(url, api)`, default `#router:navigate`.

### Biometrics

```javascript
import { NativeBiometric } from "@capgo/capacitor-native-biometric";
import { createBiometrics } from "@inglorious/web/device/biometrics";
const types = { Biometrics: createBiometrics({ plugin: NativeBiometric }) };
api.notify("#biometrics:verify", { reason: "Unlock your account" });
```

Entity `isAvailable`, `biometryType` (`face|fingerprint|iris|multiple|passcode`), `result` (`verified|cancelled`), `status`/`error` (`unavailable|failed`) from `handleRequest`. Never available in a browser. iOS needs `NSFaceIDUsageDescription`.

### Keyboard

```javascript
import { Keyboard } from "@inglorious/web/device/keyboard";
const types = { Keyboard };
const entities = { keyboard: { type: "Keyboard" } };
```

Entity `isSupported`, `isOpen`, `height` (what the keyboard covers; 0 where the page shrinks for it, as in an Android app), from `visualViewport`, no plugin. The type also sets `--iw-keyboard-height` on `<html>` and `.iw-keyboard-open` while up: Inglorious UI sheets, snackbars and toasts move above it, bottom navigation hides. Own fixed elements: `bottom: var(--iw-keyboard-height, 0px)`. Opens only with a text field focused, closes only when the viewport grows back (not on blur, so a tapped button doesn't move before its click).

### Storage

```javascript
import { Preferences } from "@capacitor/preferences";
import { createNativeStorage } from "@inglorious/web/device/storage";
const preferences = createNativeStorage({ plugin: Preferences }); // localStorage in a browser
const types = { Settings: [Settings, withStorage(["theme"], { storage: () => preferences })] };
```

The OS can clear a WebView's localStorage; Preferences survives. Native reads are async: defaults first, then `storageRestore`. Also fits Supabase's `auth.storage`.

`createSecureStorage({ plugin: NativeBiometric })` (same module): the Keychain or Keystore for secrets such as Supabase's session; localStorage in a browser.

## Native app

`@inglorious/web/native/*`: what exists because the app is native. Each does nothing outside a native app; `isNative()` from `@inglorious/web/native` says whether it is one.

### App links

```javascript
import { App } from "@capacitor/app";
import { createAppLinks } from "@inglorious/web/native/app-links";

const types = { AppLinks: createAppLinks({ plugin: App }) }; // launch URL and appUrlOpen → #router:navigate; no-op outside native
const entities = { appLinks: { type: "AppLinks" } };
```

`router` names another router entity; entity `url` is the last link opened. The domain must vouch for the app with `/.well-known/apple-app-site-association` (iOS) and `/.well-known/assetlinks.json` (Android): `native.appLinks` in `package.json` generates both, plus the Associated Domains entitlement and the intent filter ([create-app](../create-app/SKILL.md)). Exclude links carrying auth tokens so sign-in stays in the browser.

### Back button

```javascript
import { createBackButton } from "@inglorious/web/native/back-button";

const types = { BackButton: createBackButton({ plugin: App }) }; // Android back: history.back(), or exitApp() on a root path or empty history
const entities = { backButton: { type: "BackButton", rootPaths: ["/", "/profile"] } };
```

Navigate between root paths (tabs, drawer) with `{ to, replace: true }` so they don't pile up history. No-op outside native; iOS has no back button.

### System bars

```javascript
import { SystemBars } from "@capacitor/core";
import { createSystemBars } from "@inglorious/web/native/system-bars";

const types = { SystemBars: createSystemBars({ plugin: SystemBars }) }; // bar style from the app's color-scheme, follows theme class changes
const entities = { systemBars: { type: "SystemBars" } };
```

Without it, Android's bars follow the device's dark mode: white icons on a light app. `color-scheme: light dark` keeps the device's style. Entity `style` (`DARK|LIGHT|DEFAULT`); no-op outside native.

### Store updates

```javascript
import { App } from "@capacitor/app";
import { createNativeUpdate } from "@inglorious/web/native/update";

const types = { NativeUpdate: [createNativeUpdate({ adapter, plugin: App }), template] }; // checks at launch and every resume; no-op outside native
```

Adapter: `requirement(platform)` → `{ minBuild, storeUrl }` or `null` (`supabaseNativeUpdate` from [supabase](../supabase/SKILL.md)). Entity `isUpdateRequired`, `storeUrl`; events `nativeUpdateCheck` `{ platform, build }` (sent by the type with `plugin`, or by the app), `nativeUpdateApply` (opens the store). Failed checks keep the last answer. Render only the update page while `isUpdateRequired`.

### Live updates

```javascript
import { LiveUpdate } from "@capawesome/capacitor-live-update";
import { createLiveUpdate } from "@inglorious/web/native/live-update";

const types = {
  LiveUpdate: createLiveUpdate({ plugin: LiveUpdate, app: App, manifestUrl, release: Number(import.meta.env.VITE_LIVE_UPDATE_RELEASE) }),
};
```

Replaces a Capacitor app's web code without the stores. Manifest `{ release, minBuild, url, checksum, signature }` (published by `publishLiveUpdate`, [supabase](../supabase/SKILL.md)); wanted when `release` is newer than the running one and the build ≥ `minBuild`. Checks at launch, hourly (`checkEveryMs`) and on resume, downloads in the background, applies on pause; entity `isUpdateReady`, `pendingRelease`, events `liveUpdateReady(release)`, `liveUpdateApply`. Stamp only release builds with `release` (a timestamp): without one, or outside native, the type does nothing. Plugin config: `publicKey` (one line), `readyTimeout`, `autoBlockRolledBackBundles`. Raise `minBuild` when anything native changes.

## PWA updates

```javascript
import { isNative } from "@inglorious/web/native";
import { createPwaUpdate } from "@inglorious/web/pwa";
import { registerSW } from "virtual:pwa-register";

if (!isNative()) registerSW();
const types = { PwaUpdate: createPwaUpdate() }; // reads navigator.serviceWorker.ready; no-op native or without a worker
const entities = { pwaUpdate: { type: "PwaUpdate" } };
```

Needs `registerType: "prompt"`, `injectRegister: false`. Checks hourly (`checkEveryMs`) and on foreground; applies at launch and background transitions. Entity `isUpdateReady`; events `pwaUpdateReady`, `pwaUpdateApply`. `applyPwaUpdate()` reloads onto the waiting worker.

## Sign-in

```javascript
import { createAuth } from "@inglorious/web/auth";

const types = { Auth: { ...createAuth({ adapter, methods: ["password", "code"] }), render } }; // `user` follows the session from `create`; `isReady` once it's read
```

`methods`: `password` (sign in, sign up confirmed by code, reset by code), `code` (code only, creates the account). Entity `step` `email|password|signUp|code|reset`, `email`, `codeFor`, `status` `idle|loading`, `error` key (`invalidEmail`, `invalidCode`, `weakPassword`, `invalidCredentials`, `accountExists`, `rateLimited`, `captcha`, `network`, `unknown`), `isCodeResent`, `isEraseAsked`, `user`, `isReady`. Events: `emailSubmit(email)`, `signInSubmit(password)`, `signUpSubmit({ password, data })`, `codeSubmit(code)`, `resetSubmit({ code, password })`, `signUpShow`, `signInShow`, `codeRequest`, `codeResend`, `resetRequest`, `back`, `signOut`, `accountEraseAsk`, `accountErase`, `accountEraseCancel`. Render nothing until `isReady`, the screen while `!user`. Every sign-in notifies `#id:signedIn` `{ user, isNew }`: add a `signedIn` handler to the type (onboarding when `isNew`). `linkSubmit({ tokenHash, purpose })` for a page an email link opens (behind a tap: mail scanners). Adapter: `supabaseAuth` from [supabase](../supabase/SKILL.md), or any object with `onSessionChange`, `signIn`, `signUp` (→ user or `null` when a code must confirm), `sendCode`, `verifyCode(email, code, purpose)`, `verifyLink(tokenHash, purpose)`, `resendCode`, `sendResetCode`, `updatePassword`, `signOut`, `eraseAccount`, `errorCode`, optional `accountExists` and `prepare(action)` (early CAPTCHA).

## Analytics

```javascript
import { createAnalytics } from "@inglorious/web/analytics";
const types = { Analytics: [createAnalytics({ adapter }), template, withStorage(["consent"], { key: "my-app-analytics" })] };
api.notify("#analytics:analyticsTrack", { name: "sign_up", params: { method: "email" } });
```

Adapter: `setConsent(isGranted)`, `pageView({ route, path })`, `event(name, params)`. Nothing before consent; `routeChange` is a page view. Entity `consent` (`granted|denied|null`; kept between visits only by `withStorage`), `isAsking`. Events `analyticsConsent` (boolean), `analyticsAsk`, `analyticsTrack`.

## Push

```javascript
import { createPushPrompt } from "@inglorious/web/push";
const prompt = createPushPrompt({ adapter, onTap });
const types = { PushPrompt: [{ ...prompt, ...template, sessionStart: prompt.pushStart, sessionEnd: prompt.pushStop }, withStorage(["isDeclined"])] };
```

Adapter: `isSupported()`, `permission()`/`request()` → `granted|denied|prompt` (browser `request` calls `Notification.requestPermission()` before any await), `register()`, optional `onTap(listener)`. App unregisters at sign-out. Entity `isOpen`, `isActive`, `isDeclined` (keep with `withStorage`); events `pushStart`, `pushStop`, `pushAsk` (from the tap), `pushDecline`. Taps navigate unless `onTap(url, api)`.

## Testing

```javascript
import { trigger, render } from "@inglorious/web/test";

const { entity, events } = trigger({ type: "Counter", id: "c", value: 10 }, Counter.increment, { amount: 5 });

const root = document.createElement("div");
render(Counter.render({ id: "c", value: 42 }, api), root);
```

DevTools: `createDevtools().middleware` from `@inglorious/store/client/devtools` in dev.
