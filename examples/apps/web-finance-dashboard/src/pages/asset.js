import { html } from "@inglorious/web"
import { handleAsync } from "../../../../../packages/store/src/async.js"
import { chart } from "@inglorious/charts"

import { renderKpiCard } from "../components/kpi-card.js"
import { renderSectionCard } from "../components/section-card.js"
import {
  getInstrumentDataBySymbol,
  getMockAssetUniverse,
} from "../mocks/cascade.js"
import {
  fmpGet,
  formatMoney,
  hasFmpConfig,
  normalizeHistory,
  normalizeQuote,
  toNumber,
} from "../services/fmp.js"

const DEFAULT_SYMBOL = "AAPL"
const MOCK_SET_SIZE = 5

export const assetPage = {
  // Headline: route lifecycle
  routeChange(entity, payload, api) {
    if (payload.route !== entity.type) return
    if (entity.loading) return

    const symbol = payload.params?.symbol || DEFAULT_SYMBOL
    if (entity.loaded && entity.symbol === symbol) return

    api.notify(`#${entity.id}:assetFetch`, { symbol })
  },

  // Headline: async lifecycle
  ...handleAsync("assetFetch", {
    start(entity, payload) {
      entity.symbol = payload?.symbol || DEFAULT_SYMBOL
      entity.loading = true
      entity.error = null
    },

    async run(payload) {
      const symbol = payload?.symbol || DEFAULT_SYMBOL
      const fallbackSymbols = getMockAssetUniverse(MOCK_SET_SIZE).map(
        (item) => item.symbol,
      )

      if (!hasFmpConfig()) {
        return buildMockAssetPayload(symbol, fallbackSymbols, "Missing API key")
      }

      try {
        const [quotePayload, historyPayload] = await Promise.all([
          fmpGet("/quote", { symbol }),
          fmpGet("/historical-price-eod/full", { symbol }),
        ])

        const quote = normalizeQuote(quotePayload)
        const priceSeries = normalizeHistory(historyPayload, 40)

        return {
          quote,
          profile: {
            companyName: quote?.name ?? symbol,
            exchangeShortName: quote?.exchange ?? "N/A",
          },
          fundamentals: {
            pe: quote?.pe,
            eps: quote?.eps,
            marketCap: quote?.marketCap,
            revenue: null,
            netIncome: null,
          },
          priceSeries,
          source: "api",
          fallbackSymbols,
          warning: null,
        }
      } catch (error) {
        const reason =
          error instanceof Error ? error.message : "API unavailable"
        return buildMockAssetPayload(symbol, fallbackSymbols, reason)
      }
    },

    success(entity, payload) {
      entity.symbol = payload.quote?.symbol || entity.symbol
      entity.quote = payload.quote
      entity.profile = payload.profile
      entity.fundamentals = payload.fundamentals
      entity.priceSeries = payload.priceSeries
      entity.dataSource = payload.source
      entity.fallbackSymbols = payload.fallbackSymbols
      entity.warning = payload.warning
      entity.loaded = true
      entity.error = null
    },

    error(entity, error) {
      entity.error = error instanceof Error ? error.message : String(error)
      entity.quote = null
      entity.profile = null
      entity.fundamentals = null
      entity.priceSeries = []
      entity.dataSource = "mock"
      entity.fallbackSymbols = getMockAssetUniverse(MOCK_SET_SIZE).map(
        (item) => item.symbol,
      )
      entity.warning = "Falling back to mock data"
      entity.loaded = false
    },

    finally(entity) {
      entity.loading = false
    },
  }),

  // Body: render
  render(entity, api) {
    const symbol = entity.symbol || DEFAULT_SYMBOL
    const quote = entity.quote || {}
    const profile = entity.profile || {}
    const fundamentals = entity.fundamentals || {}
    const priceSeries = entity.priceSeries || []
    const source = entity.dataSource || "mock"
    const trendColor = getTrendColor(priceSeries)

    return html`
      <div class="page-grid">
        <div class="kpi-grid">
          ${renderKpiCard("Symbol", symbol)}
          ${renderKpiCard("Price", formatMoney(Number(quote.price)))}
          ${renderKpiCard(
            "Day %",
            Number.isFinite(toNumber(quote.changesPercentage))
              ? `${toNumber(quote.changesPercentage).toFixed(2)}%`
              : "N/A",
          )}
          ${renderKpiCard("Market Cap", formatMoney(Number(quote.marketCap)))}
        </div>

        ${renderSectionCard(
          "Price History",
          html`
            <div class="chart-wrap">
              ${entity.loading
                ? renderInlineLoader("Switching asset...")
                : null}
              ${chart.renderLineChart(
                { data: priceSeries },
                {
                  width: 1000,
                  height: 360,
                  dataKeys: ["value"],
                  children: [
                    chart.CartesianGrid({ stroke: "#334155" }),
                    chart.XAxis({ dataKey: "name" }),
                    chart.YAxis({ width: "auto" }),
                    chart.Line({ dataKey: "value", stroke: trendColor }),
                    chart.Dots({ dataKey: "value", fill: trendColor }),
                    chart.Tooltip({}),
                  ],
                },
                api,
              )}
            </div>
          `,
          "span-12",
          renderSourceBadge(source),
        )}
        ${renderSectionCard(
          "Fundamentals",
          html`
            ${renderMockSelector(entity.fallbackSymbols || [])}
            ${entity.warning
              ? html`<p class="info-note">${entity.warning}</p>`
              : null}
            <p>Name: ${profile.companyName ?? "N/A"}</p>
            <p>
              Exchange:
              ${profile.exchangeShortName ?? profile.exchange ?? "N/A"}
            </p>
            <p>
              P/E:
              ${Number.isFinite(Number(fundamentals.pe))
                ? Number(fundamentals.pe).toFixed(2)
                : "N/A"}
            </p>
            <p>
              EPS:
              ${Number.isFinite(Number(fundamentals.eps))
                ? Number(fundamentals.eps).toFixed(2)
                : "N/A"}
            </p>
            <p>Revenue: ${formatMoney(Number(fundamentals.revenue))}</p>
            <p>Net Income: ${formatMoney(Number(fundamentals.netIncome))}</p>
          `,
          "span-12",
        )}
        ${renderLoadingState(entity.loading, symbol)}
        ${renderErrorState(entity.error)}
      </div>
    `
  },
}

// Footer: view helpers
function renderLoadingState(isLoading, symbol) {
  if (!isLoading) return null

  return html`
    <section class="card span-12">
      ${renderInlineLoader(`Loading ${symbol}...`)}
    </section>
  `
}

function renderErrorState(errorMessage) {
  if (!errorMessage) return null

  return html`
    <section class="card span-12">
      <p>Error: ${errorMessage}</p>
    </section>
  `
}

function buildMockAssetPayload(symbol, fallbackSymbols, reason) {
  const requested = getInstrumentDataBySymbol(symbol)
  const selectedSymbol = requested?.instrument
    ? symbol
    : fallbackSymbols[0] || DEFAULT_SYMBOL
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
    fundamentals: {
      pe: null,
      eps: null,
      marketCap: null,
      revenue: null,
      netIncome: null,
    },
    priceSeries: history.slice(-40).map((row, index) => ({
      name: row.t || `${index}`,
      value: Number(row.mid ?? 0),
    })),
    source: "mock",
    fallbackSymbols,
    warning: reason ? `Historical mode: ${reason}` : "Historical mode",
  }
}

function renderSourceBadge(source) {
  const live = source === "api"
  const label = live ? "Live" : "Historical"
  const className = live ? "source-badge source-badge-live" : "source-badge"
  return html`<span class="${className}">${label}</span>`
}

function renderMockSelector(symbols) {
  if (!Array.isArray(symbols) || !symbols.length) return null

  return html`
    <div class="mock-switcher">
      ${symbols.map(
        (symbol) =>
          html`<a class="mock-pill" href="#/asset/${symbol}">${symbol}</a>`,
      )}
    </div>
  `
}

function renderInlineLoader(label) {
  return html`
    <div class="inline-loader">
      <span class="spinner" aria-hidden="true"></span>
      <span>${label}</span>
    </div>
  `
}

function getTrendColor(priceSeries) {
  if (!Array.isArray(priceSeries) || priceSeries.length < 2) return "#10b981"
  const first = Number(priceSeries[0]?.value)
  const last = Number(priceSeries[priceSeries.length - 1]?.value)
  if (!Number.isFinite(first) || !Number.isFinite(last)) return "#10b981"
  return last >= first ? "#10b981" : "#f43f5e"
}
