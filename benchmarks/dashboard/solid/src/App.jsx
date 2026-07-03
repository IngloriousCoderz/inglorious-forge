import { For, onCleanup, onMount } from "solid-js"

import {
  CHARTS,
  getChartData,
  UPDATE_FREQUENCY,
} from "@benchmarks/dashboard-shared"

import { Chart } from "./components/Chart"
import { DataTable } from "./components/DataTable"
import { MetricsDisplay } from "./components/MetricsDisplay"
import { useDashboardState } from "./store/useDashboardState"

const RESET = 0
const ONE_SECOND = 1000

export function App() {
  const { state, filteredRows, notify, Events } = useDashboardState()

  let rafId
  let updateInterval
  let frameCount = 0
  let lastTime = performance.now()

  onMount(() => {
    const countFPS = () => {
      frameCount++
      const now = performance.now()

      if (now >= lastTime + ONE_SECOND) {
        const fps = Math.round((frameCount * ONE_SECOND) / (now - lastTime))
        notify(Events.METRICS_SET_FPS, fps)
        frameCount = RESET
        lastTime = now
      }

      rafId = requestAnimationFrame(countFPS)
    }

    rafId = requestAnimationFrame(countFPS)

    updateInterval = setInterval(() => {
      notify(Events.RANDOM_UPDATE)
    }, UPDATE_FREQUENCY)
  })

  onCleanup(() => {
    cancelAnimationFrame(rafId)
    clearInterval(updateInterval)
  })

  return (
    <div class="dashboard">
      <div class="header">
        <div class="title">SOLID SIGNALS BENCHMARK</div>
        <MetricsDisplay metrics={state.metrics} />
      </div>

      <div class="controls">
        <input
          type="text"
          placeholder="Filter by name or status..."
          value={state.metrics.filter}
          onInput={(event) =>
            notify(Events.METRICS_SET_FILTER, event.currentTarget.value)
          }
        />
        <select
          value={state.metrics.sortBy}
          onChange={(event) =>
            notify(Events.METRICS_SET_SORT, event.currentTarget.value)
          }
        >
          <option value="id">Sort by ID</option>
          <option value="value">Sort by Value</option>
          <option value="progress">Sort by Progress</option>
        </select>
      </div>

      <div class="charts">
        <For each={Object.values(CHARTS)}>
          {(chart) => <Chart chartData={getChartData(filteredRows(), chart)} />}
        </For>
      </div>

      <DataTable
        rows={filteredRows()}
        onSort={(value) => notify(Events.METRICS_SET_SORT, value)}
        onRowClick={(id) => notify(Events.TABLE_CLICK, id)}
      />

      <div class="info">
        Solid signals baseline: state is implemented with `createSignal` and
        per-row accessors so components can stay unchanged.
      </div>
    </div>
  )
}
