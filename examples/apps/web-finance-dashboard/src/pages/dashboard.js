import {
  Area,
  Bar,
  Brush,
  CartesianGrid,
  Chart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from "@inglorious/charts"
import { handleAsync } from "@inglorious/store/async"
import { html } from "@inglorious/web"
import { when } from "@inglorious/web/directives/when"

import { renderInlineLoader } from "../components/loading.js"
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
const CENTS = 2
const LAST = -1
const FIRST = 0
const NO_PRICE = 0
const HISTORY_LENGTH = 500
// The mock market's bid/ask spread around the mid price.
const ASK_SPREAD = 0.35
const BID_SPREAD = 0.28

export const DashboardPage = {
  // Headline: page lifecycle
  routeChange(entity, payload, api) {
    if (payload.route !== entity.id) {
      dashboardInstrumentClear(entity, api)
      return
    }
    if (!entity.initialized) {
      api.notify(`#${entity.id}:dashboardInit`)
      dashboardBootstrap(entity.id, api)
      return
    }

    dashboardResume(entity, api)
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
        return createInstrumentPayload({
          isin,
          instrument: EMPTY_INSTRUMENT,
          history: [],
          quote: EMPTY_QUOTE,
          source: "mock",
        })
      }

      if (!hasFmpConfig() || !mockInstrument.symbol) {
        return createInstrumentPayload({
          isin,
          instrument: mockInstrument,
          history: mockHistory,
          quote: mockQuote,
          source: "mock",
        })
      }

      try {
        const historyPayload = await fmpGet("/historical-price-eod/full", {
          symbol: mockInstrument.symbol,
        })
        if (!isValidDashboardHistoryPayload(historyPayload)) {
          throw new Error("Invalid API response structure")
        }
        const apiHistory = normalizeDashboardHistory(
          historyPayload,
          HISTORY_LENGTH,
        )
        const apiQuote = quoteFromHistory(apiHistory)

        return createInstrumentPayload({
          isin,
          instrument: mockInstrument,
          history: apiHistory,
          quote: apiQuote,
          source: "api",
        })
      } catch {
        return createInstrumentPayload({
          isin,
          instrument: mockInstrument,
          history: mockHistory,
          quote: mockQuote,
          source: "mock",
        })
      }
    },

    success(entity, payload, api) {
      entity.instrument = payload.instrument
      entity.quote = payload.quote
      entity.dataSource = payload.source

      api.notify(
        "#financeQuotationChart:dataUpdate",
        buildBrushSeries(payload.history),
      )
      api.notify(
        "#isinHistoryTable:tableDataSet",
        buildHistoryTableRows(payload.isin, payload.history),
      )
      entity.loading = false
    },

    error(entity, error) {
      entity.error = error instanceof Error ? error.message : String(error)
      entity.instrument = EMPTY_INSTRUMENT
      entity.quote = EMPTY_QUOTE
      entity.dataSource = "mock"
      entity.loading = false
    },

    finally(entity) {
      entity.loading = false
    },
  }),

  // Body: render
  render(entity, api) {
    const instrument = entity.instrument || EMPTY_INSTRUMENT
    const latest = entity.quote || EMPTY_QUOTE

    return html`
      <div class="iw-board">
        <div class="iw-status">
          <span>Market: ${entity.selectedMarket || "-"}</span>
          <span>Currency: ${entity.selectedCurrency || "-"}</span>
          <span>ISIN: ${entity.selectedIsin || "-"}</span>
          <span
            >DS1_Mid_t1:
            ${Number.isFinite(latest.mid) ? latest.mid.toFixed(CENTS) : "-"}</span
          >
          <span>Source: ${entity.dataSource || "mock"}</span>
          ${when(entity.loading, () => html`<span>Loading...</span>`)}
          ${when(entity.error, () => html`<span>Error: ${entity.error}</span>`)}
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
                ${when(entity.loading, () =>
                  renderInlineLoader("Loading instrument..."),
                )}
                ${Chart.render(
                  {
                    entity: "financeQuotationChart",
                    width: 860,
                    height: 340,
                    dataKeys: ["value"],
                    children: [
                      CartesianGrid({ stroke: "#334155" }),
                      XAxis({ dataKey: "name" }),
                      YAxis(),
                      Area({
                        dataKey: "value",
                        fill: "#3b82f6",
                        fillOpacity: "0.1",
                        stroke: "none",
                      }),
                      Line({ dataKey: "value", stroke: "#2563eb" }),
                      Tooltip(),
                      Brush({ dataKey: "name", height: 28 }),
                    ],
                  },
                  api,
                )}
              </div>
            `,
            "iw-panel iw-chart-panel iw-chart-focus",
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
                    <td>${Number(latest.ask).toFixed(CENTS)}</td>
                    <td>${Number(latest.bid).toFixed(CENTS)}</td>
                    <td>${Number(latest.mid).toFixed(CENTS)}</td>
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
                ${when(entity.loading, () =>
                  renderInlineLoader("Refreshing bars..."),
                )}
                ${Chart.render(
                  {
                    data: [
                      { label: "Ask Price", value: latest.ask },
                      { label: "Bid Price", value: latest.bid },
                      { label: "Mid Price", value: latest.mid },
                    ],
                    width: 640,
                    height: 270,
                    children: [
                      CartesianGrid({ stroke: "#334155" }),
                      XAxis({ dataKey: "label" }),
                      YAxis(),
                      Bar({ dataKey: "value" }),
                      Tooltip(),
                    ],
                  },
                  api,
                )}
              </div>
            `,
            "iw-panel",
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

  const [{ market: firstMarket }] = markets
  api.notify("#marketsTable:tableSelect", firstMarket)
  api.notify(`#${entityId}:marketSelect`, { rowId: firstMarket })
}

function dashboardResume(entity, api) {
  if (!entity.selectedIsin) return
  api.notify(`#${entity.id}:dashboardFetchInstrument`, {
    isin: entity.selectedIsin,
  })
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

  const [{ currency: firstCurrency }] = currencies
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

  const [{ isin: firstIsin }] = isins
  api.notify("#isinsTable:tableSelect", firstIsin)
  api.notify(`#${entity.id}:isinSelect`, { rowId: firstIsin })
}

function dashboardIsinApply(entity, isin, api) {
  entity.selectedIsin = isin
  api.notify(`#${entity.id}:dashboardFetchInstrument`, { isin })
}

function dashboardInstrumentClear(entity, api) {
  entity.instrument = null
  entity.quote = EMPTY_QUOTE
  entity.error = null
  entity.loading = false
  entity.dataSource = "mock"
  api.notify("#financeQuotationChart:dataUpdate", [])
  api.notify("#isinHistoryTable:tableDataSet", [])
}

// --- Formatting helpers -----------------------------------------------------

function createInstrumentPayload(payload) {
  return {
    isin: payload.isin,
    instrument: payload.instrument,
    history: payload.history,
    quote: payload.quote,
    source: payload.source,
  }
}

function formatDateLabel(value) {
  if (typeof value !== "string" || !value.includes("-")) return String(value)
  const [year, month, day] = value.split("-")
  return `${Number(month)}/${Number(day)}/${year}`
}

function buildBrushSeries(history) {
  const rows = Array.isArray(history) ? history : []
  if (!rows.length) return []

  return rows.map((row) => ({
    name: row.name || row.t || row.date,
    value: Number(row.mid ?? row.close ?? NO_PRICE),
  }))
}

function buildHistoryTableRows(isin, history) {
  return history
    .slice()
    .reverse()
    .map((row, index) => ({
      rowId: `${isin}-${index}`,
      isin,
      t: formatDateLabel(row.name || row.t || row.date),
      mid: Number(row.mid ?? row.close ?? NO_PRICE),
    }))
}

function normalizeDashboardHistory(payload, limit = HISTORY_LENGTH) {
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.historical)
      ? payload.historical
      : []

  return rows
    .slice(FIRST, limit)
    .reverse()
    .map((row) => ({
      name: row.date,
      mid: Number(row.close ?? row.price ?? NO_PRICE),
    }))
    .filter((row) => row.name && Number.isFinite(row.mid))
}

function quoteFromHistory(history) {
  const latest = history.at(LAST)
  const mid = Number(latest?.mid ?? NO_PRICE)
  if (!Number.isFinite(mid)) return EMPTY_QUOTE

  return {
    ask: Number((mid + ASK_SPREAD).toFixed(CENTS)),
    bid: Number((mid - BID_SPREAD).toFixed(CENTS)),
    mid: Number(mid.toFixed(CENTS)),
  }
}

function isValidDashboardHistoryPayload(payload) {
  if (Array.isArray(payload)) return Boolean(payload.length)
  return (
    Array.isArray(payload?.historical) && Boolean(payload.historical.length)
  )
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
