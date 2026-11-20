---
name: supabase
description: "@inglorious/supabase: supabaseAuth for createAuth (passwords, email codes, reset, account erasure), realtimeSource for withLiveReload (entities reload when their tables change), createCaptcha for Auth's Turnstile, isNetworkError, supabaseNativeUpdate for mandatory native updates, publishLiveUpdate for signed live updates, and Edge Function helpers in /edge (CORS, errors, caller, IP, Resend, eraseUser)."
---

# @inglorious/supabase

## Client

```javascript
import { backendUrl } from "@inglorious/supabase";
export const supabase = createClient(backendUrl(import.meta.env.VITE_SUPABASE_URL), key);
```

`backendUrl(url, pageHost = location.hostname)`: a local backend (`localhost`, `127.0.0.1`) is reached at the page's host when that is a network address, as on a phone running the app from the dev server; anything else is unchanged.

## Live entities

```javascript
import { realtimeSource } from "@inglorious/supabase";
import { withLiveReload } from "@inglorious/web/decorators/with-live-reload";

const live = realtimeSource(supabase);

const types = {
  ApplicationList: [ApplicationList, withLiveReload({ source: live, tables: ["applications", "jobs"] })],
  ApplicationDetail: [
    ApplicationDetail,
    withLiveReload({
      source: live,
      tables: ["applications", "jobs"],
      payload: (entity) => entity.applicationId,
      isLive: (entity, api) => api.getEntity("router").route === entity.id,
    }),
  ],
};
```

`withLiveReload` options: `source`, `tables`, `event` (`"load"`), `payload`, `isLive`, `delay` (300 ms). TS: `withLiveReload<MyEntity, AppApi>(...)` types `api` in `payload` and `isLive`. Also reloads on visibility/online; unsubscribes on destroy. `realtimeSource(client, { schema })`: one channel per table, joined after `getSession()`, notifies on rejoin.

- Reload what the entity shows; don't match changes to rows (RLS deletes carry only the key).
- Never open channels by hand at boot: they join as anonymous.
- Apply your own writes immediately; Realtime is for others' changes.
- Don't overwrite a dirty form on reload: check `entity.isPristine`.
- `alter publication supabase_realtime add table public.<table>;`
- `isNetworkError(error)`: the call never reached the server (any client). Show "offline", not "Failed to fetch".

## Native updates

`createNativeUpdate({ adapter: supabaseNativeUpdate(supabase, { table, timeoutMs }) })` reads `min_build`, `store_url` by `platform` from `app_versions` (RLS select for `anon, authenticated`). Raise a platform's `min_build` only once its build is live in that store.

## Live updates

`@inglorious/supabase/live-update` (Node): `publishLiveUpdate({ dist, release, minBuild, privateKey, projectUrl, serviceKey, bucket, keepBundles })` zips, signs (RSA-SHA256, base64) and uploads `bundles/<release>.zip` and `manifest.json` to a public bucket (`live-updates`), then deletes all but the newest `keepBundles` (2) zips; a failed cleanup only warns. `generateLiveUpdateKeys()` → PEM pair; keep the private key off CI and Vercel. `liveUpdateManifestUrl(projectUrl)` from the main entry, for `createLiveUpdate`. CLI `inglorious-live-update`: `keys` (private to `~/.config/<name>/live-update.pem` or `LIVE_UPDATE_PRIVATE_KEY`, public to `live-update.pub.pem`), `build` (vite build, `.env` over `.env.local`, stamps `VITE_LIVE_UPDATE_RELEASE`), `release` (builds HEAD in a clean worktree, publishes for `package.json` `liveUpdate.minBuild`+; Supabase CLI login or `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`), `release --on-push` (pre-push: only when `main` gets app changes).

## Sign-in

`supabaseAuth(supabase, { captcha, accountExistsFunction, codeCreatesAccount = true, eraseFunction = "erase-account" })` is the adapter of `createAuth` from [web](../web/SKILL.md). Codes are the email templates' `{{ .Token }}` (Confirm signup, Magic Link, Reset Password); verify types `email`, `recovery`; `verifyLink(tokenHash)` for `{{ .TokenHash }}` links; `prepare(action)` starts the CAPTCHA once the email check knows the next step. `onSessionChange` re-reads `getSession()` after each event (a late `USER_UPDATED` can follow `SIGNED_OUT`). `eraseAccount` invokes the function, then `signOut({ scope: "local" })`. `accountExistsFunction` answers `{ exists }` for `{ email }`: rate-limit it. `codeCreatesAccount: false` keeps sign-in codes from creating accounts (`shouldCreateUser: false`), leaving them to sign-up. In Edge Functions, `eraseUser(adminClient, userId, { buckets })` empties `<bucket>/<userId>/` recursively, then `auth.admin.deleteUser`; rows go by `on delete cascade` to `auth.users`.

## Secrets

CLI `inglorious-supabase` (after `supabase link`): `secrets [NAME...]` runs `supabase secrets set --env-file` with `supabase/functions/.env` (all, or the names given), then compares `secrets list` SHA-256 fingerprints with the local values (`ok`/`DIFF`, exit 1 on a difference); `vault` upserts `project_url` and the legacy `service_role_key` (from `supabase projects api-keys`) into Vault for `pg_net` calls to functions. Values go through a 0600 temp file, never argv. create-app: `secrets:push`, `vault:push`.

## CAPTCHA

```javascript
import { createCaptcha, isCaptchaError } from "@inglorious/supabase";

const captcha = createCaptcha({
  siteKey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
  element: "captcha",
  language: () => currentLocale(),
});

captcha.prepare("login");
const { error } = await supabase.auth.signInWithPassword({
  email,
  password,
  options: { captchaToken: await captcha.token("login") },
});
if (isCaptchaError(error)) showError("errors.captcha");
```

- Tokens are single use.
- Empty site key locally: tokens are `undefined`.
- Ship builds with the key before turning protection on.
- CSP: `https://challenges.cloudflare.com` in `script-src` and `frame-src`; add `localhost` hostname for Capacitor.

## Edge Functions

```ts
import "jsr:@supabase/functions-js@2/edge-runtime.d.ts";
import { STATUS_CODE } from "jsr:@std/http@1/status";
import { currentUser, env, json, serve } from "npm:@inglorious/supabase@^0.13.0/edge";
import { createClient } from "npm:@supabase/supabase-js@2";

const admin = () => createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"));

serve(
  async (req) => {
    const user = await currentUser(admin(), req);
    if (!user) return json({ error: "Not signed in" }, STATUS_CODE.Unauthorized);
    return json({ id: user.id });
  },
  { fallbackError: "profile failed" },
);
```

- `serve`/`handle(handler, { fallbackError })`: CORS preflight, thrown errors become 500 `{ error }`.
- `json(body, status, headers)`, `env(name)` (throws if unset).
- `currentUser(client, req)`: from the token, or `null`.
- `callerRole`/`bearerToken`: unverified JWT role.
- `clientIp(req)`: `cf-connecting-ip`, then first `x-forwarded-for`.
- `upstreamError(service, res)`, `isLocalStack(url)` (skip paid services locally).
- `sendEmail(email, { apiKey, from })`/`sendEmails` (≤100, all or none): throw `EmailError` with `status`; email is `{ to, subject, text, html, headers }`.
