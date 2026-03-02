import { html } from "@inglorious/web"
import { handleAsync } from "../../../../../packages/store/src/async.js"
import { chart } from "@inglorious/charts"

import {
  getCurrenciesForMarket,
  getInstrumentData,
  getIsinsForSelection,
  getMarkets,
} from "../mocks/cascade.js"
import { fmpGet, hasFmpConfig } from "../services/fmp.js"

const EMPTY_INSTRUMENT = {
  isin: "-",
  code: "-",
  currency: "-",
  priority: "-",
}

const EMPTY_QUOTE = { ask: 0, bid: 0, mid: 0 }

export const dashboardPage = {
  // Headline: page lifecycle
  routeChange(entity, payload, api) {
    if (payload.route !== entity.type) return
    if (entity.initialized) return

    api.notify(`#${entity.id}:dashboardInit`)
    dashboardBootstrap(entity.id, api)
  },

  dashboardInit(entity) {
    entity.initialized = true
  },

  // Headline: top cascade interactions
  marketSelect(entity, payload, api) {
    dashboardMarketApply(entity, payload?.rowId, api)
  },

  currencySelect(entity, payload, api) {
    dashboardCurrencyApply(entity, payload?.rowId, api)
  },

  isinSelect(entity, payload, api) {
    dashboardIsinApply(entity, payload?.rowId, api)
  },

  // Headline: async lifecycle (dashboard-first, low quota)
  ...handleAsync("dashboardFetchInstrument", {
    start(entity) {
      entity.loading = true
      entity.error = null
    },

    async run(payload) {
      const isin = payload?.isin
      const mockData = getInstrumentData(isin)
      const mockInstrument = mockData.instrument || EMPTY_INSTRUMENT
      const mockHistory = Array.isArray(mockData.history)
        ? mockData.history
        : []
      const mockQuote = mockData.quote || EMPTY_QUOTE

      if (!isin || mockInstrument === EMPTY_INSTRUMENT) {
        return {
          isin,
          instrument: EMPTY_INSTRUMENT,
          history: [],
          quote: EMPTY_QUOTE,
          source: "mock",
        }
      }

      if (!hasFmpConfig() || !mockInstrument.symbol) {
        return {
          isin,
          instrument: mockInstrument,
          history: mockHistory,
          quote: mockQuote,
          source: "mock",
        }
      }

      try {
        const historyPayload = await fmpGet("/historical-price-eod/full", {
          symbol: mockInstrument.symbol,
        })
        const apiHistory = normalizeDashboardHistory(historyPayload, 500)
        const apiQuote = quoteFromHistory(apiHistory)

        return {
          isin,
          instrument: mockInstrument,
          history: apiHistory,
          quote: apiQuote,
          source: "api",
        }
      } catch {
        return {
          isin,
          instrument: mockInstrument,
          history: mockHistory,
          quote: mockQuote,
          source: "mock",
        }
      }
    },

    success(entity, payload, api) {
      entity.instrument = payload.instrument
      entity.bookRows = [
        {
          isin: payload.isin,
          ask: payload.quote.ask,
          bid: payload.quote.bid,
          mid: payload.quote.mid,
        },
      ]
      entity.dataSource = payload.source

      api.notify(
        "#financeQuotationChart:chartDataSet",
        buildBrushSeries(payload.history),
      )
      api.notify(
        "#isinHistoryTable:tableDataSet",
        buildHistoryTableRows(payload.isin, payload.history),
      )
    },

    error(entity, error) {
      entity.error = error instanceof Error ? error.message : String(error)
      entity.instrument = EMPTY_INSTRUMENT
      entity.bookRows = []
      entity.dataSource = "mock"
    },

    finally(entity) {
      entity.loading = false
    },
  }),

  // Body: render
  render(entity, api) {
    const instrument = entity.instrument || EMPTY_INSTRUMENT
    const bookRows = entity.bookRows || []
    const latest = bookRows[0] || EMPTY_QUOTE
    const quotationChart = api.getEntity("financeQuotationChart")

    return html`
      <div class="iw-board">
        <div class="iw-status">
          <span>Market: ${entity.selectedMarket || "-"}</span>
          <span>Currency: ${entity.selectedCurrency || "-"}</span>
          <span>ISIN: ${entity.selectedIsin || "-"}</span>
          <span
            >DS1_Mid_t1:
            ${Number.isFinite(latest.mid) ? latest.mid.toFixed(2) : "-"}</span
          >
          <span>Source: ${entity.dataSource || "mock"}</span>
          ${entity.loading ? html`<span>Loading...</span>` : null}
          ${entity.error ? html`<span>Error: ${entity.error}</span>` : null}
        </div>

        <div class="iw-top-grid">
          ${renderPanel(
            "Market",
            api.render("marketsTable"),
            "iw-panel iw-table-panel",
          )}
          ${renderPanel(
            "Currency",
            api.render("currenciesTable"),
            "iw-panel iw-table-panel",
          )}
          ${renderPanel(
            "ISIN",
            api.render("isinsTable"),
            "iw-panel iw-table-panel",
          )}
        </div>

        <div class="iw-mid-grid">
          ${renderPanel(
            "Quotations",
            html`
              <div class="chart-wrap">
                ${entity.loading
                  ? renderInlineLoader("Loading instrument...")
                  : null}
                ${chart.renderLineChart(
                  quotationChart,
                  {
                    width: 860,
                    height: 340,
                    dataKeys: ["value"],
                    children: [
                      chart.CartesianGrid({ stroke: "#334155" }),
                      chart.XAxis({ dataKey: "t" }),
                      chart.YAxis({ width: "auto" }),
                      chart.Area({
                        dataKey: "value",
                        fill: "#3b82f6",
                        fillOpacity: "0.1",
                        stroke: "none",
                      }),
                      chart.Line({ dataKey: "value", stroke: "#2563eb" }),
                      chart.Tooltip({}),
                      chart.Brush({ dataKey: "t", height: 28 }),
                    ],
                  },
                  api,
                )}
              </div>
            `,
            "iw-panel iw-chart-panel iw-chart-focus",
            renderSourceBadge(entity.dataSource),
          )}
          ${renderPanel(
            "ISIN / T / Mid",
            api.render("isinHistoryTable"),
            "iw-panel iw-side-table iw-table-panel",
          )}
        </div>

        <div class="iw-bottom-grid">
          ${renderPanel(
            "ISIN / DS1_Ask_t1 / DS1_Bid_t1 / DS1_Mid_t1",
            html`
              <table class="mini-table">
                <thead>
                  <tr>
                    <th>ISIN</th>
                    <th>DS1_Ask_t1</th>
                    <th>DS1_Bid_t1</th>
                    <th>DS1_Mid_t1</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${instrument.isin}</td>
                    <td>${Number(latest.ask).toFixed(2)}</td>
                    <td>${Number(latest.bid).toFixed(2)}</td>
                    <td>${Number(latest.mid).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            `,
            "iw-panel",
          )}
          ${renderPanel(
            "Price Comparison",
            html`
              <div class="chart-wrap">
                ${entity.loading
                  ? renderInlineLoader("Refreshing bars...")
                  : null}
                ${chart.renderBarChart(
                  {
                    data: [
                      { label: "Ask Price", value: latest.ask },
                      { label: "Bid Price", value: latest.bid },
                      { label: "Mid Price", value: latest.mid },
                    ],
                  },
                  {
                    width: 640,
                    height: 270,
                    children: [
                      chart.CartesianGrid({ stroke: "#334155" }),
                      chart.XAxis({ dataKey: "label" }),
                      chart.YAxis({ width: "auto" }),
                      chart.Bar({ dataKey: "value" }),
                      chart.Tooltip({}),
                    ],
                  },
                  api,
                )}
              </div>
            `,
            "iw-panel",
            renderSourceBadge(entity.dataSource),
          )}
        </div>

        <section class="instrument-panel">
          <header>INSTRUMENT</header>
          <div class="instrument-grid">
            <p><strong>ISIN:</strong> ${instrument.isin}</p>
            <p><strong>CURRENCY:</strong> ${instrument.currency}</p>
            <p><strong>CODE:</strong> ${instrument.code}</p>
            <p><strong>PRIORITY:</strong> ${instrument.priority}</p>
          </div>
        </section>
      </div>
    `
  },
}

// --- Orchestration (state transitions) --------------------------------------

function dashboardBootstrap(entityId, api) {
  const markets = getMarkets()
  api.notify("#marketsTable:tableDataSet", markets)

  if (!markets.length) return

  const firstMarket = markets[0].market
  api.notify("#marketsTable:tableSelect", firstMarket)
  api.notify(`#${entityId}:marketSelect`, { rowId: firstMarket })
}

function dashboardMarketApply(entity, market, api) {
  entity.selectedMarket = market
  entity.selectedCurrency = null
  entity.selectedIsin = null

  const currencies = getCurrenciesForMarket(market)
  api.notify("#currenciesTable:tableDataSet", currencies)
  api.notify("#isinsTable:tableDataSet", [])
  api.notify("#currenciesTable:tableSelect", null)
  api.notify("#isinsTable:tableSelect", null)

  dashboardInstrumentClear(entity, api)

  if (!currencies.length) return

  const firstCurrency = currencies[0].currency
  api.notify("#currenciesTable:tableSelect", firstCurrency)
  api.notify(`#${entity.id}:currencySelect`, { rowId: firstCurrency })
}

function dashboardCurrencyApply(entity, currency, api) {
  entity.selectedCurrency = currency
  entity.selectedIsin = null

  const isins = getIsinsForSelection(entity.selectedMarket, currency)
  api.notify("#isinsTable:tableDataSet", isins)
  api.notify("#isinsTable:tableSelect", null)

  dashboardInstrumentClear(entity, api)

  if (!isins.length) return

  const firstIsin = isins[0].isin
  api.notify("#isinsTable:tableSelect", firstIsin)
  api.notify(`#${entity.id}:isinSelect`, { rowId: firstIsin })
}

function dashboardIsinApply(entity, isin, api) {
  entity.selectedIsin = isin
  api.notify(`#${entity.id}:dashboardFetchInstrument`, { isin })
}

function dashboardInstrumentClear(entity, api) {
  entity.instrument = null
  entity.bookRows = []
  entity.error = null
  entity.loading = false
  entity.dataSource = "mock"
  api.notify("#financeQuotationChart:chartDataSet", [])
  api.notify("#isinHistoryTable:tableDataSet", [])
}

// --- Formatting helpers -----------------------------------------------------

function formatDateLabel(value) {
  if (typeof value !== "string" || !value.includes("-")) return String(value)
  const [year, month, day] = value.split("-")
  return `${Number(month)}/${Number(day)}/${year}`
}

function buildBrushSeries(history) {
  const rows = Array.isArray(history) ? history : []
  if (!rows.length) return []

  return rows.map((row) => ({
    t: row.t || row.date,
    value: Number(row.mid ?? row.close ?? 0),
  }))
}

function buildHistoryTableRows(isin, history) {
  return history
    .slice()
    .reverse()
    .map((row, index) => ({
      rowId: `${isin}-${index}`,
      isin,
      t: formatDateLabel(row.t || row.date),
      mid: Number(row.mid ?? row.close ?? 0),
    }))
}

function normalizeDashboardHistory(payload, limit = 500) {
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.historical)
      ? payload.historical
      : []

  return rows
    .slice(0, limit)
    .reverse()
    .map((row) => ({
      t: row.date,
      mid: Number(row.close ?? row.price ?? 0),
    }))
    .filter((row) => row.t && Number.isFinite(row.mid))
}

function quoteFromHistory(history) {
  const latest = history[history.length - 1]
  const mid = Number(latest?.mid ?? 0)
  if (!Number.isFinite(mid)) return EMPTY_QUOTE

  return {
    ask: Number((mid + 0.35).toFixed(2)),
    bid: Number((mid - 0.28).toFixed(2)),
    mid: Number(mid.toFixed(2)),
  }
}

function renderSourceBadge(source) {
  const live = source === "api"
  const label = live ? "Live" : "Historical"
  const className = live ? "source-badge source-badge-live" : "source-badge"
  return html`<span class="${className}">${label}</span>`
}

function renderInlineLoader(label) {
  return html`
    <div class="inline-loader">
      <span class="spinner" aria-hidden="true"></span>
      <span>${label}</span>
    </div>
  `
}

// --- View helper ------------------------------------------------------------

function renderPanel(
  title,
  content,
  className = "iw-panel",
  headerExtra = null,
) {
  return html`
    <section class=${className}>
      <header>
        <span>${title}</span>
        ${headerExtra}
      </header>
      <div class="iw-panel-body">${content}</div>
    </section>
  `
}
