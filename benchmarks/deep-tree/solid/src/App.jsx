import { createSignal, onCleanup, onMount } from "solid-js"
import { createStore } from "solid-js/store"

import {
  applyCommitSample,
  applyFpsSample,
  createInitialLeafValues,
  createInitialMetrics,
  createTreeModel,
  UPDATE_INTERVAL,
} from "@benchmarks/deep-tree-shared"

import { Metrics } from "./components/Metrics"
import { TreeNode } from "./components/TreeNode"

const ONE_SECOND = 1000

const model = createTreeModel()

const createRandomValue = () => Math.floor(Math.random() * 1001)

export function App() {
  const [metrics, setMetrics] = createSignal(createInitialMetrics())
  const [leafValues, setLeafValues] = createStore(
    createInitialLeafValues(model.leafIds),
  )

  let rafId = 0
  let frameCount = 0
  let lastTime = performance.now()

  const countFPS = () => {
    frameCount += 1
    const now = performance.now()

    if (now >= lastTime + ONE_SECOND) {
      const fps = Math.round((frameCount * ONE_SECOND) / (now - lastTime))
      setMetrics((prev) => applyFpsSample(prev, fps))
      frameCount = 0
      lastTime = now
    }

    rafId = requestAnimationFrame(countFPS)
  }

  onMount(() => {
    rafId = requestAnimationFrame(countFPS)

    const intervalId = setInterval(() => {
      const start = performance.now()
      const leafIds = model.leafIds
      const randomIndex = Math.floor(Math.random() * leafIds.length)
      const leafId = leafIds[randomIndex]
      const current = leafValues[leafId]

      setLeafValues(leafId, {
        value: createRandomValue(),
        version: current.version + 1,
      })

      setMetrics((prev) => ({
        ...prev,
        updateCount: prev.updateCount + 1,
      }))

      requestAnimationFrame(() => {
        setMetrics((prev) => applyCommitSample(prev, performance.now() - start))
      })
    }, UPDATE_INTERVAL)

    onCleanup(() => {
      clearInterval(intervalId)
    })
  })

  onCleanup(() => {
    cancelAnimationFrame(rafId)
  })

  return (
    <div class="app">
      <div class="header">
        <div class="title">Deep Tree Sparse Updates: Solid</div>
        <Metrics
          metrics={metrics()}
          nodes={model.totalNodes}
          leaves={model.totalLeaves}
        />
      </div>

      <div class="tree-container">
        <TreeNode node={model.root} leafValues={leafValues} />
      </div>
    </div>
  )
}
