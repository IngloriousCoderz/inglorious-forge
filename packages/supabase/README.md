# @inglorious/supabase

Supabase integration for Inglorious Web.

- **Realtime**: `realtimeSource` tells entities that a table changed, so that [`withLiveReload`](https://inglorious.dev/web/advanced/decorators#withlivereload) reloads them.
- **CAPTCHA**: `createCaptcha` gives Supabase Auth the [Turnstile](https://developers.cloudflare.com/turnstile/) tokens its CAPTCHA protection asks for. See [CAPTCHA](#captcha).
- **Edge Functions**: `@inglorious/supabase/edge` has the helpers every function needs, from CORS to the caller's identity and sending email. See [Edge Functions](#edge-functions).

## Install

```bash
pnpm add @inglorious/supabase @inglorious/web @supabase/supabase-js
```

## Realtime

```js
import { realtimeSource } from "@inglorious/supabase"
import { createClient } from "@supabase/supabase-js"
import { withLiveReload } from "@inglorious/web/decorators/with-live-reload"

export const supabase = createClient(url, publishableKey)
const live = realtimeSource(supabase)

const types = {
  MessageList: [
    MessageList,
    withLiveReload({ source: live, tables: ["messages"] }),
  ],
}
```

Each table must be in the `supabase_realtime` publication:

```sql
alter publication supabase_realtime add table public.messages;
```

### What it takes care of

Realtime is easy to get subtly wrong. `realtimeSource` handles these cases:

- **One channel per table**, shared by every entity that reads it, and closed with the last of them.
- **Restored sessions.** A channel joins only once the client's saved session is restored. One that joins while the session is still being restored, as a channel opened at boot does, joins as anonymous and stays that way. It still receives deletes, which skip RLS, but no inserts or updates.
- **Dropped connections.** When a channel joins again after losing its connection, it tells its subscribers, because whatever changed in between was missed.

Signing in and out later needs nothing: the client hands every channel the new token itself.

It says that a table changed, not how. Under RLS, a delete carries only the row's primary key, so matching changes to rows on screen is fragile. Reloading what the entity shows is not.

### Options

`realtimeSource(client, { schema })`: `schema` defaults to `"public"`.

## Network errors

`isNetworkError(error)` tells a call that never reached the server from one the server refused. Each client reports it differently: PostgREST returns `{ message: "TypeError: Failed to fetch" }` (worded differently in every browser), Functions throws `FunctionsFetchError`, Auth `AuthRetryableFetchError`, and Storage wraps the failure in `originalError`.

```js
import { isNetworkError } from "@inglorious/supabase"

const { data, error } = await supabase.from("messages").select()
if (error) throw isNetworkError(error) ? new Error("errors.offline") : error
```

Pair it with the `NetworkStatus` sensor of `@inglorious/web` to tell people they are offline, and with `withLiveReload`, which reloads what is on screen when the connection comes back.

## Sign-in

`supabaseAuth` is the adapter of `createAuth` from `@inglorious/web/auth`, over Supabase Auth: passwords, codes sent by email, password resets, and erasing the account through an Edge Function.

```javascript
import { createCaptcha, supabaseAuth } from "@inglorious/supabase"

const captcha = createCaptcha({
  siteKey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
  element: "captcha",
})

export const authAdapter = supabaseAuth(supabase, { captcha })
```

### What it takes care of

- **Codes**: sign-up confirmations, sign-in codes and password resets all take the 6-digit `{{ .Token }}` of Supabase's email templates. Put it in the Confirm signup, Magic Link and Reset Password templates.
- **CAPTCHA**: with `captcha`, every call that signs in or sends an email carries a Turnstile token, and the challenge of the next step starts as soon as the email check knows it. Without a site key, no CAPTCHA is asked.
- **Links**: `verifyLink` signs in with an email's `{{ .TokenHash }}`, for templates that offer a link next to the code.
- **The session**: `onSessionChange` reads the session after every Auth event, so a late event never brings back a session that is gone.
- **Errors**: `errorCode` turns Supabase's error codes into the keys `createAuth` expects, network failures and CAPTCHA refusals included.

### Options

- `captcha`: from `createCaptcha`.
- `accountExistsFunction`: an Edge Function answering `{ exists }` for `{ email }`, so the screen skips straight to the password or to the new account. Rate-limit it: it tells anyone whether an email has an account.
- `eraseFunction`: the Edge Function that erases the caller's account. Defaults to `"erase-account"`.

### Erasing accounts

`eraseUser` from `@inglorious/supabase/edge` deletes a user and their files, with a client holding the service role key:

```typescript
import {
  currentUser,
  env,
  eraseUser,
  json,
  serve,
} from "npm:@inglorious/supabase/edge"
import { createClient } from "npm:@supabase/supabase-js@2"

serve(async (req) => {
  const db = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"))
  const user = await currentUser(db, req)
  if (!user) return json({ error: "Not signed in" }, 401)
  await eraseUser(db, user.id, { buckets: ["avatars"] })
  return json({ erased: true })
})
```

It empties the folder named after the user's id in each bucket, subfolders included, then deletes the user. Their rows go with them through `on delete cascade` foreign keys to `auth.users`.

## Native app updates

`supabaseNativeUpdate(client)` is the adapter of `createNativeUpdate` from `@inglorious/web/native/update`: it reads each platform's minimum build from a table, so a release becomes mandatory with one update in the SQL editor, without a deploy.

```sql
create table public.app_versions (
  platform text primary key check (platform in ('ios', 'android')),
  min_build integer not null check (min_build >= 1),
  store_url text
);

alter table public.app_versions enable row level security;

create policy "Anyone reads the minimum app versions"
  on public.app_versions for select to anon, authenticated
  using (true);

insert into public.app_versions (platform, min_build) values ('ios', 1), ('android', 1);
```

```js
import { supabaseNativeUpdate } from "@inglorious/supabase"
import { createNativeUpdate } from "@inglorious/web/native/update"

const NativeUpdate = createNativeUpdate({
  adapter: supabaseNativeUpdate(supabase),
})
```

```sql
update public.app_versions set min_build = 7 where platform = 'android';
```

Raise a platform's minimum only once its new build is live in that store. Options: `table` (default `"app_versions"`) and `timeoutMs` (default 10 seconds).

## Live updates

`@inglorious/supabase/live-update` publishes the web code of a Capacitor app for `watchLiveUpdate` from `@inglorious/web/native/live-update`. It runs in Node, from a release script.

```javascript
import {
  generateLiveUpdateKeys,
  publishLiveUpdate,
} from "@inglorious/supabase/live-update"

const { privateKey, publicKey } = generateLiveUpdateKeys()

const manifest = await publishLiveUpdate({
  dist: "dist",
  release: Math.floor(Date.now() / 1000),
  minBuild: 3,
  privateKey,
  projectUrl: "https://<ref>.supabase.co",
  serviceKey,
})
```

`publishLiveUpdate` zips `dist`, signs the zip the way `@capawesome/capacitor-live-update` checks it (RSA with SHA-256, base64), and uploads it to `bundles/<release>.zip` in a public bucket, `live-updates` by default, then `manifest.json`. Then it deletes all but the newest two zips (`keepBundles` changes how many): the manifest points only to the latest, and a bundle that fails rolls back to the app's own code, never to an older one. The previous zip stays for a device still downloading it. A failed cleanup only warns, since the update is out by then. `packLiveUpdate` does the zipping and signing alone. Keep the private key off the build server: whoever holds it can change the installed apps. The public key goes in the plugin's Capacitor config as `publicKey`.

`liveUpdateManifestUrl(projectUrl)`, from the main entry, is the manifest's URL for the app.

### The `inglorious-live-update` command

The same, ready to use from `package.json`:

```json
{
  "scripts": {
    "build:release": "inglorious-live-update build",
    "live:keys": "inglorious-live-update keys",
    "live:release": "inglorious-live-update release"
  },
  "liveUpdate": { "minBuild": 1 }
}
```

- `keys` writes the private key to `~/.config/<package name>/live-update.pem`, or to `LIVE_UPDATE_PRIVATE_KEY`, and the public key to `live-update.pub.pem` in the project.
- `build` runs `vite build` with the values in `.env` over `.env.local`, stamped as `VITE_LIVE_UPDATE_RELEASE`: the time, in seconds. Use it for store builds too, so a store build never goes back to an older bundle.
- `release` builds `HEAD` from a clean git worktree, so uncommitted changes never ship, and publishes it for builds from `liveUpdate.minBuild` up. It takes the project and its service role key from the Supabase CLI after `supabase link`, or from `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- `release --on-push`, in a pre-push hook, reads the refs git pushes on stdin and publishes only when `main` gets commits that touch the app: not `docs/`, `landing/`, `supabase/`, `.changeset/`, `.github/` or Markdown alone. Without a key it says so and lets the push through.

```sh
printf '%s\n' "$(cat)" | pnpm exec inglorious-live-update release --on-push
```

## CAPTCHA

With CAPTCHA protection on (Authentication → Attack Protection, provider Turnstile, with the widget's secret key), Supabase Auth refuses a signup, password login, magic link or confirmation resend without a valid token. `createCaptcha` makes those tokens:

```js
import { createCaptcha, isCaptchaError } from "@inglorious/supabase"

const captcha = createCaptcha({
  siteKey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
  element: "captcha",
  language: () => currentLocale(),
})

// Once the login form shows:
captcha.prepare("login")

// On submit:
const { error } = await supabase.auth.signInWithPassword({
  email,
  password,
  options: { captchaToken: await captcha.token("login") },
})
if (isCaptchaError(error)) showError("errors.captcha")
```

`element` is where the widget goes, or its id, such as `<div id="captcha"></div>` under the form. Keep it on the page across the form's steps. The widget only shows when Turnstile needs the person to act; otherwise it solves the challenge out of sight.

### What it takes care of

- **Single use.** A token works once, so each `token(action)` gets a new one, and each widget is removed once it answers.
- **Waiting.** A challenge takes a moment. `prepare(action)` starts it while the person types; `token(action)` then uses that token if it is for the same action and younger than Turnstile's five minutes, and otherwise makes a new one.
- **The script.** Cloudflare's script loads on the first token, once per page.
- **No site key.** Without one, as on a local stack, it loads nothing and every token is `undefined`, which Supabase Auth accepts while CAPTCHA protection is off.

`isCaptchaError(error)` is true for the widget's own `CaptchaError`, whose `code` is Turnstile's, and for Supabase Auth refusing the token with `captcha_failed`.

### Turning it on

Turn on CAPTCHA protection only once every client sends tokens: apps in the stores built without the site key can no longer sign in or sign up from then on, though sessions already open carry on.

- The content security policy needs `https://challenges.cloudflare.com` in `script-src` and `frame-src`.
- The widget's hostnames in Cloudflare need the site's domain, plus `localhost` for Capacitor apps, which run there.

## Edge Functions

`@inglorious/supabase/edge` is for functions running on Supabase's Deno runtime. It imports nothing, supabase-js included, so a function pays only for what it uses:

```ts
import {
  currentUser,
  env,
  json,
  serve,
} from "npm:@inglorious/supabase@^0.2.0/edge"
import { createClient } from "npm:@supabase/supabase-js@2"

const admin = () =>
  createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"))

serve(
  async (req) => {
    const user = await currentUser(admin(), req)
    if (!user) return json({ error: "Not signed in" }, 401)
    return json({ id: user.id })
  },
  { fallbackError: "Could not load the profile" },
)
```

- `serve(handler, { fallbackError })` and `handle(handler, options)`: answer the CORS preflight, and turn a thrown error into `{ error }` with status 500 and CORS headers, so the browser reads the message instead of a CORS failure. `serve` calls `Deno.serve`; `handle` returns the wrapped handler, for tests.
- `json(body, status, headers)`: a JSON response with CORS headers.
- `env(name)`: an environment variable that must be set. It throws, naming it, when it is not.
- `currentUser(client, req)`: the signed-in caller, from their access token and never from the body. Pass a client with the service role key.
- `callerRole(req)` and `bearerToken(req)`: the token's `role` claim, such as `"service_role"` for a call from the database, and the token itself. The role is read without checking the signature, which the platform checks before the function runs unless `verify_jwt` is off. Only the legacy JWT keys carry a role; `sb_secret_` keys do not.
- `upstreamError(service, res)`: an error for a failed call to another API, with the first 200 characters of its answer.
- `clientIp(req)`: the caller's IP address, for limits per address, or `null`. It reads Cloudflare's `cf-connecting-ip`, which fronts hosted Supabase, before the first `x-forwarded-for` entry, which the caller writes: a limit keyed on that entry is one anyone can skip.
- `isLocalStack(url)`: whether `SUPABASE_URL` is the local stack's, to skip outside services in development.

### Email

`sendEmail(email, { apiKey, from })` sends one email through [Resend](https://resend.com); `sendEmails(emails, { apiKey, from })` sends up to 100 in a single request, so a rate limit never splits them: they go out or fail together. Either throws an `EmailError` whose `status` is Resend's, where 429 means the rate or daily limit was reached. An email is `{ to, subject, text, html, headers }`; `headers` can carry `List-Unsubscribe`.

```ts
import {
  env,
  isLocalStack,
  sendEmail,
} from "npm:@inglorious/supabase@^0.2.0/edge"

if (!isLocalStack(env("SUPABASE_URL"))) {
  await sendEmail(
    { to: "ada@example.com", subject: "Welcome", text: "Hello!" },
    { apiKey: env("RESEND_API_KEY"), from: "App <hello@example.com>" },
  )
}
```
