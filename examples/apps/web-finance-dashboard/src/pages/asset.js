import { html } from "@inglorious/web"
import { chart } from "@inglorious/charts"

import { renderKpiCard } from "../components/kpi-card.js"
import { renderSectionCard } from "../components/section-card.js"
import {
  fmpGet,
  formatMoney,
  hasFmpConfig,
  normalizeHistory,
  normalizeIncomeRows,
  normalizeQuote,
  toNumber,
} from "../services/fmp.js"

const DEFAULT_SYMBOL = "AAPL"

export const assetPage = {
  routeChange(entity, payload, api) {
    if (payload.route !== entity.type) return

    const symbol = payload.params?.symbol || DEFAULT_SYMBOL
    const entityId = entity.id

    api.notify(`#${entityId}:assetLoadStart`, symbol)

    if (!hasFmpConfig()) {
      api.notify(
        `#${entityId}:assetLoadFailure`,
        "Missing VITE_FMP_API_KEY in .env.local",
      )
      return
    }

    loadAssetData(entityId, symbol, api)
  },

  assetLoadStart(entity, symbol) {
    entity.symbol = symbol
    entity.loading = true
    entity.error = null
  },

  assetLoadSuccess(entity, payload) {
    entity.quote = payload.quote
    entity.profile = payload.profile
    entity.fundamentals = payload.fundamentals
    entity.priceSeries = payload.priceSeries
    entity.loading = false
    entity.error = null
  },

  assetLoadFailure(entity, message) {
    entity.error = message
    entity.quote = null
    entity.profile = null
    entity.fundamentals = null
    entity.priceSeries = []
    entity.loading = false
  },

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
        ${entity.loading
          ? html`<section class="card span-12">
              <p>Loading ${symbol}...</p>
            </section>`
          : null}
        ${entity.error
          ? html`<section class="card span-12">
              <p>FMP error: ${entity.error}</p>
            </section>`
          : null}
      </div>
    `
  },
}

async function loadAssetData(entityId, symbol, api) {
  try {
    const [quotePayload, profilePayload, incomePayload, historyPayload] =
      await Promise.all([
        fmpGet("/quote", { symbol }),
        fmpGet("/profile", { symbol }),
        fmpGet("/income-statement", { symbol, limit: 1 }),
        fmpGet("/historical-price-eod/full", { symbol }),
      ])

    const quote = normalizeQuote(quotePayload)
    const profile = Array.isArray(profilePayload)
      ? profilePayload[0] || null
      : profilePayload || null
    const incomeRows = normalizeIncomeRows(incomePayload, 1)
    const lastIncome = incomeRows[0] || null
    const historySeries = normalizeHistory(historyPayload, 40)

    api.notify(`#${entityId}:assetLoadSuccess`, {
      quote,
      profile,
      fundamentals: {
        pe: quote?.pe ?? profile?.pe,
        eps: quote?.eps ?? profile?.eps,
        marketCap: quote?.marketCap,
        revenue: lastIncome?.revenue,
        netIncome: lastIncome?.netIncome,
      },
      priceSeries: historySeries,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load asset"
    api.notify(`#${entityId}:assetLoadFailure`, message)
  }
}
