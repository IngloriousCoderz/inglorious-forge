const DAY_MS = 86_400_000 // 24 hours
const DEFAULT_UNIVERSE_SIZE = 5
const MIN_UNIVERSE_SIZE = 1
const FIRST = 0
const LAST = -1
const LAST_DAY_OFFSET = 1
const TODAY = 0
const DEFAULT_HISTORY_DAYS = 500
// Scales a sine up until its fractional part stops looking like a sine.
const SEED_SCALE = 10_000
const NO_SEED = 0
const OPENING_PRICE_MIN = 65
const OPENING_PRICE_MAX = 95
const MAX_DAILY_MOVE = 2.2
const PRICE_FLOOR = 25
const FALLBACK_MID = 80
const ASK_SPREAD = 0.35
const BID_SPREAD = 0.28
const CENTS = 2
const ISO_DATE_LENGTH = 10 // YYYY-MM-DD

export const markets = [
  { market: "AF", description: "Africa" },
  { market: "AS", description: "Asia" },
  { market: "EU", description: "Europe" },
  { market: "US", description: "United States" },
]

const currenciesByMarket = {
  AF: ["SEK", "TRY"],
  AS: ["JPY", "HKD"],
  EU: ["EUR", "CHF"],
  US: ["USD", "CAD"],
}

const instruments = [
  {
    isin: "SE0000667891",
    code: "EQ-SE0000667891",
    symbol: "AAPL",
    market: "AF",
    currency: "SEK",
    priority: "Low",
  },
  {
    isin: "TR0000001111",
    code: "EQ-TR0000001111",
    symbol: "MSFT",
    market: "AF",
    currency: "TRY",
    priority: "High",
  },
  {
    isin: "JP0000002222",
    code: "EQ-JP0000002222",
    symbol: "NVDA",
    market: "AS",
    currency: "JPY",
    priority: "Normal",
  },
  {
    isin: "HK0000003333",
    code: "EQ-HK0000003333",
    symbol: "AMZN",
    market: "AS",
    currency: "HKD",
    priority: "Low",
  },
  {
    isin: "EU0000004444",
    code: "EQ-EU0000004444",
    symbol: "GOOGL",
    market: "EU",
    currency: "EUR",
    priority: "High",
  },
  {
    isin: "CH0000005555",
    code: "EQ-CH0000005555",
    symbol: "META",
    market: "EU",
    currency: "CHF",
    priority: "Normal",
  },
  {
    isin: "US0000006666",
    code: "EQ-US0000006666",
    symbol: "TSLA",
    market: "US",
    currency: "USD",
    priority: "High",
  },
  {
    isin: "CA0000007777",
    code: "EQ-CA0000007777",
    symbol: "IBM",
    market: "US",
    currency: "CAD",
    priority: "Low",
  },
]

const DEFAULT_MOCK_SYMBOLS = ["AAPL", "MSFT", "NVDA", "GOOGL", "TSLA"]

const instrumentDataMap = buildInstrumentData()

export function getMarkets() {
  return markets
}

export function getCurrenciesForMarket(market) {
  const currencies = currenciesByMarket[market] || []
  return currencies.map((currency) => ({ currency, market }))
}

export function getIsinsForSelection(market, currency) {
  return instruments.filter(
    (item) => item.market === market && item.currency === currency,
  )
}

export function getInstrumentData(isin) {
  return (
    instrumentDataMap[isin] || {
      instrument: null,
      history: [],
      quote: null,
    }
  )
}

export function getInstrumentDataBySymbol(symbol) {
  const instrument = instruments.find((item) => item.symbol === symbol)
  if (!instrument) {
    return {
      instrument: null,
      history: [],
      quote: null,
    }
  }

  return getInstrumentData(instrument.isin)
}

export function getMockAssetUniverse(limit = DEFAULT_UNIVERSE_SIZE) {
  const normalizedLimit = Math.max(
    MIN_UNIVERSE_SIZE,
    Number(limit) || DEFAULT_UNIVERSE_SIZE,
  )
  const preferred = DEFAULT_MOCK_SYMBOLS.map((symbol) =>
    instruments.find((item) => item.symbol === symbol),
  ).filter(Boolean)

  const selected = preferred.slice(FIRST, normalizedLimit)
  return selected.map((instrument) => {
    const data = getInstrumentData(instrument.isin)
    return {
      symbol: instrument.symbol,
      isin: instrument.isin,
      instrument,
      history: Array.isArray(data.history) ? data.history : [],
      quote: data.quote || null,
    }
  })
}

function seededValue(seed, min, max) {
  const x = Math.sin(seed) * SEED_SCALE
  const ratio = x - Math.floor(x)
  return min + ratio * (max - min)
}

function buildHistory(isin, days = DEFAULT_HISTORY_DAYS) {
  const seedBase = isin
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(FIRST), NO_SEED)

  const now = new Date()
  const series = []
  let current = seededValue(seedBase, OPENING_PRICE_MIN, OPENING_PRICE_MAX)

  for (let i = days - LAST_DAY_OFFSET; i >= TODAY; i--) {
    const date = new Date(now.getTime() - i * DAY_MS)
      .toISOString()
      .slice(FIRST, ISO_DATE_LENGTH)
    const delta = seededValue(seedBase + i, -MAX_DAILY_MOVE, MAX_DAILY_MOVE)
    current = Math.max(PRICE_FLOOR, current + delta)
    series.push({ t: date, mid: Number(current.toFixed(CENTS)) })
  }

  return series
}

function buildInstrumentData() {
  return Object.fromEntries(
    instruments.map((item) => {
      const history = buildHistory(item.isin)
      const latest = history.at(LAST)
      const mid = latest?.mid ?? FALLBACK_MID
      return [
        item.isin,
        {
          instrument: item,
          history,
          quote: {
            ask: Number((mid + ASK_SPREAD).toFixed(CENTS)),
            bid: Number((mid - BID_SPREAD).toFixed(CENTS)),
            mid,
          },
        },
      ]
    }),
  )
}
