<script setup>
import { onMounted, onUnmounted } from "vue"

import {
  CHARTS,
  getChartData,
  UPDATE_FREQUENCY,
} from "@benchmarks/dashboard-shared"

import Chart from "./components/Chart.vue"
import DataTable from "./components/DataTable.vue"
import MetricsDisplay from "./components/MetricsDisplay.vue"
import { useDashboardStore } from "./stores/dashboard"

const RESET = 0
const ONE_SECOND = 1000

const store = useDashboardStore()

let rafId = null
let frameCount = 0
let lastTime = performance.now()
let updateInterval = null

onMounted(() => {
  const countFPS = () => {
    frameCount++
    const now = performance.now()

    if (now >= lastTime + ONE_SECOND) {
      const fps = Math.round((frameCount * ONE_SECOND) / (now - lastTime))
      store.notify(store.Events.METRICS_SET_FPS, fps)
      frameCount = RESET
      lastTime = now
    }

    rafId = requestAnimationFrame(countFPS)
  }

  rafId = requestAnimationFrame(countFPS)

  updateInterval = setInterval(() => {
    store.notify(store.Events.RANDOM_UPDATE)
  }, UPDATE_FREQUENCY)
})

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
  if (updateInterval) clearInterval(updateInterval)
})
</script>

<template>
  <div class="dashboard">
    <div class="header">
      <div class="title">🟢🧩 VUE + PINIA BENCHMARK</div>
      <MetricsDisplay :metrics="store.state.metrics" />
    </div>

    <div class="controls">
      <input
        type="text"
        placeholder="Filter by name or status..."
        :value="store.state.metrics.filter"
        @input="
          (e) => store.notify(store.Events.METRICS_SET_FILTER, e.target.value)
        "
      />
      <select
        :value="store.state.metrics.sortBy"
        @change="
          (e) => store.notify(store.Events.METRICS_SET_SORT, e.target.value)
        "
      >
        <option value="id">Sort by ID</option>
        <option value="value">Sort by Value</option>
        <option value="progress">Sort by Progress</option>
      </select>
    </div>

    <div class="charts">
      <Chart
        v-for="chart in Object.values(CHARTS)"
        :key="chart.id"
        :chart-data="getChartData(store.filteredRows, chart)"
      />
    </div>

    <DataTable
      :rows="store.filteredRows"
      @sort="(value) => store.notify(store.Events.METRICS_SET_SORT, value)"
      @row-click="(id) => store.notify(store.Events.TABLE_CLICK, id)"
    />

    <div class="info">
      Vue + Pinia baseline with same UI component shape as Inglorious:
      dashboard, metrics, chart, table, row.
    </div>
  </div>
</template>
