import { html } from "@inglorious/web"
import { chart } from "@inglorious/charts"

const composedData = [
  { name: "Jan", revenue: 120, target: 80, forecast: 110 },
  { name: "Feb", revenue: 180, target: 130, forecast: 150 },
  { name: "Mar", revenue: 90, target: 140, forecast: 120 },
  { name: "Apr", revenue: 210, target: 170, forecast: 190 },
  { name: "May", revenue: 160, target: 220, forecast: 175 },
  { name: "Jun", revenue: 200, target: 180, forecast: 195 },
  { name: "Jul", revenue: 130, target: 190, forecast: 150 },
]

export function renderAreaSections(api) {
  return html`
    <div class="charts-comparison">
      <section class="chart-section">
        <h2>Area Chart - Config Style</h2>
        ${api.render("salesAreaChart")}
      </section>

      <section class="chart-section">
        <h2>Area Chart - Recharts Style (Composition with api.getEntity)</h2>
        ${chart.render(
          {
            entity: "salesAreaChartComposition",
            width: 800,
            height: 400,
            dataKeys: ["value"],
            children: [
              chart.CartesianGrid(),
              chart.XAxis({ dataKey: "name" }),
              chart.YAxis(),
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
        <h2>Composed Area + Line + Bar - Config Style</h2>
        ${api.render("composedSalesChart")}
      </section>

      <section class="chart-section">
        <h2>Composed Area + Line + Bar - Recharts Style (Composition)</h2>
        ${chart.render(
          {
            width: 800,
            height: 400,
            data: composedData,
            children: [
              chart.CartesianGrid(),
              chart.XAxis({ dataKey: "name" }),
              chart.YAxis(),
              chart.Area({
                dataKey: "revenue",
                fill: "#8884d8",
                fillOpacity: "0.3",
                stroke: "#8884d8",
                showDots: true,
                showTooltip: true,
              }),
              chart.Bar({
                dataKey: "target",
                fill: "#82ca9d",
                showTooltip: true,
              }),
              chart.Line({
                dataKey: "forecast",
                stroke: "#ff7300",
                showDots: true,
              }),
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
        ${chart.render(
          {
            entity: "multiSeriesAreaChartComposition",
            width: 800,
            height: 400,
            dataKeys: ["Revenue", "Expenses", "Profit"],
            children: [
              chart.CartesianGrid(),
              chart.XAxis({ dataKey: "name" }),
              chart.YAxis(),
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
        ${chart.render(
          {
            entity: "multiSeriesAreaChartStackedComposition",
            width: 800,
            height: 400,
            dataKeys: ["Revenue", "Expenses", "Profit"],
            children: [
              chart.CartesianGrid(),
              chart.XAxis({ dataKey: "name" }),
              chart.YAxis(),
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
