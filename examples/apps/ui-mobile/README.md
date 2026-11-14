# ui-mobile

A phone-sized app that gathers the mobile features of `@inglorious/ui` and
`@inglorious/web` in one place, to try them on real phones. Deploy it (it has a
`vercel.json` that serves every path from `index.html`) and open it on iOS and
Android.

## What to try

- **Pull to refresh**: drag the inbox down from the top. Past the line, Chrome
  on Android vibrates once; letting go loads a new message.
- **Action sheet**: tap ⋯ on a message. Drag the sheet down by its handle, or
  flick it, to close it. Deleting vibrates and shows a snackbar with Undo.
- **Keyboard**: tap ✎ and type. The sheet stays above the keyboard, and so does
  the snackbar from **Save draft**. On **Settings**, typing in **Nickname**
  hides the tab bar.
- **Stacked pages**: open a message, then go back with the ‹ button, the
  browser's back, the iOS edge swipe or Android's back gesture. The page slides
  in and out; switching tabs slides towards the tab you tapped.
- **Haptics**: every kind, on its own page. Browsers vibrate on Android only;
  iOS browsers stay silent. Below the buttons, the page says whether the
  browser has the Vibration API and whether it played the last tap.
- **Themes**: every Inglorious UI theme, light and dark, on **Settings**.

## How it is wired

`src/main.js` calls `watchKeyboard()` from `@inglorious/web/device/keyboard`, which
sets `--iw-keyboard-height` on `<html>` while the keyboard is up. The sheets,
snackbars and toasts of `@inglorious/ui` follow it, and its bottom navigation
hides.

Haptics come from `haptics` in `@inglorious/web/device/haptics`. In a Capacitor app,
hand it the native plugin once and every call plays the system's haptics,
including the tick of `PullToRefresh`:

```js
import { Haptics } from "@capacitor/haptics"
import { haptics } from "@inglorious/web/device/haptics"

haptics.use(Haptics)
```

Page slides come from `withTransitions` in `src/store/middlewares.js`, as in
[ui-view-transitions](../ui-view-transitions/README.md).

Quick start:

```bash
# from repository root
cd examples/apps/ui-mobile
pnpm install
pnpm dev # also on your network, to open it from a phone
```
