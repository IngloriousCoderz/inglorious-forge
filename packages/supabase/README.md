# @inglorious/supabase

Supabase integration for Inglorious Web.

- **Realtime**: `realtimeSource` tells entities that a table changed, so that [`withLiveReload`](https://inglorious.dev/web/advanced/decorators#withlivereload) reloads them.
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
