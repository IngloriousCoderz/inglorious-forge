const NETWORK_ERROR_NAMES = new Set([
  "FunctionsFetchError",
  "AuthRetryableFetchError",
])

// Each browser words a failed fetch its own way: Chrome "Failed to fetch",
// Safari "Load failed", Firefox "NetworkError when attempting to fetch
// resource.", React Native "Network request failed".
const FETCH_FAILURE =
  /failed to fetch|load failed|networkerror|network request failed/i

/**
 * Whether a Supabase call failed because the server couldn't be reached, as
 * opposed to the server refusing it. Covers each client's way of reporting it:
 * PostgREST's `{ message: "TypeError: Failed to fetch" }`, Functions'
 * `FunctionsFetchError`, Auth's `AuthRetryableFetchError`, and Storage's
 * wrapped `originalError`.
 * @param {unknown} error
 * @returns {boolean}
 */
export function isNetworkError(error) {
  if (!error || typeof error !== "object") return false
  if (NETWORK_ERROR_NAMES.has(error.name)) return true
  if (error.originalError) return isNetworkError(error.originalError)
  return FETCH_FAILURE.test(String(error.message ?? ""))
}
