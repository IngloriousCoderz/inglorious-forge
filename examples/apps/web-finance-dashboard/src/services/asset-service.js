import {
  getInstrumentDataBySymbol,
  getMockAssetUniverse,
} from "../mocks/cascade.js"
import {
  fmpGet,
  hasFmpConfig,
  normalizeHistory,
  normalizeQuote,
} from "./fmp.js"

export const DEFAULT_ASSET_SYMBOL = "AAPL"
const MOCK_SET_SIZE = 5
const SERIES_LIMIT = 40
const EMPTY_FUNDAMENTALS = {
  pe: null,
  eps: null,
  marketCap: null,
  revenue: null,
  netIncome: null,
}

// Headline: public service API
export async function fetchAssetData({ symbol = DEFAULT_ASSET_SYMBOL } = {}) {
  const fallbackSymbols = getFallbackSymbols()

  if (!hasFmpConfig()) {
    return buildMockAssetPayload(symbol, fallbackSymbols, "Missing API key")
  }

  try {
    const [quotePayload, historyPayload] = await Promise.all([
      fmpGet("/quote", { symbol }),
      fmpGet("/historical-price-eod/full", { symbol }),
    ])

    if (
      !isValidQuotePayload(quotePayload) ||
      !isValidHistoryPayload(historyPayload)
    ) {
      throw new Error("Invalid API response structure")
    }

    return buildApiAssetPayload({
      symbol,
      quote: normalizeQuote(quotePayload),
      historyPayload,
      fallbackSymbols,
    })
  } catch (error) {
    const reason = error instanceof Error ? error.message : "API unavailable"
    return buildMockAssetPayload(symbol, fallbackSymbols, reason)
  }
}

export function getFallbackSymbols() {
  return getMockAssetUniverse(MOCK_SET_SIZE).map((item) => item.symbol)
}

// Body: payload builders
function buildApiAssetPayload({
  symbol,
  quote,
  historyPayload,
  fallbackSymbols,
}) {
  return {
    quote,
    profile: {
      companyName: quote?.name ?? symbol,
      exchangeShortName: quote?.exchange ?? "N/A",
    },
    fundamentals: buildFundamentalsFromQuote(quote),
    priceSeries: normalizeHistory(historyPayload, SERIES_LIMIT),
    source: "api",
    fallbackSymbols,
    warning: null,
  }
}

function buildMockAssetPayload(symbol, fallbackSymbols, reason) {
  const requested = getInstrumentDataBySymbol(symbol)
  const selectedSymbol = requested?.instrument
    ? symbol
    : fallbackSymbols[0] || DEFAULT_ASSET_SYMBOL
  const mockData = getInstrumentDataBySymbol(selectedSymbol)

  const history = Array.isArray(mockData.history) ? mockData.history : []
  const latest = mockData.quote || null

  return {
    quote: {
      symbol: selectedSymbol,
      name: selectedSymbol,
      price: latest?.mid ?? null,
      changesPercentage: null,
      marketCap: null,
      exchange: "MOCK",
      pe: null,
      eps: null,
    },
    profile: {
      companyName: selectedSymbol,
      exchangeShortName: "MOCK",
    },
    fundamentals: { ...EMPTY_FUNDAMENTALS },
    priceSeries: history.slice(-SERIES_LIMIT).map((row, index) => ({
      name: row.t || `${index}`,
      value: Number(row.mid ?? 0),
    })),
    source: "mock",
    fallbackSymbols,
    warning: buildHistoricalWarning(reason),
  }
}

// Footer: internal guards
function buildFundamentalsFromQuote(quote) {
  return {
    ...EMPTY_FUNDAMENTALS,
    pe: quote?.pe ?? null,
    eps: quote?.eps ?? null,
    marketCap: quote?.marketCap ?? null,
  }
}

function buildHistoricalWarning(reason) {
  return reason ? `Historical mode: ${reason}` : "Historical mode"
}

function isValidQuotePayload(payload) {
  if (!Array.isArray(payload) || !payload.length) return false
  return typeof payload[0] === "object" && payload[0] !== null
}

function isValidHistoryPayload(payload) {
  if (Array.isArray(payload)) return payload.length > 0
  return Array.isArray(payload?.historical) && payload.historical.length > 0
}
