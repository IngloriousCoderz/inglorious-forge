import { html } from "@inglorious/web"
import { handleAsync } from "../../../../../packages/store/src/async.js"
import { chart } from "@inglorious/charts"

import { renderInlineLoader } from "../components/loading.js"
import { renderKpiCard } from "../components/kpi-card.js"
import { renderSectionCard } from "../components/section-card.js"
import {
  DEFAULT_ASSET_SYMBOL,
  fetchAssetData,
  getFallbackSymbols,
} from "../services/asset-service.js"
import { formatMoney, toNumber } from "../services/fmp.js"

export const assetPage = {
  // Headline: route lifecycle
  routeChange(entity, payload, api) {
    if (payload.route !== entity.type) {
      assetTransientClear(entity)
      return
    }

    const symbol = payload.params?.symbol || DEFAULT_ASSET_SYMBOL
    if (entity.loaded && entity.symbol === symbol) return

    api.notify(`#${entity.id}:assetFetch`, { symbol })
  },

  // Headline: async lifecycle
  ...handleAsync(
    "assetFetch",
    {
      start(entity, payload) {
        entity.symbol = payload?.symbol || DEFAULT_ASSET_SYMBOL
        entity.loading = true
        entity.error = null
      },

      async run(payload) {
        return fetchAssetData(payload)
      },

      success(entity, payload) {
        entity.symbol = payload.quote?.symbol || entity.symbol
        entity.quote = payload.quote || {}
        entity.profile = payload.profile || {}
        entity.fundamentals = payload.fundamentals || {}
        entity.priceSeries = Array.isArray(payload.priceSeries)
          ? payload.priceSeries
          : []
        entity.dataSource = payload.source
        entity.fallbackSymbols = payload.fallbackSymbols
        entity.warning = payload.warning
        entity.loaded = true
        entity.error = null
        entity.loading = false
      },

      error(entity, error) {
        entity.error = error instanceof Error ? error.message : String(error)
        entity.quote = null
        entity.profile = null
        entity.fundamentals = null
        entity.priceSeries = []
        entity.dataSource = "mock"
        entity.fallbackSymbols = getFallbackSymbols()
        entity.warning = "Falling back to mock data"
        entity.loaded = false
        entity.loading = false
      },
    },
    { strategy: "latest" },
  ),

  // Body: render
  render(entity, api) {
    const symbol = entity.symbol || DEFAULT_ASSET_SYMBOL
    const quote = entity.quote || {}
    const profile = entity.profile || {}
    const fundamentals = entity.fundamentals || {}
    const priceSeries = entity.priceSeries || []
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
        ${renderErrorState(entity.error)}
      </div>
    `
  },
}

// Footer: view helpers
function renderErrorState(errorMessage) {
  if (!errorMessage) return null

  return html`
    <section class="card span-12">
      <p>Error: ${errorMessage}</p>
    </section>
  `
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

function getTrendColor(priceSeries) {
  if (!Array.isArray(priceSeries) || priceSeries.length < 2) return "#10b981"
  const first = Number(priceSeries[0]?.value)
  const last = Number(priceSeries[priceSeries.length - 1]?.value)
  if (!Number.isFinite(first) || !Number.isFinite(last)) return "#10b981"
  return last >= first ? "#10b981" : "#f43f5e"
}

function assetTransientClear(entity) {
  entity.loading = false
  entity.error = null
}
