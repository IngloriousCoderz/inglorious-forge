import "@inglorious/charts/base.css"
import "@inglorious/charts/theme.css"

import { html, mount } from "@inglorious/web"

import { runBenchmark } from "../shared/harness.js"
import { createWorkload } from "../shared/workload.js"
import { createBenchmarkStore } from "./store.js"

const workload = createWorkload()
const store = createBenchmarkStore(workload.initial)

const CHARTS = [
  ["line", "Line Chart"],
  ["area", "Area Chart"],
  ["bar", "Bar Chart"],
  ["pie", "Pie Chart"],
]

mount(
  store,
  (api) => html`
    <div class="benchmark-container">
      <h1 class="title">Inglorious Charts - Config Mode</h1>
      <div class="charts-grid">
        ${CHARTS.map(
          ([id, title]) => html`
            <div class="chart-container">
              <div class="chart-title">${title}</div>
              ${api.render(id)}
            </div>
          `,
        )}
      </div>
    </div>
  `,
  document.getElementById("root"),
)

runBenchmark((datasets) => store.notify("datasetsUpdate", datasets), workload)
