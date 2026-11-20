const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"])

/**
 * The backend's address as this page can reach it. On a phone, `127.0.0.1`
 * is the phone itself: when the app comes from a computer's dev server over
 * the network (`pnpm mobile:dev:android`, or `pnpm dev --host`), a local
 * Supabase runs on that same computer, so it is reached by the address the
 * page came from. A hosted backend, or a page served locally, keeps the
 * address as it is.
 *
 * @param {string} url - The configured backend, such as `VITE_SUPABASE_URL`.
 * @param {string} [pageHost] - Where the page came from; defaults to
 *   `location.hostname`.
 * @returns {string}
 *
 * @example
 * createClient(backendUrl(import.meta.env.VITE_SUPABASE_URL), key)
 */
export function backendUrl(
  url,
  pageHost = globalThis.location?.hostname ?? "",
) {
  const backend = new URL(url)
  const isLocalBackend = LOCAL_HOSTS.has(backend.hostname)
  const isFromNetwork = pageHost !== "" && !LOCAL_HOSTS.has(pageHost)
  if (!isLocalBackend || !isFromNetwork) return url
  backend.hostname = pageHost
  return backend.origin
}
