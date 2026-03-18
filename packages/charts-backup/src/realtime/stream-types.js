import { line as lineRenderer } from "../cartesian/line.js"
import * as handlers from "../handlers.js"
import { render } from "../template.js"
import { withRealtime } from "./with-realtime.js"

const baseLineChart = {
  ...handlers,
  render,
  ...lineRenderer,
}

// Headline: realtime-enabled chart type (array composition)
export const lineChart = [baseLineChart, withRealtime]
