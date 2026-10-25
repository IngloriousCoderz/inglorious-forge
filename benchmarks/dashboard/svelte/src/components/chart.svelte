<script>
  export let chartData
</script>

<div class="chart">
  <h3>{chartData.title}</h3>
  <div class="chart-bars">
    {#each chartData.values as value, i}
      <div
        class="bar"
        style={`height: ${(value / chartData.max) * 100}px; background-color: hsl(${(value / chartData.max) * 120}, 70%, 50%);`}
      ></div>
    {/each}
  </div>
  <div class="chart-info">Avg: {chartData.avg}</div>
</div>
