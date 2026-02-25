import { html } from "@inglorious/web"

import { renderSectionCard } from "../components/section-card.js"

export const screenerPage = {
  // Headline: route lifecycle
  routeChange(entity, payload) {
    if (payload.route !== entity.type) return
    if (entity.initialized) return
    entity.initialized = true
  },

  // Body: render
  render(entity, api) {
    return html`
      <div class="page-grid">
        ${renderSectionCard(
          "Stock Screener",
          api.render("screenerTable"),
          "span-12",
        )}
      </div>
    `
  },
}
