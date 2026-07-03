import { For } from "solid-js"

import { TableRow } from "./TableRow"

export const DataTable = (props) => {
  return (
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th onClick={() => props.onSort("id")}>ID</th>
            <th>Name</th>
            <th onClick={() => props.onSort("value")}>Value</th>
            <th>Status</th>
            <th onClick={() => props.onSort("progress")}>Progress</th>
          </tr>
        </thead>
        <tbody>
          <For each={props.rows}>
            {(row) => <TableRow row={row} onClick={props.onRowClick} />}
          </For>
        </tbody>
      </table>
    </div>
  )
}
