import { html } from "@inglorious/web"
import { chart } from "@inglorious/charts"

export function renderPieSection(api) {
  return html`
    <div class="charts-comparison">
      <section class="chart-section">
        <h2>Pie Chart - Config Style</h2>
        ${api.render("categoryPieChart")}
      </section>

      <section class="chart-section">
        <h2>Pie Chart - Recharts Style (Composition with api.getEntity)</h2>
        ${chart.renderPieChart(
          api.getEntity("categoryPieChartComposition"),
          {
            width: 500,
            height: 400,
            children: [
              chart.Pie({
                dataKey: "value",
                nameKey: "name",
                cx: "50%",
                cy: "50%",
                outerRadius: 140,
                label: true,
              }),
            ],
          },
          api,
        )}
      </section>
    </div>
  `
}
