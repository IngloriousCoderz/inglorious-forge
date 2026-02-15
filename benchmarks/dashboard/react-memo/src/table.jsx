import { memo } from "react"

import { TableRow } from "./row"

export const Table = memo(
  ({ data, onSortById, onSortByValue, onSortByProgress, onRowClick }) => {
    return (
      <table>
        <thead>
          <tr>
            <th onClick={onSortById}>ID</th>
            <th>Name</th>
            <th onClick={onSortByValue}>Value</th>
            <th>Status</th>
            <th onClick={onSortByProgress}>Progress</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <TableRow key={row.id} row={row} onClick={onRowClick} />
          ))}
        </tbody>
      </table>
    )
  },
)

Table.displayName = "Table"
