import { Card } from "@inglorious/ui/card"
import { html } from "@inglorious/web"

import { formatMoney } from "./utils"

export function render({ rowCount, grandTotal }) {
  return Card.render({
    element: "header",
    className: "hero-card",
    header: html`
      <p class="eyebrow">Performance demo</p>
      <h1>Invoice form with 100 editable order rows</h1>
      <p class="lede">
        Every edit keeps the whole invoice live so the demo stresses field
        updates, row rendering, and total calculations at the same time.
      </p>
    `,
    body: html`
      <div class="hero-stats">
        <div>
          <div class="hero-stat-label">Live rows</div>
          <div class="hero-stat-value">${rowCount}</div>
        </div>
        <div>
          <div class="hero-stat-label">Gross total</div>
          <div class="hero-stat-value">${formatMoney(grandTotal)}</div>
        </div>
      </div>
    `,
    bodyPadding: "lg",
  })
}
