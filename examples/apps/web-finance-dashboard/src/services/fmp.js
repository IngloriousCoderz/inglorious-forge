const DEFAULT_BASE_URL = "https://financialmodelingprep.com/stable"
const DEFAULT_TIMEOUT_MS = 12_000
const env = import.meta.env || {}

const baseUrl = env.VITE_FMP_BASE_URL || DEFAULT_BASE_URL
const apiKey = env.VITE_FMP_API_KEY

// Headline: public config guards
export function hasFmpConfig() {
  return Boolean(apiKey)
}

// Headline: transport
export async function fmpGet(path, params = {}) {
  if (!apiKey) {
    throw new Error("Missing VITE_FMP_API_KEY in .env.local")
  }

  const url = buildFmpUrl(path, params)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)

  let response
  try {
    response = await fetch(url.toString(), { signal: controller.signal })
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`FMP request timeout after ${DEFAULT_TIMEOUT_MS}ms`)
    }
    throw new Error(
      "FMP network error (check API key, CORS policy, or internet connection)",
    )
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    throw new Error(`FMP request failed (${response.status}) for ${path}`)
  }

  return response.json()
}

// Body: formatters and normalizers
export function formatMoney(value) {
  if (!Number.isFinite(value)) return "N/A"

  if (value >= 1_000_000_000_000) {
    return `$${(value / 1_000_000_000_000).toFixed(2)}T`
  }
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`
  }
  return `$${value.toFixed(2)}`
}

export function normalizeQuote(payload) {
  if (Array.isArray(payload)) return payload[0] || null
  return payload || null
}

export function normalizeHistory(payload, limit = 30) {
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.historical)
      ? payload.historical
      : []

  const sortedDesc = [...rows].sort((a, b) => {
    const aDate = Date.parse(a?.date || "")
    const bDate = Date.parse(b?.date || "")
    return bDate - aDate
  })

  return sortedDesc
    .slice(0, limit)
    .reverse()
    .map((row, index) => ({
      name: row.date || `${index}`,
      value: Number(row.close ?? row.price ?? 0),
    }))
    .filter((row) => Number.isFinite(row.value))
}

export function normalizeIncomeRows(payload, limit = 4) {
  const rows = Array.isArray(payload) ? payload : []
  return rows.slice(0, limit).reverse()
}

export function toNumber(value) {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d.-]/g, "")
    const parsed = Number(cleaned)
    return Number.isFinite(parsed) ? parsed : NaN
  }
  return NaN
}

// Footer: internal helpers
function buildFmpUrl(path, params) {
  const url = new URL(`${baseUrl}${path}`)
  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === "") return
    url.searchParams.set(key, String(value))
  })
  url.searchParams.set("apikey", apiKey)
  return url
}
