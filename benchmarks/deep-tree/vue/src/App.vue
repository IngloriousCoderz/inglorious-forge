<template>
  <div class="app">
    <div class="header">
      <div class="title">Deep Tree Sparse Updates: Vue</div>
      <MetricsPanel
        :metrics="metrics"
        :nodes="model.totalNodes"
        :leaves="model.totalLeaves"
      />
    </div>

    <div class="tree-container">
      <TreeNode :node="model.root" :leaf-values="leafValues" />
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref } from "vue"

import {
  applyCommitSample,
  applyFpsSample,
  createInitialMetrics,
  createInitialLeafValues,
  createTreeModel,
  UPDATE_INTERVAL,
  updateLeafValuesMutative,
} from "@benchmarks/deep-tree-shared"

import MetricsPanel from "./components/MetricsPanel.vue"
import TreeNode from "./components/TreeNode.vue"

const ONE_SECOND = 1000

const model = createTreeModel()
const metrics = ref(createInitialMetrics())
const leafValues = ref(createInitialLeafValues(model.leafIds))

let frameCount = 0
let lastTime = performance.now()
let rafId = 0

const countFPS = () => {
  frameCount += 1
  const now = performance.now()

  if (now >= lastTime + ONE_SECOND) {
    const fps = Math.round((frameCount * ONE_SECOND) / (now - lastTime))
    metrics.value = applyFpsSample(metrics.value, fps)
    frameCount = 0
    lastTime = now
  }

  rafId = requestAnimationFrame(countFPS)
}

rafId = requestAnimationFrame(countFPS)

const intervalId = setInterval(() => {
  const start = performance.now()

  updateLeafValuesMutative(leafValues.value, model.leafIds)
  metrics.value = {
    ...metrics.value,
    updateCount: metrics.value.updateCount + 1,
  }

  requestAnimationFrame(() => {
    metrics.value = applyCommitSample(metrics.value, performance.now() - start)
  })
}, UPDATE_INTERVAL)

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  clearInterval(intervalId)
})
</script>
