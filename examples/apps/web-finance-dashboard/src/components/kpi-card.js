import { html } from "@inglorious/web"

export function renderKpiCard(label, value) {
  return html`
    <article class="kpi">
      <p class="kpi-label">${label}</p>
      <p class="kpi-value">${value}</p>
    </article>
  `
}
