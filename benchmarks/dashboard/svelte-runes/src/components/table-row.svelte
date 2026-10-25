<svelte:options runes={true} />

<script>
  let { row, onClick } = $props()
</script>

<tr onclick={() => onClick(row.id)}>
  <td>{row.rowId}</td>
  <td>{row.name}</td>
  <td>{row.value}</td>
  <td>
    <span class={`status status-${row.status.toLowerCase()}`}>{row.status}</span>
  </td>
  <td>
    <div class="progress-bar">
      <div class="progress-fill" style={`width: ${row.progress}%`}></div>
      <span class="progress-text">{row.progress}%</span>
    </div>
  </td>
</tr>
