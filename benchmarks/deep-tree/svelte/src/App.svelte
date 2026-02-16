<script>
  import { onDestroy } from "svelte"
  import { writable } from "svelte/store"

  import {
    applyCommitSample,
    applyFpsSample,
    createInitialMetrics,
    createInitialLeafValues,
    createTreeModel,
    UPDATE_INTERVAL,
    updateLeafValuesMutative,
  } from "@benchmarks/deep-tree-shared"

  import MetricsPanel from "./components/MetricsPanel.svelte"
  import TreeNode from "./components/TreeNode.svelte"

  const ONE_SECOND = 1000

  const model = createTreeModel()
  const initialLeafValues = createInitialLeafValues(model.leafIds)
  const leafValues = { ...initialLeafValues }
  const leafStores = new Map(
    Object.entries(initialLeafValues).map(([leafId, value]) => [
      leafId,
      writable(value),
    ]),
  )

  let metrics = createInitialMetrics()

  let frameCount = 0
  let lastTime = performance.now()
  let rafId

  const countFPS = () => {
    frameCount += 1
    const now = performance.now()

    if (now >= lastTime + ONE_SECOND) {
      const fps = Math.round((frameCount * ONE_SECOND) / (now - lastTime))
      metrics = applyFpsSample(metrics, fps)
      frameCount = 0
      lastTime = now
    }

    rafId = requestAnimationFrame(countFPS)
  }

  rafId = requestAnimationFrame(countFPS)

  const intervalId = setInterval(() => {
    const start = performance.now()

    const leafId = updateLeafValuesMutative(leafValues, model.leafIds)
    leafStores.get(leafId).set(leafValues[leafId])
    metrics = {
      ...metrics,
      updateCount: metrics.updateCount + 1,
    }

    requestAnimationFrame(() => {
      metrics = applyCommitSample(metrics, performance.now() - start)
    })
  }, UPDATE_INTERVAL)

  onDestroy(() => {
    cancelAnimationFrame(rafId)
    clearInterval(intervalId)
  })
</script>

<div class="app">
  <div class="header">
    <div class="title">Deep Tree Sparse Updates: Svelte</div>
    <MetricsPanel {metrics} nodes={model.totalNodes} leaves={model.totalLeaves} />
  </div>

  <div class="tree-container">
    <TreeNode node={model.root} {leafStores} />
  </div>
</div>
