import {
  Brush,
  CartesianGrid,
  Chart,
  Dots,
  Legend,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from "@inglorious/charts"
import { html } from "@inglorious/web"

const inlineLineData = [
  { name: "0", value: 40 },
  { name: "1", value: 120 },
  { name: "2", value: 90 },
  { name: "3", value: 160 },
]

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
        ${Chart.render(
          {
            entity: "salesLineChartComposition",
            width: 800,
            height: 400,
            dataKeys: ["value"],
            children: [
              CartesianGrid(),
              XAxis({ dataKey: "name" }),
              YAxis(),
              Line({ dataKey: "value", stroke: "#8884d8" }),
              Dots({ dataKey: "value", fill: "#8884d8" }),
              Tooltip(),
            ],
          },
          api,
        )}
      </section>
    </div>

    <div class="charts-comparison">
      <section class="chart-section">
        <h2>Line Chart - Composition (No entity)</h2>
        ${Chart.render(
          {
            data: inlineLineData,
            width: 600,
            height: 240,
            dataKeys: ["value"],
            children: [
              CartesianGrid(),
              XAxis({ dataKey: "name" }),
              YAxis(),
              Line({ dataKey: "value", stroke: "#2563eb" }),
              Dots({ dataKey: "value", fill: "#2563eb" }),
              Tooltip(),
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
        ${Chart.render(
          {
            entity: "lineChartWithBrush",
            width: 800,
            height: 400,
            dataKeys: ["value"],
            children: [
              CartesianGrid(),
              XAxis({ dataKey: "name" }),
              YAxis(),
              Line({ dataKey: "value", stroke: "#8884d8" }),
              Dots({ dataKey: "value", fill: "#8884d8" }),
              Tooltip(),
              Brush(),
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
        ${Chart.render(
          {
            entity: "multiSeriesLineChartComposition",
            width: 800,
            height: 400,
            dataKeys: ["productA", "productB", "productC", "productD"],
            children: [
              CartesianGrid(),
              XAxis({ dataKey: "name" }),
              YAxis(),
              Line({
                dataKey: "productA",
                stroke: "#8884d8",
              }),
              Line({
                dataKey: "productB",
                stroke: "#82ca9d",
              }),
              Line({
                dataKey: "productC",
                stroke: "#ffc658",
              }),
              Line({
                dataKey: "productD",
                stroke: "#ff8042",
              }),
              Dots({
                dataKey: "productA",
                fill: "#8884d8",
              }),
              Dots({
                dataKey: "productB",
                fill: "#82ca9d",
              }),
              Dots({
                dataKey: "productC",
                fill: "#ffc658",
              }),
              Dots({
                dataKey: "productD",
                fill: "#ff8042",
              }),
              Legend({
                dataKeys: ["productA", "productB", "productC", "productD"],
                colors: ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"],
              }),
              Tooltip(),
            ],
          },
          api,
        )}
      </section>
    </div>

    <div class="charts-comparison">
      <section class="chart-section">
        <h2>Realtime Line Chart - Config Style</h2>
        <p>
          ${
            isRealtimeConfigPaused
              ? "Stream: paused. Brush is visible for history inspection."
              : "Stream: running. Pause to show Brush and inspect history."
          }
        </p>
        <div class="stream-controls">
          <button
            class="stream-btn play"
            @click=${() => api.notify("#realtimeLineChartConfig:streamPlay")}
            ?disabled=${!isRealtimeConfigPaused}
          >
            Play
          </button>
          <button
            class="stream-btn pause"
            @click=${() => api.notify("#realtimeLineChartConfig:streamPause")}
            ?disabled=${isRealtimeConfigPaused}
          >
            Pause
          </button>
        </div>
        ${api.render("realtimeLineChartConfig")}
      </section>

      <section class="chart-section">
        <h2>Realtime Line Chart - Recharts Style</h2>
        <p>
          ${
            isRealtimeCompositionPaused
              ? "Stream: paused. Brush is visible for history inspection."
              : "Stream: running. Pause to show Brush and inspect history."
          }
        </p>
        <div class="stream-controls">
          <button
            class="stream-btn play"
            @click=${() => api.notify("#realtimeLineChart:streamPlay")}
            ?disabled=${!isRealtimeCompositionPaused}
          >
            Play
          </button>
          <button
            class="stream-btn pause"
            @click=${() => api.notify("#realtimeLineChart:streamPause")}
            ?disabled=${isRealtimeCompositionPaused}
          >
            Pause
          </button>
        </div>
        ${Chart.render(
          {
            entity: "realtimeLineChart",
            width: 800,
            height: 400,
            dataKeys: ["value"],
            children: [
              CartesianGrid(),
              XAxis({ dataKey: "name" }),
              YAxis(),
              Line({ dataKey: "value", stroke: "#2563eb" }),
              Dots({ dataKey: "value", fill: "#2563eb" }),
              Tooltip(),
              ...(isRealtimeCompositionPaused ? [Brush()] : []),
            ],
          },
          api,
        )}
      </section>
    </div>

    <div class="charts-comparison">
      <section class="chart-section">
        <h2>Smooth Line Chart - Config Style (curve, axis titles)</h2>
        ${api.render("smoothLineChart")}
      </section>

      <section class="chart-section">
        <h2>Step Line Chart - Composition (curve)</h2>
        ${Chart.render(
          {
            entity: "stepLineChartComposition",
            width: 800,
            height: 400,
            children: [
              CartesianGrid(),
              XAxis({ dataKey: "label", label: "Day" }),
              YAxis({ label: "Orders" }),
              Line({ dataKey: "value", stroke: "#2563eb", curve: "step" }),
              Tooltip(),
            ],
          },
          api,
        )}
      </section>
    </div>
  `
}
