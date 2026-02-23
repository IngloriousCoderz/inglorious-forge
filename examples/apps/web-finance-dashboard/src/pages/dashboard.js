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
} from "../services/fmp.js"

const DEFAULT_SYMBOL = "AAPL"
const DEFAULT_PRICE_SERIES = [
  { name: "Mon", value: 183.4 },
  { name: "Tue", value: 184.8 },
  { name: "Wed", value: 186.1 },
  { name: "Thu", value: 185.7 },
  { name: "Fri", value: 187.2 },
]
const DEFAULT_REVENUE_SERIES = [
  { label: "Q1", value: 91.6 },
  { label: "Q2", value: 94.2 },
  { label: "Q3", value: 89.4 },
  { label: "Q4", value: 99.8 },
]
const DEFAULT_SEGMENT_SERIES = [
  { label: "iPhone", value: 52 },
  { label: "Services", value: 24 },
  { label: "Mac", value: 12 },
  { label: "Wearables", value: 12 },
]
const HISTORY_RANGE_DAYS = 60

export const dashboardPage = {
  routeChange(entity, payload, api) {
    if (payload.route !== entity.type) return
    if (entity.loading) return

    const entityId = entity.id
    api.notify(`#${entityId}:dashboardLoadStart`)

    if (!hasFmpConfig()) {
      api.notify(`#${entityId}:dashboardLoadFallback`)
      return
    }

    loadDashboardData(entityId, entity.symbol || DEFAULT_SYMBOL, api)
  },

  dashboardLoadStart(entity) {
    entity.loading = true
    entity.error = null
  },

  dashboardLoadFallback(entity) {
    entity.dataSource = "mock"
    entity.symbol = DEFAULT_SYMBOL
    entity.quote = null
    entity.priceSeries = DEFAULT_PRICE_SERIES
    entity.revenueSeries = DEFAULT_REVENUE_SERIES
    entity.segmentSeries = DEFAULT_SEGMENT_SERIES
    entity.loading = false
    entity.error = null
  },

  dashboardLoadSuccess(entity, payload) {
    entity.dataSource = "fmp"
    entity.symbol = payload.symbol
    entity.quote = payload.quote
    entity.priceSeries = payload.priceSeries
    entity.revenueSeries = payload.revenueSeries
    entity.segmentSeries = DEFAULT_SEGMENT_SERIES
    entity.loading = false
  },

  dashboardLoadFailure(entity, message) {
    entity.error = message
    entity.dataSource = "mock"
    entity.quote = null
    entity.priceSeries = DEFAULT_PRICE_SERIES
    entity.revenueSeries = DEFAULT_REVENUE_SERIES
    entity.segmentSeries = DEFAULT_SEGMENT_SERIES
    entity.loading = false
  },

  render(entity, api) {
    const quote = entity.quote || {}
    const symbol = entity.symbol || DEFAULT_SYMBOL
    const priceSeries = entity.priceSeries || DEFAULT_PRICE_SERIES
    const revenueSeries = entity.revenueSeries || DEFAULT_REVENUE_SERIES
    const segmentSeries = entity.segmentSeries || DEFAULT_SEGMENT_SERIES

    return html`
      <div class="page-grid">
        <div class="kpi-grid">
          ${renderKpiCard("Symbol", symbol)}
          ${renderKpiCard("Price", formatMoney(Number(quote.price)))}
          ${renderKpiCard("Market Cap", formatMoney(Number(quote.marketCap)))}
          ${renderKpiCard(
            "P/E",
            Number.isFinite(Number(quote.pe))
              ? Number(quote.pe).toFixed(2)
              : "N/A",
          )}
        </div>

        ${renderSectionCard(
          "Price Trend",
          chart.renderLineChart(
            { data: priceSeries },
            {
              width: 760,
              height: 360,
              dataKeys: ["value"],
              children: [
                chart.CartesianGrid({ stroke: "#eee", strokeDasharray: "5 5" }),
                chart.XAxis({ dataKey: "name" }),
                chart.YAxis({ width: "auto" }),
                chart.Line({ dataKey: "value", stroke: "#2563eb" }),
                chart.Dots({ dataKey: "value", fill: "#2563eb" }),
                chart.Tooltip({}),
              ],
            },
            api,
          ),
          "span-6",
        )}
        ${renderSectionCard(
          "Quarterly Revenue",
          chart.renderBarChart(
            { data: revenueSeries },
            {
              width: 760,
              height: 360,
              children: [
                chart.CartesianGrid({ stroke: "#eee", strokeDasharray: "3 3" }),
                chart.XAxis({ dataKey: "label" }),
                chart.YAxis({ width: "auto" }),
                chart.Bar({ dataKey: "value" }),
                chart.Tooltip({}),
              ],
            },
            api,
          ),
          "span-6",
        )}
        ${renderSectionCard(
          "Revenue Mix (sample)",
          chart.renderPieChart(
            { data: segmentSeries },
            {
              width: 420,
              height: 320,
              children: [
                chart.Pie({
                  dataKey: "value",
                  nameKey: "label",
                  cx: "50%",
                  cy: "50%",
                  outerRadius: 100,
                  label: true,
                }),
              ],
            },
            api,
          ),
          "span-12",
        )}
        <section class="card span-12">
          <p>Data source: ${entity.dataSource || "mock"}</p>
          <p>FMP configured: ${hasFmpConfig() ? "yes" : "no"}</p>
          ${entity.loading ? html`<p>Loading market data...</p>` : null}
          ${entity.error ? html`<p>FMP error: ${entity.error}</p>` : null}
        </section>
      </div>
    `
  },
}

async function loadDashboardData(entityId, symbol, api) {
  try {
    const toDate = new Date()
    const fromDate = new Date(toDate)
    fromDate.setDate(toDate.getDate() - HISTORY_RANGE_DAYS)
    const from = fromDate.toISOString().slice(0, 10)
    const to = toDate.toISOString().slice(0, 10)

    const [quotePayload, historyPayload, incomePayload] = await Promise.all([
      fmpGet("/quote", { symbol }),
      fmpGet("/historical-price-eod/full", { symbol, from, to }),
      fmpGet("/income-statement", { symbol, limit: 4 }),
    ])

    const quote = normalizeQuote(quotePayload)
    const historyRows = normalizeHistory(historyPayload, 30)
    const incomeRows = normalizeIncomeRows(incomePayload, 4)

    const revenueSeries = incomeRows.length
      ? incomeRows.map((row, index) => ({
          label: row.calendarYear || row.date || `Q${index + 1}`,
          value: Number(row.revenue ?? 0) / 1_000_000_000,
        }))
      : DEFAULT_REVENUE_SERIES

    api.notify(`#${entityId}:dashboardLoadSuccess`, {
      symbol,
      quote,
      priceSeries: historyRows.length ? historyRows : DEFAULT_PRICE_SERIES,
      revenueSeries,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load FMP data"
    api.notify(`#${entityId}:dashboardLoadFailure`, message)
  }
}
