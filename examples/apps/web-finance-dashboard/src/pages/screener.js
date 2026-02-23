import { html } from "@inglorious/web"

import { renderSectionCard } from "../components/section-card.js"
import { fmpGet, hasFmpConfig } from "../services/fmp.js"

const DEFAULT_SYMBOLS = [
  "AAPL",
  "MSFT",
  "NVDA",
  "AMZN",
  "GOOGL",
  "META",
  "TSLA",
]

export const screenerPage = {
  routeChange(entity, payload, api) {
    if (payload.route !== entity.type) return
    if (entity.loading) return

    const entityId = entity.id
    api.notify(`#${entityId}:screenerLoadStart`)

    if (!hasFmpConfig()) {
      api.notify(
        `#${entityId}:screenerLoadFailure`,
        "Missing VITE_FMP_API_KEY in .env.local",
      )
      return
    }

    loadScreenerData(entityId, api)
  },

  screenerLoadStart(entity) {
    entity.loading = true
    entity.error = null
  },

  screenerLoadSuccess(entity) {
    entity.loading = false
    entity.error = null
  },

  screenerLoadFailure(entity, message) {
    entity.loading = false
    entity.error = message
  },

  render(entity, api) {
    return html`
      <div class="page-grid">
        ${renderSectionCard(
          "Stock Screener",
          api.render("screenerTable"),
          "span-12",
        )}
        ${entity.loading
          ? html`<section class="card span-12">
              <p>Loading screener...</p>
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

async function loadScreenerData(entityId, api) {
  try {
    const payloadRows = await fmpGet("/quote", {
      symbol: DEFAULT_SYMBOLS.join(","),
    })

    const rows = (Array.isArray(payloadRows) ? payloadRows : [])
      .map((row) => ({
        symbol: row.symbol,
        name: row.name,
        price: Number(row.price ?? 0),
        changePct: Number(row.changesPercentage ?? 0),
        volume: Number(row.volume ?? 0),
        marketCap: Number(row.marketCap ?? 0),
      }))
      .filter((row) => row.symbol)

    api.notify("#screenerTable:screenerDataSet", rows)
    api.notify(`#${entityId}:screenerLoadSuccess`)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load screener"
    api.notify(`#${entityId}:screenerLoadFailure`, message)
  }
}
