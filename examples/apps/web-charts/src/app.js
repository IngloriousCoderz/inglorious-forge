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
              <h2>Line Chart - Recharts Style (Composition)</h2>
              ${chart(api, "salesLineChartComposition", (c) =>
                c.renderLineChart(
                  [
                    c.renderCartesianGrid({
                      stroke: "#eee",
                      strokeDasharray: "5 5",
                    }),
                    c.renderXAxis({ dataKey: "name" }),
                    c.renderYAxis({ width: "auto" }),
                    c.renderLine({ dataKey: "value", stroke: "#8884d8" }),
                    c.renderDots({ dataKey: "value", fill: "#8884d8" }),
                    c.renderTooltip({}),
                  ],
                  { width: 800, height: 400, dataKeys: ["value"] },
                ),
              )}
            </section>
          </div>

          <div class="charts-comparison">
            <section class="chart-section">
              <h2>Line Chart with Brush - Zoom & Pan</h2>
              <p>
                Use the brush below the chart to zoom and pan through the data.
                Drag the handles to resize, or drag the middle to pan.
              </p>
              ${chart(api, "lineChartWithBrush", (c) =>
                c.renderLineChart(
                  [
                    c.renderCartesianGrid({
                      stroke: "#eee",
                      strokeDasharray: "5 5",
                    }),
                    c.renderXAxis({ dataKey: "name" }),
                    c.renderYAxis({ width: "auto" }),
                    c.renderLine({ dataKey: "value", stroke: "#8884d8" }),
                    c.renderDots({ dataKey: "value", fill: "#8884d8" }),
                    c.renderTooltip({}),
                    c.renderBrush({ dataKey: "name", height: 30 }),
                  ],
                  { width: 800, height: 400, dataKeys: ["value"] },
                ),
              )}
            </section>
          </div>

          <div class="charts-comparison">
            <section class="chart-section">
              <h2>Line Chart - Multiple Series (Config Style)</h2>
              ${api.render("multiSeriesLineChart")}
            </section>

            <section class="chart-section">
              <h2>Line Chart - Multiple Series (Recharts Style)</h2>
              ${chart(api, "multiSeriesLineChartComposition", (c) =>
                c.renderLineChart(
                  [
                    c.renderCartesianGrid({
                      stroke: "#eee",
                      strokeDasharray: "5 5",
                    }),
                    c.renderXAxis({ dataKey: "name" }),
                    c.renderYAxis({ width: "auto" }),
                    c.renderLegend({
                      dataKeys: [
                        "productA",
                        "productB",
                        "productC",
                        "productD",
                      ],
                      labels: [
                        "Product A",
                        "Product B",
                        "Product C",
                        "Product D",
                      ],
                      colors: ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"],
                    }),
                    c.renderLine({
                      dataKey: "productA",
                      stroke: "#8884d8",
                      showDots: true,
                    }),
                    c.renderLine({
                      dataKey: "productB",
                      stroke: "#82ca9d",
                      showDots: true,
                    }),
                    c.renderLine({
                      dataKey: "productC",
                      stroke: "#ffc658",
                      showDots: true,
                    }),
                    c.renderLine({
                      dataKey: "productD",
                      stroke: "#ff7300",
                      showDots: true,
                    }),
                    c.renderTooltip({}),
                  ],
                  {
                    width: 800,
                    height: 400,
                    dataKeys: ["productA", "productB", "productC", "productD"],
                  },
                ),
              )}
            </section>
          </div>

          <div class="charts-comparison">
            <section class="chart-section">
              <h2>Area Chart - Config Style</h2>
              ${api.render("salesAreaChart")}
            </section>

            <section class="chart-section">
              <h2>Area Chart - Recharts Style (Composition)</h2>
              ${chart(api, "salesAreaChartComposition", (c) =>
                c.renderAreaChart(
                  [
                    c.renderCartesianGrid({
                      stroke: "#eee",
                      strokeDasharray: "5 5",
                    }),
                    c.renderXAxis({ dataKey: "name" }),
                    c.renderYAxis({ width: "auto" }),
                    c.renderArea({
                      dataKey: "value",
                      fill: "#8884d8",
                      fillOpacity: "0.6",
                      stroke: "#8884d8",
                    }),
                    c.renderDots({ dataKey: "value", fill: "#8884d8" }),
                    c.renderTooltip({}),
                  ],
                  { width: 800, height: 400, dataKeys: ["value"] },
                ),
              )}
            </section>
          </div>

          <div class="charts-comparison">
            <section class="chart-section">
              <h2>Area Chart - Multiple Series (Config Style)</h2>
              ${api.render("multiSeriesAreaChart")}
            </section>

            <section class="chart-section">
              <h2>Area Chart - Multiple Series (Recharts Style)</h2>
              ${chart(api, "multiSeriesAreaChartComposition", (c) =>
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
                      stroke: "#3b82f6",
                      fill: "#3b82f6",
                      fillOpacity: "0.5",
                    }),
                    c.renderDots({ dataKey: "uv", fill: "#3b82f6" }),
                    c.renderArea({
                      dataKey: "pv",
                      stroke: "#10b981",
                      fill: "#10b981",
                      fillOpacity: "0.5",
                    }),
                    c.renderDots({ dataKey: "pv", fill: "#10b981" }),
                    c.renderArea({
                      dataKey: "amt",
                      stroke: "#ec4899",
                      fill: "#ec4899",
                      fillOpacity: "0.5",
                    }),
                    c.renderDots({ dataKey: "amt", fill: "#ec4899" }),
                    c.renderTooltip({}),
                  ],
                  {
                    width: 800,
                    height: 400,
                    dataKeys: ["uv", "pv", "amt"],
                  },
                ),
              )}
            </section>
          </div>

          <div class="charts-comparison">
            <section class="chart-section">
              <h2>Area Chart - Multiple Series Stacked (Config Style)</h2>
              ${api.render("multiSeriesAreaChartStacked")}
            </section>

            <section class="chart-section">
              <h2>Area Chart - Multiple Series Stacked (Recharts Style)</h2>
              ${chart(api, "multiSeriesAreaChartStackedComposition", (c) =>
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
                      stackId: "1",
                      stroke: "#3b82f6",
                      fill: "#3b82f6",
                      fillOpacity: "0.6",
                    }),
                    c.renderDots({
                      dataKey: "uv",
                      stackId: "1",
                      fill: "#3b82f6",
                    }),
                    c.renderArea({
                      dataKey: "pv",
                      stackId: "1",
                      stroke: "#10b981",
                      fill: "#10b981",
                      fillOpacity: "0.6",
                    }),
                    c.renderDots({
                      dataKey: "pv",
                      stackId: "1",
                      fill: "#10b981",
                    }),
                    c.renderArea({
                      dataKey: "amt",
                      stackId: "1",
                      stroke: "#ec4899",
                      fill: "#ec4899",
                      fillOpacity: "0.6",
                    }),
                    c.renderDots({
                      dataKey: "amt",
                      stackId: "1",
                      fill: "#ec4899",
                    }),
                    c.renderTooltip({}),
                  ],
                  {
                    width: 800,
                    height: 400,
                    stacked: true,
                    dataKeys: ["uv", "pv", "amt"],
                  },
                ),
              )}
            </section>
          </div>

          <div class="charts-comparison">
            <section class="chart-section">
              <h2>Bar Chart - Config Style</h2>
              ${api.render("salesBarChart")}
            </section>

            <section class="chart-section">
              <h2>Bar Chart - Recharts Style (Composition)</h2>
              ${chart(api, "salesBarChartComposition", (c) =>
                c.renderBarChart(
                  [
                    c.renderCartesianGrid({
                      stroke: "#eee",
                      strokeDasharray: "3 3",
                    }),
                    c.renderXAxis({ dataKey: "label" }),
                    c.renderYAxis({ width: "auto" }),
                    c.renderBar({ dataKey: "value" }),
                    c.renderTooltip({}),
                  ],
                  { width: 800, height: 400 },
                ),
              )}
            </section>
          </div>

          <div class="charts-comparison">
            <section class="chart-section">
              <h2>Pie Chart - Config Style</h2>
              ${api.render("categoryPieChart")}
            </section>

            <section class="chart-section">
              <h2>Pie Chart - Recharts Style (Composition)</h2>
              ${chart(api, "categoryPieChartComposition", (c) =>
                c.renderPieChart(
                  [
                    c.renderPie({
                      dataKey: "value",
                      nameKey: "name",
                      cx: "50%",
                      cy: "50%",
                      // Match roughly the same visual size as the config-style pie
                      outerRadius: 140,
                      label: true,
                    }),
                  ],
                  {
                    width: 500,
                    height: 400,
                  },
                ),
              )}
            </section>
          </div>

          <div class="charts-comparison">
            <section class="chart-section">
              <h2>Donut Chart - Config Style</h2>
              ${api.render("categoryDonutChart")}
            </section>

            <section class="chart-section">
              <h2>Donut Chart - Recharts Style (Composition)</h2>
              ${chart(api, "categoryDonutChartComposition", (c) =>
                c.renderPieChart(
                  [
                    c.renderPie({
                      dataKey: "value",
                      nameKey: "name",
                      cx: "50%",
                      cy: "50%",
                      outerRadius: 140,
                      innerRadius: 84, // 0.6 * 140
                      label: true,
                    }),
                  ],
                  {
                    width: 500,
                    height: 400,
                  },
                ),
              )}
            </section>
          </div>

          <div class="charts-comparison">
            <section class="chart-section">
              <h2>Pie Chart - Custom Position (cx, cy) - Config Style</h2>
              ${api.render("pieCustomPosition")}
              <p>Pie chart positioned at 35% from top-left</p>
            </section>

            <section class="chart-section">
              <h2>Pie Chart - Custom Position (cx, cy) - Recharts Style</h2>
              ${chart(api, "pieCustomPositionComposition", (c) =>
                c.renderPieChart(
                  [
                    c.renderPie({
                      dataKey: "value",
                      nameKey: "name",
                      cx: "35%",
                      cy: "35%",
                      outerRadius: 140,
                      label: true,
                    }),
                  ],
                  {
                    width: 500,
                    height: 400,
                  },
                ),
              )}
              <p>Pie chart positioned at 35% from top-left</p>
            </section>
          </div>

          <div class="charts-comparison">
            <section class="chart-section">
              <h2>Pie Chart - Partial (startAngle, endAngle) - Config Style</h2>
              <p>Half circle pie chart (180° to 0°)</p>
              ${api.render("piePartial")}
            </section>

            <section class="chart-section">
              <h2>
                Pie Chart - Partial (startAngle, endAngle) - Recharts Style
              </h2>
              <p>Half circle pie chart (180° to 0°)</p>
              ${chart(api, "piePartialComposition", (c) =>
                c.renderPieChart(
                  [
                    c.renderPie({
                      dataKey: "value",
                      nameKey: "name",
                      cx: "50%",
                      cy: "50%",
                      outerRadius: 140,
                      startAngle: 180,
                      endAngle: 0,
                      label: true,
                    }),
                  ],
                  {
                    width: 500,
                    height: 400,
                  },
                ),
              )}
            </section>
          </div>

          <div class="charts-comparison">
            <section class="chart-section">
              <h2>Pie Chart - With Padding (paddingAngle) - Config Style</h2>
              <p>5 degrees gap between each sector</p>
              ${api.render("pieWithPadding")}
            </section>

            <section class="chart-section">
              <h2>Pie Chart - With Padding (paddingAngle) - Recharts Style</h2>
              <p>5 degrees gap between each sector</p>
              ${chart(api, "pieWithPaddingComposition", (c) =>
                c.renderPieChart(
                  [
                    c.renderPie({
                      dataKey: "value",
                      nameKey: "name",
                      cx: "50%",
                      cy: "50%",
                      outerRadius: 140,
                      paddingAngle: 5,
                      label: true,
                    }),
                  ],
                  {
                    width: 500,
                    height: 400,
                  },
                ),
              )}
            </section>
          </div>

          <div class="charts-comparison">
            <section class="chart-section">
              <h2>Pie Chart - Minimum Angle (minAngle) - Config Style</h2>
              <p>Each sector has at least 10 degrees</p>
              ${api.render("pieMinAngle")}
            </section>

            <section class="chart-section">
              <h2>Pie Chart - Minimum Angle (minAngle) - Recharts Style</h2>
              <p>Each sector has at least 10 degrees</p>
              ${chart(api, "pieMinAngleComposition", (c) =>
                c.renderPieChart(
                  [
                    c.renderPie({
                      dataKey: "value",
                      nameKey: "name",
                      cx: "50%",
                      cy: "50%",
                      outerRadius: 140,
                      minAngle: 10,
                      label: true,
                    }),
                  ],
                  {
                    width: 500,
                    height: 400,
                  },
                ),
              )}
            </section>
          </div>

          <div class="charts-comparison">
            <section class="chart-section">
              <h2>Pie Chart - Rounded Corners (cornerRadius) - Config Style</h2>
              <p>Rounded edges with 10px corner radius</p>
              ${api.render("pieRounded")}
            </section>

            <section class="chart-section">
              <h2>
                Pie Chart - Rounded Corners (cornerRadius) - Recharts Style
              </h2>
              <p>Rounded edges with 10px corner radius</p>
              ${chart(api, "pieRoundedComposition", (c) =>
                c.renderPieChart(
                  [
                    c.renderPie({
                      dataKey: "value",
                      nameKey: "name",
                      cx: "50%",
                      cy: "50%",
                      outerRadius: 140,
                      cornerRadius: 10,
                      label: true,
                    }),
                  ],
                  {
                    width: 500,
                    height: 400,
                  },
                ),
              )}
            </section>
          </div>

          <div class="charts-comparison">
            <section class="chart-section">
              <h2>
                Pie Chart - Custom Data Keys (dataKey, nameKey) - Config Style
              </h2>
              <p>Using custom data structure with product/sales fields</p>
              ${api.render("pieCustomData")}
            </section>

            <section class="chart-section">
              <h2>
                Pie Chart - Custom Data Keys (dataKey, nameKey) - Recharts Style
              </h2>
              <p>Using custom data structure with product/sales fields</p>
              ${chart(api, "pieCustomDataComposition", (c) =>
                c.renderPieChart(
                  [
                    c.renderPie({
                      dataKey: "sales",
                      nameKey: "product",
                      cx: "50%",
                      cy: "50%",
                      outerRadius: 140,
                      label: true,
                    }),
                  ],
                  {
                    width: 500,
                    height: 400,
                  },
                ),
              )}
            </section>
          </div>

          <div class="charts-comparison">
            <section class="chart-section">
              <h2>Pie Chart - Advanced (Combined Features) - Config Style</h2>
              <p>Combining paddingAngle, cornerRadius, and minAngle</p>
              ${api.render("pieAdvanced")}
            </section>

            <section class="chart-section">
              <h2>Pie Chart - Advanced (Combined Features) - Recharts Style</h2>
              <p>Combining paddingAngle, cornerRadius, and minAngle</p>
              ${chart(api, "pieAdvancedComposition", (c) =>
                c.renderPieChart(
                  [
                    c.renderPie({
                      dataKey: "value",
                      nameKey: "name",
                      cx: "50%",
                      cy: "50%",
                      outerRadius: 140,
                      paddingAngle: 3,
                      cornerRadius: 8,
                      minAngle: 5,
                      label: true,
                    }),
                  ],
                  {
                    width: 500,
                    height: 400,
                  },
                ),
              )}
            </section>
          </div>
        </main>
      </div>
    `
  },
}
