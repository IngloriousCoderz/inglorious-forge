const DEFAULT_BASE_URL = "https://financialmodelingprep.com/stable"
const DEFAULT_TIMEOUT_MS = 12_000
const TRILLION = 1_000_000_000_000
const BILLION = 1_000_000_000
const MILLION = 1_000_000
const CENTS = 2
const DEFAULT_HISTORY_LENGTH = 30
const DEFAULT_INCOME_PERIODS = 4
const FIRST = 0
const NO_PRICE = 0
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
      throw new Error(`FMP request timeout after ${DEFAULT_TIMEOUT_MS}ms`, {
        cause: error,
      })
    }
    throw new Error(
      "FMP network error (check API key, CORS policy, or internet connection)",
      { cause: error },
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

  if (value >= TRILLION) {
    return `$${(value / TRILLION).toFixed(CENTS)}T`
  }
  if (value >= BILLION) {
    return `$${(value / BILLION).toFixed(CENTS)}B`
  }
  if (value >= MILLION) {
    return `$${(value / MILLION).toFixed(CENTS)}M`
  }
  return `$${value.toFixed(CENTS)}`
}

export function normalizeQuote(payload) {
  if (Array.isArray(payload)) {
    const [first] = payload
    return first || null
  }
  return payload || null
}

export function normalizeHistory(payload, limit = DEFAULT_HISTORY_LENGTH) {
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
    .slice(FIRST, limit)
    .reverse()
    .map((row, index) => ({
      name: row.date || `${index}`,
      value: Number(row.close ?? row.price ?? NO_PRICE),
    }))
    .filter((row) => Number.isFinite(row.value))
}

export function normalizeIncomeRows(payload, limit = DEFAULT_INCOME_PERIODS) {
  const rows = Array.isArray(payload) ? payload : []
  return rows.slice(FIRST, limit).reverse()
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
