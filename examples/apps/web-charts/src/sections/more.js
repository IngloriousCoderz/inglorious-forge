import {
  Bar,
  CartesianGrid,
  Chart,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadialBar,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "@inglorious/charts"
import { html } from "@inglorious/web"

export function renderMoreSections(api) {
  return html`
    <div class="charts-comparison">
      <section class="chart-section">
        <h2>Horizontal Bar Chart - Config Style (orientation)</h2>
        ${api.render("horizontalBarChart")}
      </section>

      <section class="chart-section">
        <h2>Horizontal Stacked Bar Chart - Composition</h2>
        ${Chart.render(
          {
            entity: "horizontalBarChartComposition",
            orientation: "horizontal",
            width: 800,
            height: 300,
            children: [
              CartesianGrid(),
              XAxis({ label: "Votes" }),
              YAxis({ dataKey: "label" }),
              Bar({ dataKey: "online", stackId: "votes" }),
              Bar({ dataKey: "shop", stackId: "votes" }),
              Legend(),
              Tooltip(),
            ],
          },
          api,
        )}
      </section>
    </div>

    <div class="charts-comparison">
      <section class="chart-section">
        <h2>Scatter Chart - Config Style</h2>
        ${api.render("scatterChart")}
      </section>

      <section class="chart-section">
        <h2>Scatter Chart sized by z - Composition</h2>
        ${Chart.render(
          {
            entity: "scatterChartComposition",
            width: 800,
            height: 400,
            children: [
              CartesianGrid(),
              XAxis({ label: "Distance (km)" }),
              YAxis({ label: "Price (€)" }),
              Scatter({ dataKey: "Cities" }),
              Tooltip(),
            ],
          },
          api,
        )}
      </section>
    </div>

    <div class="charts-comparison">
      <section class="chart-section">
        <h2>Radar Chart - Config Style</h2>
        ${api.render("radarChart")}
      </section>

      <section class="chart-section">
        <h2>Radar Chart - Composition</h2>
        ${Chart.render(
          {
            entity: "radarChartComposition",
            width: 800,
            height: 400,
            children: [
              PolarGrid(),
              PolarAngleAxis(),
              Radar({ dataKey: "modelA" }),
              Tooltip(),
            ],
          },
          api,
        )}
      </section>
    </div>

    <div class="charts-comparison">
      <section class="chart-section">
        <h2>Radial Chart - Config Style</h2>
        ${api.render("radialChart")}
      </section>

      <section class="chart-section">
        <h2>Radial Chart, a half dial - Composition</h2>
        ${Chart.render(
          {
            entity: "radialChartComposition",
            width: 500,
            height: 400,
            children: [
              RadialBar({
                innerRadius: "30%",
                startAngle: -90,
                endAngle: 90,
                hasLabel: true,
              }),
              Tooltip(),
            ],
          },
          api,
        )}
      </section>
    </div>
  `
}
