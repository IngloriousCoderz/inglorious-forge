import { html } from "@inglorious/web"
import { chart } from "@inglorious/charts"

export function renderDonutSection(api) {
  return html`
    <div class="charts-comparison">
      <section class="chart-section">
        <h2>Donut Chart - Config Style</h2>
        ${api.render("categoryDonutChart")}
      </section>

      <section class="chart-section">
        <h2>Donut Chart - Recharts Style (Composition with api.getEntity)</h2>
        ${chart.renderPieChart(
          api.getEntity("categoryDonutChartComposition"),
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
                innerRadius: 84,
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
