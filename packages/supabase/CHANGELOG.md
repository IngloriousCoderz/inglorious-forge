# @inglorious/supabase

## 0.1.0

### Minor Changes

- New package: Supabase integration for Inglorious Web. `realtimeSource(client)` is a source for `withLiveReload` over Supabase Realtime. It opens one channel per table, shared by every entity that reads it. A channel joins only once the client's saved session is restored, because one joined while it is being restored stays anonymous and only receives deletes. When a channel rejoins after a dropped connection, its subscribers reload.
