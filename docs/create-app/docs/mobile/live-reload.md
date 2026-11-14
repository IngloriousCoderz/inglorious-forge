---
title: Live Reload on a Device
description: Run the app on a phone or emulator and see every save
---

# Live Reload on a Device

```bash
pnpm mobile:dev:ios
pnpm mobile:dev:android
```

Each runs the app on a phone or emulator against the Vite dev server on your computer: every file you save reloads on the device, as `pnpm dev` does in the browser.

Behind it, `inglorious-capacitor dev` starts Vite on the local network (`vite --host`) and runs `cap run --live-reload`, which installs the app pointed at your computer's address. It builds the web app first if it was never built, since `cap run` syncs it.

- The phone must be on the same Wi-Fi network as the computer.
- Pick a device with `--target <id>`; `pnpm cap run ios --list` lists them.
- `--port=<port>` moves Vite off 5173.
- Ctrl+C stops both, and Capacitor puts the native config back: the next `pnpm mobile:ios` or `pnpm mobile:sync` runs the built app again.

```bash
pnpm mobile:dev:android --target emulator-5554
```

Native plugins work as in a release build, since it is the real app. Changes to native code, plugins or `capacitor.config.ts` need a new run.

Unlike Expo Go, there is no prebuilt app to scan a QR code into: the first run installs your app, with your own plugins and settings, which also means what you test is what you ship.
