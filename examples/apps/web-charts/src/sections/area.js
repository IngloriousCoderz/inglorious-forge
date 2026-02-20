import { html } from "@inglorious/web"
import { chart } from "@inglorious/charts"

export function renderAreaSections(api) {
  return html`
    <div class="charts-comparison">
      <section class="chart-section">
        <h2>Area Chart - Config Style</h2>
        ${api.render("salesAreaChart")}
      </section>

      <section class="chart-section">
        <h2>Area Chart - Recharts Style (Composition with api.getEntity)</h2>
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
        <h2>Area Chart Multi Series - Config Style</h2>
        ${api.render("multiSeriesAreaChart")}
      </section>

      <section class="chart-section">
        <h2>
          Area Chart Multi Series - Recharts Style (Composition with
          api.getEntity)
        </h2>
        ${chart.renderAreaChart(
          api.getEntity("multiSeriesAreaChartComposition"),
          {
            width: 800,
            height: 400,
            dataKeys: ["Revenue", "Expenses", "Profit"],
            children: [
              chart.CartesianGrid({
                stroke: "#eee",
                strokeDasharray: "5 5",
              }),
              chart.XAxis({ dataKey: "name" }),
              chart.YAxis({ width: "auto" }),
              chart.Area({
                dataKey: "Revenue",
                fill: "#8884d8",
                fillOpacity: "0.6",
                stroke: "#8884d8",
              }),
              chart.Area({
                dataKey: "Expenses",
                fill: "#82ca9d",
                fillOpacity: "0.6",
                stroke: "#82ca9d",
              }),
              chart.Area({
                dataKey: "Profit",
                fill: "#ffc658",
                fillOpacity: "0.6",
                stroke: "#ffc658",
              }),
              chart.Dots({
                dataKey: "Revenue",
                fill: "#8884d8",
              }),
              chart.Dots({
                dataKey: "Expenses",
                fill: "#82ca9d",
              }),
              chart.Dots({
                dataKey: "Profit",
                fill: "#ffc658",
              }),
              chart.Legend({
                dataKeys: ["Revenue", "Expenses", "Profit"],
                colors: ["#8884d8", "#82ca9d", "#ffc658"],
              }),
              chart.Tooltip({}),
            ],
          },
          api,
        )}
      </section>
    </div>

    <div class="charts-comparison">
      <section class="chart-section">
        <h2>Area Chart Stacked - Config Style</h2>
        ${api.render("multiSeriesAreaChartStacked")}
      </section>

      <section class="chart-section">
        <h2>
          Area Chart Stacked - Recharts Style (Composition with api.getEntity)
        </h2>
        ${chart.renderAreaChart(
          api.getEntity("multiSeriesAreaChartStackedComposition"),
          {
            width: 800,
            height: 400,
            dataKeys: ["Revenue", "Expenses", "Profit"],
            children: [
              chart.CartesianGrid({
                stroke: "#eee",
                strokeDasharray: "5 5",
              }),
              chart.XAxis({ dataKey: "name" }),
              chart.YAxis({ width: "auto" }),
              chart.Area({
                dataKey: "Revenue",
                fill: "#8884d8",
                fillOpacity: "0.6",
                stroke: "#8884d8",
                stackId: "1",
              }),
              chart.Area({
                dataKey: "Expenses",
                fill: "#82ca9d",
                fillOpacity: "0.6",
                stroke: "#82ca9d",
                stackId: "1",
              }),
              chart.Area({
                dataKey: "Profit",
                fill: "#ffc658",
                fillOpacity: "0.6",
                stroke: "#ffc658",
                stackId: "1",
              }),
              chart.Dots({
                dataKey: "Revenue",
                fill: "#8884d8",
                stackId: "1",
              }),
              chart.Dots({
                dataKey: "Expenses",
                fill: "#82ca9d",
                stackId: "1",
              }),
              chart.Dots({
                dataKey: "Profit",
                fill: "#ffc658",
                stackId: "1",
              }),
              chart.Legend({
                dataKeys: ["Revenue", "Expenses", "Profit"],
                colors: ["#8884d8", "#82ca9d", "#ffc658"],
              }),
              chart.Tooltip({}),
            ],
          },
          api,
        )}
      </section>
    </div>
  `
}
