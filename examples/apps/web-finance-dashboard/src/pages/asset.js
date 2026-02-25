import { html } from "@inglorious/web"
import { handleAsync } from "../../../../../packages/store/src/async.js"
import { chart } from "@inglorious/charts"

import { renderKpiCard } from "../components/kpi-card.js"
import { renderSectionCard } from "../components/section-card.js"
import {
  fmpGet,
  formatMoney,
  hasFmpConfig,
  normalizeHistory,
  normalizeQuote,
  toNumber,
} from "../services/fmp.js"

const DEFAULT_SYMBOL = "AAPL"

export const assetPage = {
  // Headline: route lifecycle
  routeChange(entity, payload, api) {
    if (payload.route !== entity.type) return
    if (entity.loading) return

    const symbol = payload.params?.symbol || DEFAULT_SYMBOL
    const entityId = entity.id

    if (!hasFmpConfig()) {
      api.notify(
        `#${entityId}:assetFetchError`,
        "Missing VITE_FMP_API_KEY in .env.local",
      )
      return
    }

    if (entity.loaded && entity.symbol === symbol) return

    api.notify(`#${entityId}:assetFetch`, { symbol })
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
      const [quotePayload, historyPayload] = await Promise.all([
        fmpGet("/quote", { symbol }),
        fmpGet("/historical-price-eod/full", { symbol }),
      ])

      const quote = normalizeQuote(quotePayload)
      const priceSeries = normalizeHistory(historyPayload, 40)

      return {
        quote,
        profile: {
          companyName: quote?.name ?? "N/A",
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
      }
    },

    success(entity, payload) {
      entity.quote = payload.quote
      entity.profile = payload.profile
      entity.fundamentals = payload.fundamentals
      entity.priceSeries = payload.priceSeries
      entity.loaded = true
      entity.error = null
    },

    error(entity, error) {
      entity.error = error instanceof Error ? error.message : String(error)
      entity.quote = null
      entity.profile = null
      entity.fundamentals = null
      entity.priceSeries = []
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
          chart.renderLineChart(
            { data: priceSeries },
            {
              width: 1000,
              height: 360,
              dataKeys: ["value"],
              children: [
                chart.CartesianGrid({ stroke: "#eee", strokeDasharray: "5 5" }),
                chart.XAxis({ dataKey: "name" }),
                chart.YAxis({ width: "auto" }),
                chart.Line({ dataKey: "value", stroke: "#0ea5e9" }),
                chart.Dots({ dataKey: "value", fill: "#0ea5e9" }),
                chart.Tooltip({}),
              ],
            },
            api,
          ),
          "span-12",
        )}
        ${renderSectionCard(
          "Fundamentals",
          html`
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
      <p>Loading ${symbol}...</p>
    </section>
  `
}

function renderErrorState(errorMessage) {
  if (!errorMessage) return null

  return html`
    <section class="card span-12">
      <p>FMP error: ${errorMessage}</p>
    </section>
  `
}
