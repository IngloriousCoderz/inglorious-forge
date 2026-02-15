import { CHARTS, UPDATE_FREQUENCY } from "@benchmarks/dashboard-shared"
import { createStore } from "@inglorious/web"

import { chart } from "../types/chart"
import { metrics } from "../types/metrics"
import { table } from "../types/table"

const RESET = 0
const ONE_SECOND = 1000

export const store = createStore({
  types: { metrics, chart, table },
  entities: CHARTS,
  autoCreateEntities: true,
})

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

setInterval(() => {
  store.notify("randomUpdate")
}, UPDATE_FREQUENCY)
