const DAY_MS = 24 * 60 * 60 * 1000

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

function seededValue(seed, min, max) {
  const x = Math.sin(seed) * 10000
  const ratio = x - Math.floor(x)
  return min + ratio * (max - min)
}

function buildHistory(isin, days = 500) {
  const seedBase = isin
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)

  const now = new Date()
  const series = []
  let current = seededValue(seedBase, 65, 95)

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(now.getTime() - i * DAY_MS).toISOString().slice(0, 10)
    const delta = seededValue(seedBase + i, -2.2, 2.2)
    current = Math.max(25, current + delta)
    series.push({ t: date, mid: Number(current.toFixed(2)) })
  }

  return series
}

function buildInstrumentData() {
  return Object.fromEntries(
    instruments.map((item) => {
      const history = buildHistory(item.isin)
      const latest = history[history.length - 1]
      const mid = latest?.mid ?? 80
      return [
        item.isin,
        {
          instrument: item,
          history,
          quote: {
            ask: Number((mid + 0.35).toFixed(2)),
            bid: Number((mid - 0.28).toFixed(2)),
            mid,
          },
        },
      ]
    }),
  )
}

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

export function getMockAssetUniverse(limit = 5) {
  const normalizedLimit = Math.max(1, Number(limit) || 5)
  const preferred = DEFAULT_MOCK_SYMBOLS.map((symbol) =>
    instruments.find((item) => item.symbol === symbol),
  ).filter(Boolean)

  const selected = preferred.slice(0, normalizedLimit)
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
