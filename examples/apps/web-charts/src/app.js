import { html } from "@inglorious/web"
import { chart } from "@inglorious/charts"

export const app = {
  render(api) {
    return html`
      <div class="app">
        <header>
          <h1>Charts Examples</h1>
          <p>Examples of Line, Area, Bar, Pie, and Donut charts</p>
        </header>

        <main>
          <div class="charts-comparison">
            <section class="chart-section">
              <h2>Line Chart - Config Style</h2>
              ${api.render("salesLineChart")}
            </section>

            <section class="chart-section">
              <h2>
                Line Chart - Recharts Style (Composition with api.getEntity)
              </h2>
              ${chart.renderLineChart(
                api.getEntity("salesLineChartComposition"),
                {
                  width: 800,
                  height: 400,
                  dataKeys: ["value"],
                  children: [
                    chart.CartesianGrid({
                      stroke: "#eee",
                      strokeDasharray: "5 5",
                    }),
                    chart.XAxis({ dataKey: "name" }),
                    chart.YAxis({ width: "auto" }),
                    chart.Line({ dataKey: "value", stroke: "#8884d8" }),
                    chart.Dots({ dataKey: "value", fill: "#8884d8" }),
                    chart.Tooltip({}),
                  ],
                },
                api,
              )}
            </section>
          </div>

          <div class="charts-comparison">
            <section class="chart-section">
              <h2>Area Chart - Config Style</h2>
              ${api.render("salesAreaChart")}
            </section>

            <section class="chart-section">
              <h2>
                Area Chart - Recharts Style (Composition with api.getEntity)
              </h2>
              ${chart.renderAreaChart(
                api.getEntity("salesAreaChartComposition"),
                {
                  width: 800,
                  height: 400,
                  dataKeys: ["value"],
                  children: [
                    chart.CartesianGrid({
                      stroke: "#eee",
                      strokeDasharray: "5 5",
                    }),
                    chart.XAxis({ dataKey: "name" }),
                    chart.YAxis({ width: "auto" }),
                    chart.Area({
                      dataKey: "value",
                      fill: "#8884d8",
                      fillOpacity: "0.6",
                      stroke: "#8884d8",
                    }),
                    chart.Dots({ dataKey: "value", fill: "#8884d8" }),
                    chart.Tooltip({}),
                  ],
                },
                api,
              )}
            </section>
          </div>

          <div class="charts-comparison">
            <section class="chart-section">
              <h2>Bar Chart - Config Style</h2>
              ${api.render("salesBarChart")}
            </section>

            <section class="chart-section">
              <h2>
                Bar Chart - Recharts Style (Composition with api.getEntity)
              </h2>
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

          <div class="charts-comparison">
            <section class="chart-section">
              <h2>Pie Chart - Config Style</h2>
              ${api.render("categoryPieChart")}
            </section>

            <section class="chart-section">
              <h2>
                Pie Chart - Recharts Style (Composition with api.getEntity)
              </h2>
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

          <div class="charts-comparison">
            <section class="chart-section">
              <h2>Donut Chart - Config Style</h2>
              ${api.render("categoryDonutChart")}
            </section>

            <section class="chart-section">
              <h2>
                Donut Chart - Recharts Style (Composition with api.getEntity)
              </h2>
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

          <div class="charts-comparison">
            <section class="chart-section">
              <h2>Line Chart with Brush - Config Style</h2>
              ${api.render("lineChartWithBrushConfig")}
            </section>

            <section class="chart-section">
              <h2>
                Line Chart with Brush - Recharts Style (Composition with
                api.getEntity)
              </h2>
              ${chart.renderLineChart(
                api.getEntity("lineChartWithBrush"),
                {
                  width: 800,
                  height: 400,
                  dataKeys: ["value"],
                  children: [
                    chart.CartesianGrid({
                      stroke: "#eee",
                      strokeDasharray: "5 5",
                    }),
                    chart.XAxis({ dataKey: "name" }),
                    chart.YAxis({ width: "auto" }),
                    chart.Line({ dataKey: "value", stroke: "#8884d8" }),
                    chart.Dots({ dataKey: "value", fill: "#8884d8" }),
                    chart.Tooltip({}),
                    chart.Brush({ height: 30 }),
                  ],
                },
                api,
              )}
            </section>
          </div>
        </main>
      </div>
    `
  },
}
