const DEFAULT_TABLE = "app_versions"
const DEFAULT_TIMEOUT_MS = 10_000

/**
 * The adapter of `createNativeUpdate` from `@inglorious/web/native-update`,
 * reading each platform's minimum build from a table with the columns
 * `platform` (`"android"` or `"ios"`), `min_build` and `store_url`, readable
 * before sign-in.
 *
 * @param {import("@supabase/supabase-js").SupabaseClient} client
 * @param {{ table?: string, timeoutMs?: number }} [options]
 */
export function supabaseNativeUpdate(
  client,
  { table = DEFAULT_TABLE, timeoutMs = DEFAULT_TIMEOUT_MS } = {},
) {
  return {
    async requirement(platform) {
      const { data, error } = await client
        .from(table)
        .select("min_build, store_url")
        .eq("platform", platform)
        .abortSignal(AbortSignal.timeout(timeoutMs))
        .maybeSingle()
      if (error) throw error
      if (!data) return null
      return { minBuild: data.min_build, storeUrl: data.store_url }
    },
  }
}
