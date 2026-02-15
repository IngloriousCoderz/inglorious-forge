<svelte:options runes={true} />

<script>
  import TableRow from "./TableRow.svelte"

  let { rows, onSort, onRowClick } = $props()
</script>

<div class="table-container">
  <table>
    <thead>
      <tr>
        <th onclick={() => onSort("id")}>ID</th>
        <th>Name</th>
        <th onclick={() => onSort("value")}>Value</th>
        <th>Status</th>
        <th onclick={() => onSort("progress")}>Progress</th>
      </tr>
    </thead>
    <tbody>
      {#each rows as row (row.id)}
        <TableRow {row} onClick={onRowClick} />
      {/each}
    </tbody>
  </table>
</div>
