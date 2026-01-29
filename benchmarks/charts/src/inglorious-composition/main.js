import { mount } from "@inglorious/web"
import { html } from "@inglorious/web"
import { chart } from "@inglorious/charts"
import "@inglorious/charts/base.css"
import "@inglorious/charts/theme.css"

import { updateChartData } from "../utils.js"
import { store } from "./store/index.js"

// FPS Counter - optimized to only trigger re-render when FPS actually changes
let fps = 0
let lastDisplayedFps = 0
let frameCount = 0
let lastTime = performance.now()

const countFPS = () => {
  frameCount++
  const now = performance.now()

  if (now >= lastTime + 1000) {
    const newFps = Math.round((frameCount * 1000) / (now - lastTime))
    frameCount = 0
    lastTime = now

    // Only trigger re-render if FPS changed significantly (avoid unnecessary renders)
    if (Math.abs(newFps - lastDisplayedFps) >= 1) {
      fps = newFps
      lastDisplayedFps = newFps
      store.notify("fpsUpdate")
    }
  }

  requestAnimationFrame(countFPS)
}

requestAnimationFrame(countFPS)

// App render function
const app = {
  render(api) {
    return html`
      <div class="benchmark-container">
        <div class="header">
          <h1 class="title">Inglorious Charts - Composition Mode</h1>
          <div class="metrics">
            <div
              class="metric fps ${fps < 30
                ? "error"
                : fps < 60
                  ? "warning"
                  : ""}"
            >
              FPS: ${fps}
            </div>
          </div>
        </div>
        <div class="charts-grid">
          <div class="chart-container">
            <div class="chart-title">Line Chart</div>
            ${chart(api, "lineChart1", (c) =>
              c.renderLineChart(
                [
                  c.renderCartesianGrid({
                    stroke: "#eee",
                    strokeDasharray: "5 5",
                  }),
                  c.renderXAxis({ dataKey: "name" }),
                  c.renderYAxis({ width: "auto" }),
                  c.renderLine({
                    dataKey: "value",
                    stroke: "#8884d8",
                    showDots: true,
                  }),
                  c.renderTooltip({}),
                ],
                { width: 400, height: 300, dataKeys: ["value"] },
              ),
            )}
          </div>
          <div class="chart-container">
            <div class="chart-title">Area Chart</div>
            ${chart(api, "areaChart1", (c) =>
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
                { width: 400, height: 300, dataKeys: ["value"] },
              ),
            )}
          </div>
          <div class="chart-container">
            <div class="chart-title">Bar Chart</div>
            ${chart(api, "barChart1", (c) =>
              c.renderBarChart(
                [
                  c.renderCartesianGrid({
                    stroke: "#eee",
                    strokeDasharray: "5 5",
                  }),
                  c.renderXAxis({ dataKey: "name" }),
                  c.renderYAxis({ width: "auto" }),
                  c.renderBar({ dataKey: "value", fill: "#8884d8" }),
                  c.renderTooltip({}),
                ],
                { width: 400, height: 300, dataKeys: ["value"] },
              ),
            )}
          </div>
          <div class="chart-container">
            <div class="chart-title">Pie Chart</div>
            ${chart(api, "pieChart1", (c) =>
              c.renderPieChart(
                [
                  c.renderPie({
                    dataKey: "value",
                    nameKey: "label",
                    cx: "50%",
                    cy: "50%",
                    outerRadius: 80,
                  }),
                  c.renderTooltip({}),
                ],
                { width: 400, height: 300 },
              ),
            )}
          </div>
        </div>
      </div>
    `
  },
}

// Mount app
mount(store, app.render, document.getElementById("root"))

// Update data periodically
setInterval(() => {
  const state = store.getState()
  const lineEntity = state.lineChart1
  const areaEntity = state.areaChart1
  const barEntity = state.barChart1
  const pieEntity = state.pieChart1

  if (lineEntity) {
    lineEntity.data = updateChartData(lineEntity.data)
    store.notify(`#lineChart1:update`)
  }
  if (areaEntity) {
    areaEntity.data = updateChartData(areaEntity.data)
    store.notify(`#areaChart1:update`)
  }
  if (barEntity) {
    barEntity.data = updateChartData(barEntity.data)
    store.notify(`#barChart1:update`)
  }
  if (pieEntity) {
    const pieData = updateChartData(
      pieEntity.data.map((d) => ({
        name: d.label,
        value: d.value,
      })),
    )
    pieEntity.data = pieData.map((d) => ({
      label: d.name,
      value: d.value,
    }))
    store.notify(`#pieChart1:update`)
  }
}, 100)
