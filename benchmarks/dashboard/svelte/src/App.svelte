<script>
  import { onDestroy, onMount } from "svelte"

  import { CHARTS, getChartData, UPDATE_FREQUENCY } from "@benchmarks/dashboard-shared"

  import Chart from "./components/Chart.svelte"
  import DataTable from "./components/DataTable.svelte"
  import MetricsDisplay from "./components/MetricsDisplay.svelte"
  import { Events, filteredRows, notify, state } from "./store"

  const RESET = 0
  const ONE_SECOND = 1000

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

  onDestroy(() => {
    cancelAnimationFrame(rafId)
    clearInterval(updateInterval)
  })
</script>

<div class="dashboard">
  <div class="header">
    <div class="title">🧡 SVELTE BENCHMARK</div>
    <MetricsDisplay metrics={$state.metrics} />
  </div>

  <div class="controls">
    <input
      type="text"
      placeholder="Filter by name or status..."
      value={$state.metrics.filter}
      on:input={(e) => notify(Events.METRICS_SET_FILTER, e.target.value)}
    />
    <select
      value={$state.metrics.sortBy}
      on:change={(e) => notify(Events.METRICS_SET_SORT, e.target.value)}
    >
      <option value="id">Sort by ID</option>
      <option value="value">Sort by Value</option>
      <option value="progress">Sort by Progress</option>
    </select>
  </div>

  <div class="charts">
    {#each Object.values(CHARTS) as chart (chart.id)}
      <Chart chartData={getChartData($filteredRows, chart)} />
    {/each}
  </div>

  <DataTable
    rows={$filteredRows}
    onSort={(value) => notify(Events.METRICS_SET_SORT, value)}
    onRowClick={(id) => notify(Events.TABLE_CLICK, id)}
  />

  <div class="info">
    Svelte baseline benchmark with same UI component shape as Inglorious:
    dashboard, metrics, chart, table, row.
  </div>
</div>
