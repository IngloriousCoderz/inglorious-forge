<script>
  export let metrics
  export let nodes
  export let leaves

  const ERROR_FPS = 30
  const WARN_FPS = 50

  $: fpsClass = metrics.fps < ERROR_FPS ? "error" : metrics.fps < WARN_FPS ? "warning" : ""
</script>

<div class="metrics">
  <div class={`metric ${fpsClass}`}>FPS(avg10): {metrics.fps}</div>
  <div class="metric">FPS(now): {metrics.fpsNow}</div>
  <div class="metric">
    30s: {metrics.benchmark.done ? "DONE" : `${metrics.benchmark.remaining}s left`}
  </div>
  <div class="metric">
    Mean/Min/Max:
    {metrics.benchmark.mean}/{metrics.benchmark.min}/{metrics.benchmark.max}
  </div>
  <div class="metric">Commit(avg10): {metrics.commitAvg10}ms</div>
  <div class="metric">Commit(now): {metrics.commitNow}ms</div>
  <div class="metric">Updates: {metrics.updateCount}</div>
  <div class="metric">Nodes: {nodes}</div>
  <div class="metric">Leaves: {leaves}</div>
</div>
