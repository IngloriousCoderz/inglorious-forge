import { html } from "@inglorious/web"
import { chart } from "@inglorious/charts"

export function renderLineSections(api, status) {
  const { isRealtimeConfigPaused, isRealtimeCompositionPaused } = status

  return html`
    <div class="charts-comparison">
      <section class="chart-section">
        <h2>Line Chart - Config Style</h2>
        ${api.render("salesLineChart")}
      </section>

      <section class="chart-section">
        <h2>Line Chart - Recharts Style (Composition with api.getEntity)</h2>
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

    <div class="charts-comparison">
      <section class="chart-section">
        <h2>Line Chart Multi Series - Config Style</h2>
        ${api.render("multiSeriesLineChart")}
      </section>

      <section class="chart-section">
        <h2>
          Line Chart Multi Series - Recharts Style (Composition with
          api.getEntity)
        </h2>
        ${chart.renderLineChart(
          api.getEntity("multiSeriesLineChartComposition"),
          {
            width: 800,
            height: 400,
            dataKeys: ["productA", "productB", "productC", "productD"],
            children: [
              chart.CartesianGrid({
                stroke: "#eee",
                strokeDasharray: "5 5",
              }),
              chart.XAxis({ dataKey: "name" }),
              chart.YAxis({ width: "auto" }),
              chart.Line({
                dataKey: "productA",
                stroke: "#8884d8",
              }),
              chart.Line({
                dataKey: "productB",
                stroke: "#82ca9d",
              }),
              chart.Line({
                dataKey: "productC",
                stroke: "#ffc658",
              }),
              chart.Line({
                dataKey: "productD",
                stroke: "#ff8042",
              }),
              chart.Dots({
                dataKey: "productA",
                fill: "#8884d8",
              }),
              chart.Dots({
                dataKey: "productB",
                fill: "#82ca9d",
              }),
              chart.Dots({
                dataKey: "productC",
                fill: "#ffc658",
              }),
              chart.Dots({
                dataKey: "productD",
                fill: "#ff8042",
              }),
              chart.Legend({
                dataKeys: ["productA", "productB", "productC", "productD"],
                colors: ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"],
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
        <h2>Realtime Line Chart - Config Style (1 point/second)</h2>
        <p>
          Stream: ${isRealtimeConfigPaused ? "paused" : "running"}. Use Brush to
          inspect history.
        </p>
        <button
          @click=${() => api.notify("#realtimeLineChartConfig:streamPlay")}
          ?disabled=${!isRealtimeConfigPaused}
        >
          Play
        </button>
        <button
          @click=${() => api.notify("#realtimeLineChartConfig:streamPause")}
          ?disabled=${isRealtimeConfigPaused}
        >
          Pause
        </button>
        ${api.render("realtimeLineChartConfig")}
      </section>

      <section class="chart-section">
        <h2>
          Realtime Line Chart - Recharts Style (Composition, 1 point/second)
        </h2>
        <p>
          Stream: ${isRealtimeCompositionPaused ? "paused" : "running"}. Use
          Brush to inspect history.
        </p>
        <button
          @click=${() => api.notify("#realtimeLineChart:streamPlay")}
          ?disabled=${!isRealtimeCompositionPaused}
        >
          Play
        </button>
        <button
          @click=${() => api.notify("#realtimeLineChart:streamPause")}
          ?disabled=${isRealtimeCompositionPaused}
        >
          Pause
        </button>
        ${chart.renderLineChart(
          api.getEntity("realtimeLineChart"),
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
              chart.Line({ dataKey: "value", stroke: "#2563eb" }),
              chart.Dots({ dataKey: "value", fill: "#2563eb" }),
              chart.Tooltip({}),
              ...(isRealtimeCompositionPaused
                ? [chart.Brush({ height: 30 })]
                : []),
            ],
          },
          api,
        )}
      </section>
    </div>
  `
}
