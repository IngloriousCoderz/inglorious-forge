import { html } from "@inglorious/web"
import { chart } from "@inglorious/charts"

export function renderBarSection(api) {
  return html`
    <div class="charts-comparison">
      <section class="chart-section">
        <h2>Bar Chart - Config Style</h2>
        ${api.render("salesBarChart")}
      </section>

      <section class="chart-section">
        <h2>Bar Chart - Recharts Style (Composition with api.getEntity)</h2>
        ${chart.renderBarChart(
          api.getEntity("salesBarChartComposition"),
          {
            width: 800,
            height: 400,
            children: [
              chart.CartesianGrid({
                stroke: "#eee",
                strokeDasharray: "3 3",
              }),
              chart.XAxis({ dataKey: "label" }),
              chart.YAxis({ width: "auto" }),
              chart.Bar({ dataKey: "value" }),
              chart.Tooltip({}),
            ],
          },
          api,
        )}
      </section>
    </div>
  `
}
