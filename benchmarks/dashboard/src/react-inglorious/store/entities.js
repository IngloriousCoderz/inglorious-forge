import { generateData, ROWS_TO_GENERATE } from "../../data"

export const entities = {
  table: {
    id: "table",
    type: "table",
    data: generateData(ROWS_TO_GENERATE),
  },
  metrics: {
    id: "metrics",
    type: "metrics",
    fps: 60,
    renderTime: 0,
    updateCount: 0,
    filter: "",
    sortBy: "id",
  },
  chart1: {
    id: "chart1",
    type: "chart",
    title: "Progress Overview",
    rangeStart: 0,
    rangeEnd: 20,
  },
  chart2: {
    id: "chart2",
    type: "chart",
    title: "Value Distribution",
    rangeStart: 20,
    rangeEnd: 40,
  },
  chart3: {
    id: "chart3",
    type: "chart",
    title: "Live Updates",
    rangeStart: 40,
    rangeEnd: 60,
  },
  chart4: {
    id: "chart4",
    type: "chart",
    title: "Status Breakdown",
    rangeStart: 60,
    rangeEnd: 80,
  },
}
