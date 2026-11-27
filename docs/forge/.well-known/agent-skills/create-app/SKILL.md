---
name: create-app
description: Scaffolding new Inglorious Web and SSX projects with create-app and its flags.
---

# @inglorious/create-app

Docs: https://inglorious.dev/create-app/ (options, mobile workflow, services and adapters).

`pnpm create @inglorious/app` (or npm/yarn). Answer everything with flags to skip all prompts; don't pipe keystrokes:

```bash
npm create @inglorious/app@latest -- my-app --template=ts --syntax=jsx --ui --theme=material-3 --routing --transitions --icons=material --languages=en,it --no-mobile --no-analytics --no-push --no-pwa --skills
```

- `--template=minimal|js|ts|ssx-js|ssx-ts`, `--syntax=lit-html|jsx|vue`.
- `--app-name="My App"`: the name people see (app bar, `<title>`, PWA manifest, `appName`), by default the project name in words (`my-app` → `My App`); never asked.
- Vite templates: `--ui`, `--theme=inglorious|material-ui|material-3|bootstrap|ios-18|ios-26`, `--mobile` (Capacitor; asks `--app-id=com.example.myapp`, the reverse-domain id in `capacitor.config.ts`, letters/digits/underscores per part, fixed after the first store release; pass it to skip the prompt), `--ci` (with `--mobile`: `.github/workflows/store-release.yml`, a manual GitHub Actions run that commits the next build number, archives on macOS and uploads to TestFlight with an App Store Connect API key, and uploads a signed bundle to Play's internal track; secrets listed in the generated README), `--routing`, `--transitions`, `--icons=material,fontawesome,lucide`, `--i18n`/`--languages=en,it` (first is default), `--analytics` (Firebase, consent prompt), `--auth`/`--auth-methods=password,code` (Supabase Auth: `src/app/auth` screen shown by `renderApp` in `src/main` until signed in, with routing a `/profile` page (route to the `auth` entity, a link or tab) with Sign out and Delete account, without routing both in the app bar, `erase-account` function, `supabase/templates` with codes; with `--mobile`, `src/api/supabase` keeps the session in the Keychain/Keystore via `createSecureStorage({ plugin: NativeBiometric })` and adds `@capgo/capacitor-native-biometric`), `--push` (FCM + Supabase sending, enables PWA), `--pwa`. Each has a `--no-` form. `--mobile` with `--push` adds mandatory native updates (`app_versions` table, `NativeUpdate` page) and live updates (`LiveUpdate` type in `src/store`, `live-updates` bucket, `pnpm live:keys` once, `pnpm live:release`; raise `liveUpdate.minBuild` in `package.json` on native changes). With `--ui`, the app registers `Toast` and renders the `toast` entity: `api.notify("#toast:show", { message, color })`. Every template has a `vercel.json` deploying only `main`. Every non-minimal project gets `.github/dependabot.yml` (weekly, grouped: `@inglorious/*` and the rest) and `pnpm-workspace.yaml` (`minimumReleaseAgeExclude: @inglorious/*`; `allowBuilds` for `@firebase/util` and `protobufjs` with Firebase). `--ui` and `--mobile` register the `Keyboard` type. `--mobile` adds `@capacitor/haptics`, registers `SystemBars`, calls `haptics.use(Haptics)` and, with `--routing`, registers `AppLinks` and `BackButton` (its entity's `rootPaths` are the pages: back on one closes the Android app; tabs navigate with `replace: true`). With `--ui`, `--mobile` and `--routing`, `App` is a shell (`src/app/style.css`): only `main` scrolls; the pages are one `tabs` list rendered as a `BottomNavigation` in the footer and, from 48rem, a permanent `Drawer` (`.app-drawer`) beside the page that hides the footer. `--pwa` registers `PwaUpdate`.
- Every Vite project gets Vitest and `index.test.*` beside the example Message type, using `trigger` from `@inglorious/web/test`. `vitest.config` merges `vite.config` (so JSX and Vue compile) with two projects: `unit` (`pnpm test`, `pnpm test:watch`) and `integration` (`*.integration.test.*`, `pnpm test:integration`, against a real backend). With i18n, `src/testing/setup` awaits `ready`; with Supabase, unit tests get placeholder `VITE_SUPABASE_*` values. The Supabase client goes through `backendUrl`, so a phone reaches the local stack.
- With sign-in or push, `supabase/config.toml` holds only what differs from the CLI's defaults (`project_id`; with sign-in, `enable_confirmations` and the three email templates) and `supabase/.gitignore` ignores `.branches` and `.temp`: `supabase start` works without `supabase init`. Both add Edge Functions: `pnpm edge` (`supabase functions serve`: logs in the terminal, reload on save; `supabase start` already serves them, but stopping `pnpm edge` removes the stack's functions too: calls answer 503 until `pnpm edge` runs again or `supabase stop && supabase start`) and `pnpm edge:check` (`deno check` + `deno lint` in `supabase/functions`; commit the `deno.lock` it writes). The functions import `npm:@inglorious/supabase@<the app's version>/edge`, stamped at scaffold time; `supabase/functions/deno.json` exempts it from Deno's one-day minimum dependency age, as `pnpm-workspace.yaml` does for pnpm.
- `--skills` installs the matching Forge skills via the skills CLI.

## Native projects

Never hand-edit `android/` or `ios/` for something `native` in `package.json` covers: `inglorious-capacitor configure` (`@inglorious/capacitor`, the `capacitor:sync:after` hook) rewrites them on every `cap sync`, idempotently.

```json
"native": {
  "appLinks": { "domain": "app.example.com", "paths": ["/", "/jobs*"], "exclude": ["#*access_token*"] },
  "ios": { "teamId": "ABCDE12345", "swipeBack": true, "infoPlist": { "NSMicrophoneUsageDescription": "…" } },
  "android": { "sha256": ["AA:…"], "permissions": ["android.permission.RECORD_AUDIO"] },
  "assets": { "background": "#ffffff", "backgroundDark": "#121212", "iconScale": 0.6, "splashScale": 0.3 }
}
```

`configure` also writes `PrivacyInfo.xcprivacy`: the required-reason APIs of known plugins that don't declare them (live update's `UserDefaults`), plus `ios.privacyManifest` (Apple's keys). Image file inputs offer the camera on iOS: add `NSCameraUsageDescription` to `infoPlist`, or the app closes.

- `appLinks`: Associated Domains + Android intent filter (`/x*` = prefix); with `teamId`/`sha256`, writes `public/.well-known/apple-app-site-association`/`assetlinks.json`. `exclude` (paths or `#` fragments) is iOS only.
- `ios.swipeBack` (on with routing): WebKit's edge-swipe back, via a generated `MainViewController` set in `Main.storyboard`; an existing controller is left alone (warns if it lacks `allowsBackForwardNavigationGestures`).
- Detected from dependencies: `@capacitor-firebase/messaging` → push entitlement, `remote-notification`, AppDelegate methods; `@capacitor-firebase/analytics` → collection off until consent.
- `google-services.json` and `GoogleService-Info.plist` live in the project root; the hook copies them in (and adds the plist to the Xcode target).
- `pnpm mobile:release` runs `inglorious-capacitor version` (package.json version into both projects, shared build number +1), then `build:release` and `cap sync`; `--push` apps get `secrets:push` and `vault:push` (`inglorious-supabase secrets`/`vault`). No scripts are copied into the project.
- `pnpm mobile:dev:ios`/`:android` (`inglorious-capacitor dev <platform> [cap run options]`): Vite on the network (`--host`) plus `cap run --live-reload`, so saves reload on the device; builds `webDir` first if empty.
- `pnpm mobile:assets` (`inglorious-capacitor assets [--ios] [--android]`) makes icons and light/dark splash screens from `public/logo.svg`/`.png`; `mobile:init:*` run it after `cap add`.
- `pnpm mobile:listing-assets` (`inglorious-capacitor listing-assets`) captures the running app's screens from `listing.config.js` at every store size and locale into `listing-assets/`, plus the promo images (`promo`: feature graphic, header, search results card) per locale and Play's 512px icon. It needs Chrome installed.

## Generated layout

- `src/app/`: shell (`index`, `style.css`) and its pieces (analytics, push prompts).
- `src/views/<screen>/` with routing; otherwise `src/app/home/`.
- `src/common/`, `src/api/`, `src/store/`, `src/i18n/`: shared code.
- `types/`: type definitions only (`index.d.ts`, `vite-env.d.ts`), imported as `#types` (`imports` in `package.json`).
- `@/` points to `src/` (`vite.config`, SSX itself, `tsconfig.json`/`jsconfig.json`, the import map in `minimal`). Imports across folders use it (`@/i18n`, `@/views/home`), imports within a folder stay relative (`./message`).

## TypeScript

Two TypeScripts side by side; keep both (pointing `typescript` at 7 breaks lint):

```json
"typescript": "npm:@typescript/typescript6@^6.0.2",
"@typescript/native": "npm:typescript@^7.0.2"
```

Needs `@inglorious/eslint-config` ≥ 1.1.3.

`types/index.d.ts` declares `AppEntity`, `AppState`, `AppApi`, `AppEvents` and a type alias per type (`MessageType`), written `export const Message: MessageType = {...}`. A new entity type goes in `AppEntity`, `AppState` and `AppEvents`; see the [store skill](../store/SKILL.md).
