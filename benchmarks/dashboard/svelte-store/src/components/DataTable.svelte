<script>
  import TableRow from "./TableRow.svelte"

  export let rows
  export let onSort
  export let onRowClick
</script>

<div class="table-container">
  <table>
    <thead>
      <tr>
        <th on:click={() => onSort("id")}>ID</th>
        <th>Name</th>
        <th on:click={() => onSort("value")}>Value</th>
        <th>Status</th>
        <th on:click={() => onSort("progress")}>Progress</th>
      </tr>
    </thead>
    <tbody>
      {#each rows as row (row.id)}
        <TableRow {row} onClick={onRowClick} />
      {/each}
    </tbody>
  </table>
</div>
