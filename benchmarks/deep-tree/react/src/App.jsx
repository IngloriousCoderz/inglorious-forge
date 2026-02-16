import { useEffect, useMemo, useState } from "react"

import {
  applyCommitSample,
  applyFpsSample,
  createInitialMetrics,
  createInitialLeafValues,
  createTreeModel,
  UPDATE_INTERVAL,
  updateLeafValuesMutative,
} from "@benchmarks/deep-tree-shared"

import { Metrics } from "./components/Metrics"
import { TreeNode } from "./components/TreeNode"

const ONE_SECOND = 1000

const model = createTreeModel()

const createLeafStore = (initialLeafValues) => {
  const values = { ...initialLeafValues }
  const listenersByLeaf = new Map()

  const get = (leafId) => values[leafId]

  const subscribe = (leafId, listener) => {
    if (!listenersByLeaf.has(leafId)) {
      listenersByLeaf.set(leafId, new Set())
    }

    const leafListeners = listenersByLeaf.get(leafId)
    leafListeners.add(listener)

    return () => {
      leafListeners.delete(listener)
      if (leafListeners.size === 0) {
        listenersByLeaf.delete(leafId)
      }
    }
  }

  const updateRandomLeaf = () => {
    const updatedLeafId = updateLeafValuesMutative(values, model.leafIds)
    const leafListeners = listenersByLeaf.get(updatedLeafId)
    if (leafListeners) {
      leafListeners.forEach((listener) => listener())
    }
  }

  return {
    get,
    subscribe,
    updateRandomLeaf,
  }
}

export const App = () => {
  const [metrics, setMetrics] = useState(createInitialMetrics)
  const leafStore = useMemo(
    () => createLeafStore(createInitialLeafValues(model.leafIds)),
    [],
  )

  useEffect(() => {
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

    rafId = requestAnimationFrame(countFPS)

    return () => cancelAnimationFrame(rafId)
  }, [])

  useEffect(() => {
    const intervalId = setInterval(() => {
      const start = performance.now()

      leafStore.updateRandomLeaf()
      setMetrics((prev) => ({ ...prev, updateCount: prev.updateCount + 1 }))

      requestAnimationFrame(() => {
        setMetrics((prev) => applyCommitSample(prev, performance.now() - start))
      })
    }, UPDATE_INTERVAL)

    return () => clearInterval(intervalId)
  }, [leafStore])

  return (
    <div className="app">
      <div className="header">
        <div className="title">Deep Tree Sparse Updates: React</div>
        <Metrics
          metrics={metrics}
          nodes={model.totalNodes}
          leaves={model.totalLeaves}
        />
      </div>

      <div className="tree-container">
        <TreeNode node={model.root} leafStore={leafStore} />
      </div>
    </div>
  )
}
