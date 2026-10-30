import type { SupabaseClient } from "@supabase/supabase-js"

/** Delivers a backend's changes, one table at a time, as `withLiveReload` expects. */
export interface LiveSource {
  /** Calls `onChange` on every change to `table`; returns the unsubscribe. */
  subscribe(table: string, onChange: () => void): () => void
}

export interface RealtimeSourceOptions {
  /** Defaults to `"public"`. */
  schema?: string
}

/**
 * A live source over Supabase Realtime: one channel per table, joined once
 * the saved session is restored, which tells its subscribers when it joins
 * again after a dropped connection.
 */
export declare function realtimeSource(
  client: SupabaseClient,
  options?: RealtimeSourceOptions,
): LiveSource
