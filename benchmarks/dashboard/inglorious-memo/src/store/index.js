import { createStore } from "@inglorious/web"

import { CHARTS } from "@benchmarks/dashboard-shared"

import { UPDATE_FREQUENCY } from "@benchmarks/dashboard-shared"
import { Chart } from "../types/chart"
import { Metrics } from "../types/metrics"
import { Table } from "../types/table"

const RESET = 0
const ONE_SECOND = 1000

export const store = createStore({
  types: { Metrics, Chart, Table },
  entities: CHARTS,
  autoCreateEntities: true,
})

// FPS Counter
let frameCount = 0
let lastTime = performance.now()

const countFPS = () => {
  frameCount++
  const now = performance.now()

  if (now >= lastTime + ONE_SECOND) {
    const fps = Math.round((frameCount * ONE_SECOND) / (now - lastTime))
    store.notify("#metrics:setFPS", fps)
    frameCount = RESET
    lastTime = now
  }

  requestAnimationFrame(countFPS)
}

requestAnimationFrame(countFPS)

// Start live updates
setInterval(() => {
  store.notify(`randomUpdate`)
}, UPDATE_FREQUENCY)
