# @inglorious/supabase

Supabase integration for Inglorious Web.

It starts with Realtime: `realtimeSource` tells entities that a table changed, so that [`withLiveReload`](https://inglorious.dev/web/advanced/decorators#withlivereload) reloads them.

## Install

```bash
pnpm add @inglorious/supabase @inglorious/web @supabase/supabase-js
```

## Usage

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

## What it takes care of

Realtime is easy to get subtly wrong. `realtimeSource` handles these cases:

- **One channel per table**, shared by every entity that reads it, and closed with the last of them.
- **Restored sessions.** A channel joins only once the client's saved session is restored. One that joins while the session is still being restored, as a channel opened at boot does, joins as anonymous and stays that way. It still receives deletes, which skip RLS, but no inserts or updates.
- **Dropped connections.** When a channel joins again after losing its connection, it tells its subscribers, because whatever changed in between was missed.

Signing in and out later needs nothing: the client hands every channel the new token itself.

It says that a table changed, not how. Under RLS, a delete carries only the row's primary key, so matching changes to rows on screen is fragile. Reloading what the entity shows is not.

## Options

`realtimeSource(client, { schema })`: `schema` defaults to `"public"`.
