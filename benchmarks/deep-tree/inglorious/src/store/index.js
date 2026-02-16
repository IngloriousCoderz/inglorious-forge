import { UPDATE_INTERVAL } from "@benchmarks/deep-tree-shared"
import { createStore } from "@inglorious/web"

import { metrics } from "../types/metrics"
import { tree } from "../types/tree"

const ONE_SECOND = 1000

export const store = createStore({
  types: {
    metrics,
    tree,
  },
  entities: {
    metrics: { id: "metrics", type: "metrics" },
    tree: { id: "tree", type: "tree" },
  },
})

let frameCount = 0
let lastTime = performance.now()

const countFPS = () => {
  frameCount += 1
  const now = performance.now()

  if (now >= lastTime + ONE_SECOND) {
    const fps = Math.round((frameCount * ONE_SECOND) / (now - lastTime))
    store.notify("#metrics:setFPS", fps)
    frameCount = 0
    lastTime = now
  }

  requestAnimationFrame(countFPS)
}

requestAnimationFrame(countFPS)

setInterval(() => {
  const start = performance.now()
  store.notify("randomUpdate")

  requestAnimationFrame(() => {
    store.notify("#metrics:setCommit", performance.now() - start)
  })
}, UPDATE_INTERVAL)
