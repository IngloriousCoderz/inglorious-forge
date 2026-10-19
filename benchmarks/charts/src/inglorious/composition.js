import "@inglorious/charts/base.css"
import "@inglorious/charts/theme.css"

import {
  Area,
  Bar,
  CartesianGrid,
  Chart,
  Line,
  Pie,
  Tooltip,
  XAxis,
  YAxis,
} from "@inglorious/charts"
import { html, mount } from "@inglorious/web"

import { runBenchmark } from "../shared/harness.js"
import {
  AREA_OPACITY,
  createWorkload,
  GRID_COLOR,
  GRID_DASHARRAY,
  PIE_RADIUS,
  SERIES_COLOR,
  STROKE_WIDTH,
} from "../shared/workload.js"
import { createBenchmarkStore } from "./store.js"

const workload = createWorkload()
const store = createBenchmarkStore(workload.initial)

const axes = () => [
  CartesianGrid({ stroke: GRID_COLOR, strokeDasharray: GRID_DASHARRAY }),
  XAxis({ dataKey: "name" }),
  YAxis(),
]

const CHARTS = [
  {
    id: "line",
    title: "Line Chart",
    children: [
      ...axes(),
      Line({
        dataKey: "value",
        stroke: SERIES_COLOR,
        strokeWidth: STROKE_WIDTH,
      }),
      Tooltip(),
    ],
  },
  {
    id: "area",
    title: "Area Chart",
    children: [
      ...axes(),
      Area({
        dataKey: "value",
        fill: SERIES_COLOR,
        stroke: SERIES_COLOR,
        fillOpacity: AREA_OPACITY,
        strokeWidth: STROKE_WIDTH,
      }),
      Tooltip(),
    ],
  },
  {
    id: "bar",
    title: "Bar Chart",
    children: [
      ...axes(),
      Bar({ dataKey: "value", fill: SERIES_COLOR }),
      Tooltip(),
    ],
  },
  {
    id: "pie",
    title: "Pie Chart",
    children: [
      Pie({
        dataKey: "value",
        nameKey: "name",
        outerRadius: PIE_RADIUS,
        hasLabel: true,
      }),
      Tooltip(),
    ],
  },
]

mount(
  store,
  (api) => html`
    <div class="benchmark-container">
      <h1 class="title">Inglorious Charts - Composition Mode</h1>
      <div class="charts-grid">
        ${CHARTS.map(
          ({ id, title, children }) => html`
            <div class="chart-container">
              <div class="chart-title">${title}</div>
              ${Chart.render({ entity: id, children }, api)}
            </div>
          `,
        )}
      </div>
    </div>
  `,
  document.getElementById("root"),
)

runBenchmark((datasets) => store.notify("datasetsUpdate", datasets), workload)
