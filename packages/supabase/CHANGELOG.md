# @inglorious/supabase

## 0.13.3

### Patch Changes

- `onSessionChange` survives a session that can't be read. When `getSession()` rejects, as `createSecureStorage` from `@inglorious/web` now does when the Keychain or Keystore fails, nothing is reported and the read is tried again with backoff, instead of the listener never being called and `createAuth` never becoming ready. A server check that fails before the server answers keeps the session, as it does offline.

## 0.13.2

### Patch Changes

- `supabaseAuth` checks a restored session with the server before reporting its user: a session whose account was erased since, on another device or by resetting a local backend, is signed out locally instead of failing every request. A network failure keeps the session.

## 0.13.1

### Patch Changes

- The Edge Function examples import a current version of `@inglorious/supabase/edge`.

## 0.13.0

### Minor Changes

- `backendUrl` gives the backend's address as the page can reach it: on a phone running the app from a computer's dev server, a local Supabase is reached at that computer's address instead of `127.0.0.1`.

## 0.12.0

### Minor Changes

- `inglorious-supabase secrets` sets Edge Function secrets from `supabase/functions/.env` and checks them, and `inglorious-supabase vault` stores the project's URL and service role key in Vault

## 0.11.0

### Minor Changes

- `supabaseAuth` takes `codeCreatesAccount`: `false` keeps sign-in codes from creating accounts, leaving them to sign-up

## 0.10.1

### Patch Changes

- Imports and docs follow `@inglorious/web` moving its native modules under `@inglorious/web/native`.

## 0.10.0

### Minor Changes

- `supabaseAuth` signs in with an email's link (`verifyLink`) and starts the CAPTCHA of the next step early (`prepare`).

## 0.9.0

### Minor Changes

- Add `supabaseAuth`, the adapter of `createAuth` from `@inglorious/web/auth` over Supabase Auth, with CAPTCHA tokens and email codes. Add `eraseUser` to `@inglorious/supabase/edge`, which deletes a user and their files in the given Storage buckets.

## 0.8.0

### Minor Changes

- `publishLiveUpdate` deletes old bundles after publishing: it keeps the newest `keepBundles` zips, 2 by default, since the manifest points only to the latest and a failed bundle rolls back to the app's own code. A failed cleanup only warns.

## 0.7.0

### Minor Changes

- Add the `inglorious-live-update` command: `keys` makes the signing keys, `build` stamps a Vite build as a release, and `release` builds the committed code from a clean checkout, signs it and publishes it, also from a pre-push hook with `--on-push`.

## 0.6.0

### Minor Changes

- b7d4136: Add `@inglorious/supabase/live-update`, for Node: `publishLiveUpdate` zips a built app, signs it for `@capawesome/capacitor-live-update` and uploads it with its manifest to a public Storage bucket; `generateLiveUpdateKeys` makes the signing keys. `liveUpdateManifestUrl` says where the manifest is.

## 0.5.0

### Minor Changes

- Add `supabaseNativeUpdate(client)`, the adapter of `createNativeUpdate` that reads each platform's minimum build from the `app_versions` table.

## 0.4.0

### Minor Changes

- Add `createCaptcha` and `isCaptchaError`, which give Supabase Auth the Turnstile tokens its CAPTCHA protection asks for, and `clientIp` in `/edge`, which reads the caller's address from Cloudflare before anything the caller wrote.

## 0.3.0

### Minor Changes

- `isNetworkError(error)` tells a call that never reached the server from one the server refused, for PostgREST, Functions, Auth and Storage alike.

## 0.2.0

### Minor Changes

- Add `@inglorious/supabase/edge`, helpers for Edge Functions: `serve`, `handle`, `json`, `env`, `currentUser`, `callerRole`, `bearerToken`, `upstreamError`, `isLocalStack`, and `sendEmail` and `sendEmails` through Resend.

## 0.1.0

### Minor Changes

- New package: Supabase integration for Inglorious Web. `realtimeSource(client)` is a source for `withLiveReload` over Supabase Realtime. It opens one channel per table, shared by every entity that reads it. A channel joins only once the client's saved session is restored, because one joined while it is being restored stays anonymous and only receives deletes. When a channel rejoins after a dropped connection, its subscribers reload.
