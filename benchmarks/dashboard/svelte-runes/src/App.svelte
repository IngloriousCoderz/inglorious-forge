<svelte:options runes={true} />

<script>
  import { onDestroy, onMount } from "svelte"

  import {
    applyFpsSample,
    CHARTS,
    createFpsBenchmark,
    Events,
    filterAndSortRows,
    generateData,
    MAX_VALUE,
    ROWS_TO_GENERATE,
    ROWS_TO_UPDATE,
    UPDATE_FREQUENCY,
    updateData,
  } from "@benchmarks/dashboard-shared"

  import Chart from "./components/Chart.svelte"
  import DataTable from "./components/DataTable.svelte"
  import MetricsDisplay from "./components/MetricsDisplay.svelte"

  const RESET = 0
  const ONE_SECOND = 1000

  let metrics = $state({
    fps: 60,
    fpsNow: 60,
    fpsSamples: [60],
    benchmark: createFpsBenchmark(),
    renderTime: 0,
    updateCount: 0,
    filter: "",
    sortBy: "id",
  })
  let tableData = $state(generateData(ROWS_TO_GENERATE))

  const filteredRows = $derived(filterAndSortRows(tableData, metrics.filter, metrics.sortBy))

  const notify = (type, payload) => {
    if (type === Events.METRICS_SET_FPS) {
      Object.assign(metrics, applyFpsSample(metrics, payload))
      return
    }

    if (type === Events.METRICS_SET_FILTER) {
      metrics.filter = payload
      return
    }

    if (type === Events.METRICS_SET_SORT) {
      metrics.sortBy = payload
      return
    }

    if (type === Events.TABLE_CLICK) {
      tableData = tableData.map((row) =>
        row.id === payload
          ? { ...row, value: Math.floor(Math.random() * MAX_VALUE) }
          : row,
      )
      return
    }

    if (type === Events.RANDOM_UPDATE) {
      const start = performance.now()
      tableData = updateData(tableData, ROWS_TO_UPDATE)
      metrics.updateCount += 1
      metrics.renderTime = Math.round(performance.now() - start)
    }
  }

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
    <div class="title">🧡✨ SVELTE (RUNES) BENCHMARK</div>
    <MetricsDisplay {metrics} />
  </div>

  <div class="controls">
    <input
      type="text"
      placeholder="Filter by name or status..."
      value={metrics.filter}
      oninput={(e) => notify(Events.METRICS_SET_FILTER, e.target.value)}
    />
    <select
      value={metrics.sortBy}
      onchange={(e) => notify(Events.METRICS_SET_SORT, e.target.value)}
    >
      <option value="id">Sort by ID</option>
      <option value="value">Sort by Value</option>
      <option value="progress">Sort by Progress</option>
    </select>
  </div>

  <div class="charts">
    {#each Object.values(CHARTS) as chart (chart.id)}
      <Chart rows={filteredRows} {chart} />
    {/each}
  </div>

  <DataTable
    rows={filteredRows}
    onSort={(value) => notify(Events.METRICS_SET_SORT, value)}
    onRowClick={(id) => notify(Events.TABLE_CLICK, id)}
  />

  <div class="info">
    Svelte runes baseline with same UI component shape as Inglorious:
    dashboard, metrics, chart, table, row.
  </div>
</div>
