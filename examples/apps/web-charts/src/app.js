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
          <section class="chart-section">
            <h2>Line Chart - Recharts Style (Composition)</h2>
            ${chart(api, "productChart", (c) =>
              c.renderLineChart(
                [
                  c.renderCartesianGrid({
                    stroke: "#eee",
                    strokeDasharray: "5 5",
                  }),
                  c.renderXAxis({ dataKey: "name" }),
                  c.renderYAxis({ width: "auto" }),
                  c.renderLine({ dataKey: "uv", stroke: "#8884d8" }),
                  c.renderLine({ dataKey: "pv", stroke: "#82ca9d" }),
                  c.renderTooltip({}),
                ],
                { width: 800, height: 400, dataKeys: ["uv", "pv"] },
              ),
            )}
          </section>

          <section class="chart-section">
            <h2>Line Chart - Multiple Series</h2>
            ${api.render("multiSeriesLineChart")}
          </section>

          <section class="chart-section">
            <h2>Area Chart - Recharts Style (Composition)</h2>
            ${chart(api, "productChart", (c) =>
              c.renderAreaChart(
                [
                  c.renderCartesianGrid({
                    stroke: "#eee",
                    strokeDasharray: "5 5",
                  }),
                  c.renderXAxis({ dataKey: "name" }),
                  c.renderYAxis({ width: "auto" }),
                  c.renderArea({
                    dataKey: "uv",
                    fill: "#8884d8",
                    fillOpacity: "0.6",
                    stroke: "#8884d8",
                  }),
                  c.renderArea({
                    dataKey: "pv",
                    fill: "#82ca9d",
                    fillOpacity: "0.6",
                    stroke: "#82ca9d",
                  }),
                  c.renderTooltip({}),
                ],
                { width: 800, height: 400, dataKeys: ["uv", "pv"] },
              ),
            )}
          </section>

          <section class="chart-section">
            <h2>Area Chart - Simple</h2>
            ${api.render("salesAreaChart")}
          </section>

          <section class="chart-section">
            <h2>Area Chart - Multiple Series</h2>
            ${api.render("multiSeriesAreaChart")}
          </section>

          <section class="chart-section">
            <h2>Area Chart - Multiple Series Stacked</h2>
            ${api.render("multiSeriesAreaChartStacked")}
          </section>

          <section class="chart-section">
            <h2>Bar Chart - Recharts Style (Composition)</h2>
            ${chart(api, "productChart", (c) =>
              c.renderBarChart(
                [
                  c.renderCartesianGrid({
                    stroke: "#eee",
                    strokeDasharray: "3 3",
                  }),
                  c.renderXAxis({ dataKey: "name" }),
                  c.renderYAxis({ width: "auto" }),
                  c.renderBar({ dataKey: "pv", fill: "#8884d8" }),
                  c.renderBar({ dataKey: "uv", fill: "#82ca9d" }),
                  c.renderTooltip({}),
                ],
                { width: 800, height: 400, dataKeys: ["pv", "uv"] },
              ),
            )}
          </section>

          <section class="chart-section">
            <h2>Bar Chart</h2>
            ${api.render("salesBarChart")}
          </section>

          <section class="chart-section">
            <h2>Pie Chart</h2>
            ${api.render("categoryPieChart")}
          </section>

          <section class="chart-section">
            <h2>Donut Chart</h2>
            ${api.render("categoryDonutChart")}
          </section>

          <section class="chart-section">
            <h2>Pie Chart - Custom Position (cx, cy)</h2>
            ${api.render("pieCustomPosition")}
            <p>Pie chart positioned at 35% from top-left</p>
          </section>

          <section class="chart-section">
            <h2>Pie Chart - Partial (startAngle, endAngle)</h2>
            <p>Half circle pie chart (180° to 0°)</p>
            ${api.render("piePartial")}
          </section>

          <section class="chart-section">
            <h2>Pie Chart - With Padding (paddingAngle)</h2>
            <p>5 degrees gap between each sector</p>
            ${api.render("pieWithPadding")}
          </section>

          <section class="chart-section">
            <h2>Pie Chart - Minimum Angle (minAngle)</h2>
            <p>Each sector has at least 10 degrees</p>
            ${api.render("pieMinAngle")}
          </section>

          <section class="chart-section">
            <h2>Pie Chart - Rounded Corners (cornerRadius)</h2>
            <p>Rounded edges with 10px corner radius</p>
            ${api.render("pieRounded")}
          </section>

          <section class="chart-section">
            <h2>Pie Chart - Custom Data Keys (dataKey, nameKey)</h2>
            <p>Using custom data structure with product/sales fields</p>
            ${api.render("pieCustomData")}
          </section>

          <section class="chart-section">
            <h2>Pie Chart - Advanced (Combined Features)</h2>
            <p>Combining paddingAngle, cornerRadius, and minAngle</p>
            ${api.render("pieAdvanced")}
          </section>
        </main>
      </div>
    `
  },
}
