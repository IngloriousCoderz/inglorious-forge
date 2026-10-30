// Each source names its channels apart, so two sources on one client never
// share a topic.
let sourceCount = 0

/**
 * A live source over Supabase Realtime, for `withLiveReload` from
 * `@inglorious/web`. It tells its subscribers that a table changed, not how:
 * the entity reloads what it shows.
 *
 * It takes care of what makes Realtime brittle:
 *
 * - One channel per table, shared by everyone who subscribes to it, and
 *   closed with the last of them.
 * - A channel joins only once the client's saved session is restored. One
 *   that joins while it is, as one subscribed at boot does, joins as anon and
 *   stays so: it gets deletes, which skip RLS, and no inserts or updates.
 * - A channel that joins again after a dropped connection tells its
 *   subscribers, since whatever changed meanwhile was missed.
 *
 * Signing in and out later needs nothing: the client hands every channel the
 * new token itself.
 *
 * @param {import("@supabase/supabase-js").SupabaseClient} client
 * @param {Object} [options]
 * @param {string} [options.schema] - Defaults to `"public"`.
 * @returns {{ subscribe(table: string, onChange: () => void): () => void }}
 */
export function realtimeSource(client, { schema = "public" } = {}) {
  const prefix = `inglorious-${sourceCount++}-${schema}`
  const tables = new Map()

  function open(table) {
    const entry = { listeners: new Set(), isClosed: false, hasJoined: false }
    const notify = () => entry.listeners.forEach((onChange) => onChange())

    entry.channel = client
      .channel(`${prefix}-${table}`)
      .on("postgres_changes", { event: "*", schema, table }, notify)

    void client.auth.getSession().then(() => {
      if (entry.isClosed) return
      entry.channel.subscribe((status) => {
        if (status !== "SUBSCRIBED") return
        if (entry.hasJoined) notify()
        entry.hasJoined = true
      })
    })

    return entry
  }

  return {
    subscribe(table, onChange) {
      let entry = tables.get(table)
      if (!entry) {
        entry = open(table)
        tables.set(table, entry)
      }
      entry.listeners.add(onChange)

      return () => {
        entry.listeners.delete(onChange)
        if (entry.listeners.size || entry.isClosed) return
        entry.isClosed = true
        tables.delete(table)
        void client.removeChannel(entry.channel)
      }
    },
  }
}
