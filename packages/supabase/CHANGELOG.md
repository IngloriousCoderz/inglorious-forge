# @inglorious/supabase

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
