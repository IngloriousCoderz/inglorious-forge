import { html } from "@inglorious/web"
import {
  Bar,
  CartesianGrid,
  Chart,
  Tooltip,
  XAxis,
  YAxis,
} from "@inglorious/charts"

export function renderBarSection(api) {
  return html`
    <div class="charts-comparison">
      <section class="chart-section">
        <h2>Bar Chart - Config Style</h2>
        ${api.render("salesBarChart")}
      </section>

      <section class="chart-section">
        <h2>Bar Chart - Recharts Style (Composition with api.getEntity)</h2>
        ${Chart.render(
          {
            entity: "salesBarChartComposition",
            width: 800,
            height: 400,
            children: [
              CartesianGrid({
                strokeDasharray: "3 3",
              }),
              XAxis({ dataKey: "label" }),
              YAxis(),
              Bar({ dataKey: "value" }),
              Tooltip(),
            ],
          },
          api,
        )}
      </section>
    </div>

    <div class="charts-comparison">
      <section class="chart-section">
        <h2>Bar Chart - Composition (Padding 0)</h2>
        ${Chart.render(
          {
            entity: "salesBarChartCompositionPadding",
            width: 800,
            height: 400,
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
            children: [
              CartesianGrid({
                strokeDasharray: "3 3",
              }),
              XAxis({ dataKey: "label" }),
              YAxis(),
              Bar({ dataKey: "value" }),
              Tooltip(),
            ],
          },
          api,
        )}
      </section>
    </div>
  `
}
