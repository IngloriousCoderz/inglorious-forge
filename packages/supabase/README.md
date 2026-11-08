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

## Native app updates

`supabaseNativeUpdate(client)` is the adapter of `createNativeUpdate` from `@inglorious/web/native-update`: it reads each platform's minimum build from a table, so a release becomes mandatory with one update in the SQL editor, without a deploy.

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
import { createNativeUpdate } from "@inglorious/web/native-update"

const NativeUpdate = createNativeUpdate({
  adapter: supabaseNativeUpdate(supabase),
})
```

```sql
update public.app_versions set min_build = 7 where platform = 'android';
```

Raise a platform's minimum only once its new build is live in that store. Options: `table` (default `"app_versions"`) and `timeoutMs` (default 10 seconds).

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
